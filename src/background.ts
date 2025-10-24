// Email Guard Background Service Worker
// Handles storage, verification requests, and cross-tab communication

import { initializeMultiAIDetector, getMultiAIDetector, type AIProvider } from './services/multi-ai-detector';
import { BUILTIN_GITHUB_TOKEN, hasBuiltInToken, AI_CONFIG } from './config';

// Initialize AI Detector
let aiDetector: ReturnType<typeof initializeMultiAIDetector> | null = null;

// Initialize AI on startup
async function initializeAI() {
  try {
    const { aiDetectionEnabled, aiProvider, aiApiKey, aiModel } = await chrome.storage.local.get([
      'aiDetectionEnabled',
      'aiProvider',
      'aiApiKey',
      'aiModel'
    ]);

    if (!aiDetectionEnabled) {
      console.log('ℹ️  AI Detection disabled by user');
      return;
    }

    const provider = (aiProvider || 'builtin') as AIProvider | 'builtin';

    // Use built-in AI if selected or no custom provider configured
    if (provider === 'builtin' || !aiApiKey) {
      if (hasBuiltInToken()) {
        console.log('🤖 Initializing built-in AI (GitHub Models)...');
        aiDetector = initializeMultiAIDetector({
          enabled: true,
          provider: 'github',
          apiKey: BUILTIN_GITHUB_TOKEN,
          model: aiModel || AI_CONFIG.model,
          confidenceThreshold: AI_CONFIG.confidenceThreshold
        });
        console.log('✅ Built-in AI enabled');
      } else {
        console.log('⚠️  No built-in AI token available');
      }
    } else {
      // Use custom provider
      console.log(`🤖 Initializing AI with ${provider}...`);
      aiDetector = initializeMultiAIDetector({
        enabled: true,
        provider: provider as AIProvider,
        apiKey: aiApiKey,
        model: aiModel || undefined,
        confidenceThreshold: AI_CONFIG.confidenceThreshold
      });
      console.log(`✅ AI enabled with ${provider}`);
    }
  } catch (error) {
    console.error('❌ Failed to initialize AI:', error);
  }
}

// Setup automatic policy updates
async function setupPolicyUpdates() {
  // Create alarm for periodic policy fetching (every hour)
  chrome.alarms.create('fetchOrganizationPolicies', {
    periodInMinutes: 60
  });
  
  // Fetch policies immediately if in organization mode
  const { mode, organizationConfig } = await chrome.storage.local.get(['mode', 'organizationConfig']);
  
  if (mode === 'organization' && organizationConfig?.policyUrl) {
    console.log('📋 Initial policy fetch for organization mode');
    await fetchOrganizationPolicies(organizationConfig.policyUrl);
  }
}

// Handle alarm events
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'fetchOrganizationPolicies') {
    const { mode, organizationConfig } = await chrome.storage.local.get(['mode', 'organizationConfig']);
    
    if (mode === 'organization' && organizationConfig?.policyUrl) {
      console.log('⏰ Periodic policy update triggered');
      await fetchOrganizationPolicies(organizationConfig.policyUrl);
    }
  }
});

// Initialize AI on extension load
initializeAI();

// Setup automatic policy updates
setupPolicyUpdates();

// Initialize default settings on install
chrome.runtime.onInstalled.addListener(async () => {
  const defaults = {
    enabled: true,
    mode: "personal", // 'personal' or 'organization'
    expectedSenders: [],
    expectedLinkDomains: {},
    whitelistedSenders: [],
    whitelistedDomains: [],
    organizationConfig: null,
    privacyMode: "local", // 'local' or 'enhanced'
    alertHistory: [],
    statistics: {
      totalEmailsScanned: 0,
      threatsBlocked: 0,
      lastScan: null,
    },
  };

  const existing = await chrome.storage.local.get(Object.keys(defaults));
  const toSet = {};

  for (const [key, value] of Object.entries(defaults)) {
    if (existing[key] === undefined) {
      toSet[key] = value;
    }
  }

  if (Object.keys(toSet).length > 0) {
    await chrome.storage.local.set(toSet);
  }

  console.log("Email Guard initialized");
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "verifyEmail") {
    handleEmailVerification(request.data)
      .then((result) => sendResponse({ success: true, result }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (request.action === "verifyDomain") {
    handleDomainVerification(request.domain)
      .then((result) => sendResponse({ success: true, result }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === "logAlert") {
    logAlert(request.alert)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === "updateStatistics") {
    updateStatistics(request.stats)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === "getSettings") {
    getSettings()
      .then((settings) => sendResponse({ success: true, settings }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === "updateAIConfig") {
    handleAIConfigUpdate(request)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === "testAIConnection") {
    handleAIConnectionTest(request)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, message: error.message }));
    return true;
  }

  if (request.action === "fetchOrganizationPolicies") {
    fetchOrganizationPolicies(request.policyUrl)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Email verification handler
async function handleEmailVerification(emailData) {
  const settings = await getSettings();

  if (!settings.enabled) {
    return { safe: true, alerts: [] };
  }

  const alerts = [];
  const { sender, links, subject, replyTo } = emailData;

  // Extract domain from email
  const senderDomain = extractDomain(sender);
  const senderEmail = sender.toLowerCase();

  // Check 1: Expected sender verification
  const expectedSenderCheck = await checkExpectedSender(
    senderEmail,
    senderDomain,
    settings
  );
  if (expectedSenderCheck.alert) {
    alerts.push(expectedSenderCheck.alert);
  }

  // Check 2: Whitelisted sender
  const isWhitelisted = settings.whitelistedSenders.some(
    (ws) => ws === senderEmail || senderEmail.endsWith("@" + ws)
  );

  // Check 3: Reply-To mismatch
  if (replyTo && replyTo.toLowerCase() !== senderEmail) {
    alerts.push({
      severity: "medium",
      type: "reply_to_mismatch",
      message: "Reply-To address differs from sender",
      details: `Sender: ${sender}, Reply-To: ${replyTo}`,
      recommendation: "Verify the sender before replying",
    });
  }

  // Check 4: Domain verification (if enhanced mode)
  if (settings.privacyMode === "enhanced" && !isWhitelisted) {
    const domainCheck = await verifyDomainInfrastructure(senderDomain);
    if (domainCheck.alerts.length > 0) {
      alerts.push(...domainCheck.alerts);
    }
  }

  // Check 5: Link verification
  if (links && links.length > 0) {
    for (const link of links) {
      const linkChecks = await verifyLink(
        link,
        senderEmail,
        senderDomain,
        settings
      );
      if (linkChecks.length > 0) {
        alerts.push(...linkChecks);
      }
    }
  }

  // Check 6: Homograph/Punycode detection in sender
  const homographCheck = detectHomograph(senderDomain);
  if (homographCheck.suspicious) {
    alerts.push({
      severity: "high",
      type: "homograph_domain",
      message: "Suspicious domain characters detected",
      details: homographCheck.details,
      recommendation: "This may be a look-alike domain. Verify carefully.",
    });
  }

  // Check 7: AI-Powered Analysis (if available)
  if (aiDetector && aiDetector.isAvailable() && !isWhitelisted) {
    try {
      console.log('🤖 Running AI analysis...');
      const aiResult = await aiDetector.analyzeEmail({
        sender: sender,
        subject: subject || '',
        body: emailData.body || '',
        links: links || [],
        replyTo: replyTo
      });

      if (aiResult && aiResult.isPhishing && aiResult.confidence >= AI_CONFIG.confidenceThreshold) {
        alerts.push({
          severity: aiResult.confidence > 0.85 ? 'high' : 'medium',
          type: 'ai_phishing_detection',
          message: `${aiResult.provider} detected potential phishing (${Math.round(aiResult.confidence * 100)}% confidence)`,
          details: aiResult.reasons.join('; '),
          recommendation: aiResult.recommendation,
          aiAnalysis: {
            confidence: aiResult.confidence,
            threats: aiResult.detectedThreats,
            provider: aiResult.provider
          }
        });
        console.log(`⚠️  ${aiResult.provider} flagged as phishing:`, aiResult);
      } else if (aiResult) {
        console.log(`✅ ${aiResult.provider} analysis complete - no threats detected`);
      }
    } catch (error: any) {
      console.error('AI analysis error:', error);
      const errorMsg = aiDetector.getLastError();
      if (errorMsg) {
        console.error('Detailed error:', errorMsg);
      }
      // Continue with traditional checks even if AI fails
    }
  }

  return {
    safe: alerts.length === 0,
    alerts,
    isWhitelisted,
    senderDomain,
  };
}

// Check if sender is in expected list
async function checkExpectedSender(senderEmail, senderDomain, settings) {
  const expectedSenders = settings.expectedSenders || [];

  // If no expected senders configured, skip this check
  if (expectedSenders.length === 0) {
    return { alert: null };
  }

  const isExpected = expectedSenders.some((expected) => {
    if (expected.includes("@")) {
      return expected.toLowerCase() === senderEmail;
    } else {
      return senderDomain === expected.toLowerCase();
    }
  });

  if (!isExpected) {
    return {
      alert: {
        severity: "medium",
        type: "unexpected_sender",
        message: "Sender not in expected list",
        details: `${senderEmail} is not in your expected senders list`,
        recommendation: "Verify this sender before interacting with the email",
      },
    };
  }

  return { alert: null };
}

// Verify domain infrastructure
async function verifyDomainInfrastructure(domain) {
  const alerts = [];

  try {
    // Note: In a real implementation, this would call a backend API
    // For now, we'll use heuristics and local checks

    // Check for common suspicious patterns
    const suspiciousPatterns = [
      /\d{5,}/, // Many numbers
      /[-]{2,}/, // Multiple hyphens
      /^[a-z]{20,}$/, // Very long random string
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(domain)) {
        alerts.push({
          severity: "medium",
          type: "suspicious_domain_pattern",
          message: "Domain has suspicious pattern",
          details: `Domain "${domain}" matches suspicious pattern`,
          recommendation: "Verify the sender legitimacy",
        });
        break;
      }
    }

    // Check for newly registered domains (would need API in production)
    // This is a placeholder for the concept
  } catch (error) {
    console.error("Domain verification error:", error);
  }

  return { alerts };
}

// Verify individual link
async function verifyLink(link, senderEmail, senderDomain, settings) {
  const alerts = [];

  try {
    const { displayText, href } = link;
    const linkDomain = extractDomain(href);

    // Check 1: Display text vs href mismatch
    if (displayText && displayText !== href) {
      const displayDomain = extractDomainFromText(displayText);
      if (displayDomain && displayDomain !== linkDomain) {
        alerts.push({
          severity: "high",
          type: "link_text_mismatch",
          message: "Link text does not match actual destination",
          details: `Shows "${displayText}" but goes to "${href}"`,
          recommendation:
            "Do not click this link. This is a common phishing technique.",
        });
      }
    }

    // Check 2: Punycode/Homograph in link
    const homographCheck = detectHomograph(linkDomain);
    if (homographCheck.suspicious) {
      alerts.push({
        severity: "high",
        type: "homograph_link",
        message: "Link contains suspicious characters",
        details: homographCheck.details,
        recommendation: "This may be a look-alike domain. Do not click.",
      });
    }

    // Check 3: Expected link domains for this sender
    const expectedLinkDomains =
      settings.expectedLinkDomains[senderEmail] ||
      settings.expectedLinkDomains[senderDomain] ||
      [];

    if (expectedLinkDomains.length > 0) {
      const isExpectedDomain = expectedLinkDomains.some(
        (expected) =>
          linkDomain === expected.toLowerCase() ||
          linkDomain.endsWith("." + expected.toLowerCase())
      );

      if (!isExpectedDomain) {
        alerts.push({
          severity: "high",
          type: "unexpected_link_domain",
          message: "Link domain not expected from this sender",
          details: `${senderEmail} sent link to ${linkDomain}, but expected domains are: ${expectedLinkDomains.join(", ")}`,
          recommendation: "Verify with sender before clicking",
        });
      }
    }

    // Check 4: Whitelisted domains
    const isWhitelistedDomain = settings.whitelistedDomains.some(
      (wd) =>
        linkDomain === wd.toLowerCase() ||
        linkDomain.endsWith("." + wd.toLowerCase())
    );

    if (!isWhitelistedDomain) {
      // Check for common phishing domains
      const phishingKeywords = [
        "login",
        "verify",
        "secure",
        "account",
        "update",
        "confirm",
        "suspended",
      ];
      const hasPhishingKeyword = phishingKeywords.some(
        (keyword) =>
          linkDomain.includes(keyword) || href.toLowerCase().includes(keyword)
      );

      if (hasPhishingKeyword) {
        alerts.push({
          severity: "medium",
          type: "suspicious_link_keywords",
          message: "Link contains common phishing keywords",
          details: `Link to ${linkDomain} contains suspicious keywords`,
          recommendation: "Be cautious. Verify the legitimacy before clicking.",
        });
      }
    }

    // Check 5: IP address links
    if (/^https?:\/\/\d+\.\d+\.\d+\.\d+/.test(href)) {
      alerts.push({
        severity: "high",
        type: "ip_address_link",
        message: "Link uses IP address instead of domain",
        details: `Link goes directly to IP address: ${href}`,
        recommendation:
          "Legitimate sites rarely use IP addresses. Do not click.",
      });
    }

    // Check 6: Shortened URLs
    const shortenerDomains = [
      "bit.ly",
      "tinyurl.com",
      "goo.gl",
      "t.co",
      "ow.ly",
      "is.gd",
    ];
    if (shortenerDomains.some((sd) => linkDomain.includes(sd))) {
      alerts.push({
        severity: "medium",
        type: "url_shortener",
        message: "Link uses URL shortener",
        details: `Link uses ${linkDomain} which hides the real destination`,
        recommendation: "Use caution. The real destination is hidden.",
      });
    }
  } catch (error) {
    console.error("Link verification error:", error);
  }

  return alerts;
}

// Detect homograph/punycode attacks
function detectHomograph(domain) {
  // Check for punycode
  if (domain.includes("xn--")) {
    return {
      suspicious: true,
      details: `Domain uses punycode (${domain}), which may be used to impersonate legitimate domains`,
    };
  }

  // Check for mixed scripts or confusable characters
  const confusableChars = /[а-яА-Я]|[α-ωΑ-Ω]|[ａ-ｚＡ-Ｚ]/; // Cyrillic, Greek, Fullwidth
  if (confusableChars.test(domain)) {
    return {
      suspicious: true,
      details: `Domain contains non-Latin characters that may look like Latin letters: ${domain}`,
    };
  }

  // Check for common brand impersonation patterns
  const commonBrands = [
    "paypal",
    "amazon",
    "microsoft",
    "google",
    "apple",
    "facebook",
    "netflix",
  ];
  for (const brand of commonBrands) {
    if (domain.includes(brand) && !domain.endsWith(brand + ".com")) {
      // Check if it's a suspicious variation
      const variations = [
        brand + "-",
        brand + "secure",
        brand + "verify",
        brand + "login",
        "secure" + brand,
        "verify" + brand,
      ];

      if (variations.some((v) => domain.includes(v))) {
        return {
          suspicious: true,
          details: `Domain appears to impersonate ${brand}: ${domain}`,
        };
      }
    }
  }

  return { suspicious: false };
}

// Extract domain from email or URL
function extractDomain(input) {
  if (!input) return "";

  // If it's an email
  if (input.includes("@")) {
    return input.split("@")[1].toLowerCase();
  }

  // If it's a URL
  try {
    const url = new URL(input);
    return url.hostname.toLowerCase();
  } catch {
    return input.toLowerCase();
  }
}

// Extract domain from text (for display text comparison)
function extractDomainFromText(text) {
  if (!text) return null;

  // Try to find domain-like pattern
  const domainPattern = /([a-z0-9-]+\.)+[a-z]{2,}/i;
  const match = text.match(domainPattern);
  return match ? match[0].toLowerCase() : null;
}

// Log alert to history
async function logAlert(alert) {
  const { alertHistory = [] } = await chrome.storage.local.get("alertHistory");

  const logEntry = {
    ...alert,
    timestamp: Date.now(),
    id: generateId(),
    emailUrl: alert.emailUrl || null, // Store email URL for navigation
  };

  alertHistory.unshift(logEntry);

  // Keep only last 1000 alerts
  if (alertHistory.length > 1000) {
    alertHistory.splice(1000);
  }

  await chrome.storage.local.set({ alertHistory });
}

// Update statistics
async function updateStatistics(stats) {
  const { statistics = {} } = await chrome.storage.local.get("statistics");

  const updated = {
    totalEmailsScanned:
      (statistics.totalEmailsScanned || 0) + (stats.scanned || 0),
    threatsBlocked: (statistics.threatsBlocked || 0) + (stats.blocked || 0),
    lastScan: Date.now(),
  };

  await chrome.storage.local.set({ statistics: updated });
}

// Fetch organization policies from URL
async function fetchOrganizationPolicies(policyUrl: string) {
  try {
    console.log(`📋 Fetching organization policies from: ${policyUrl}`);
    
    const response = await fetch(policyUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const policies = await response.json();
    
    // Validate policy structure
    if (!validateOrganizationPolicy(policies)) {
      throw new Error('Invalid policy format');
    }
    
    // Apply policies to storage
    const updates: any = {};
    
    if (policies.expectedSenders) {
      updates.expectedSenders = policies.expectedSenders;
    }
    
    if (policies.expectedLinkDomains) {
      updates.expectedLinkDomains = policies.expectedLinkDomains;
    }
    
    if (policies.whitelistedSenders) {
      updates.whitelistedSenders = policies.whitelistedSenders;
    }
    
    if (policies.whitelistedDomains) {
      updates.whitelistedDomains = policies.whitelistedDomains;
    }
    
    // Update organization config with fetch status
    const { organizationConfig } = await chrome.storage.local.get('organizationConfig');
    if (organizationConfig) {
      organizationConfig.lastPolicyFetch = Date.now();
      organizationConfig.policyFetchError = undefined;
      updates.organizationConfig = organizationConfig;
    }
    
    await chrome.storage.local.set(updates);
    
    console.log('✅ Organization policies applied successfully');
    console.log('Policies:', {
      expectedSenders: policies.expectedSenders?.length || 0,
      expectedLinkDomains: Object.keys(policies.expectedLinkDomains || {}).length,
      whitelistedSenders: policies.whitelistedSenders?.length || 0,
      whitelistedDomains: policies.whitelistedDomains?.length || 0
    });
    
    return {
      success: true,
      message: 'Policies loaded successfully',
      policiesApplied: {
        expectedSenders: policies.expectedSenders?.length || 0,
        whitelistedSenders: policies.whitelistedSenders?.length || 0,
        whitelistedDomains: policies.whitelistedDomains?.length || 0
      }
    };
  } catch (error: any) {
    console.error('❌ Failed to fetch organization policies:', error);
    
    // Update organization config with error
    const { organizationConfig } = await chrome.storage.local.get('organizationConfig');
    if (organizationConfig) {
      organizationConfig.policyFetchError = error.message;
      await chrome.storage.local.set({ organizationConfig });
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Validate organization policy structure
function validateOrganizationPolicy(policy: any): boolean {
  if (!policy || typeof policy !== 'object') {
    return false;
  }
  
  // At least one policy field should be present
  const hasValidField = 
    Array.isArray(policy.expectedSenders) ||
    (policy.expectedLinkDomains && typeof policy.expectedLinkDomains === 'object') ||
    Array.isArray(policy.whitelistedSenders) ||
    Array.isArray(policy.whitelistedDomains);
  
  return hasValidField;
}

// Handle AI connection test
async function handleAIConnectionTest(request) {
  const { provider, apiKey, model } = request;
  
  try {
    const selectedProvider = (provider || 'builtin') as AIProvider | 'builtin';
    
    // Test built-in AI
    if (selectedProvider === 'builtin') {
      if (hasBuiltInToken()) {
        const testDetector = initializeMultiAIDetector({
          enabled: true,
          provider: 'github',
          apiKey: BUILTIN_GITHUB_TOKEN,
          model: model || AI_CONFIG.model,
          confidenceThreshold: AI_CONFIG.confidenceThreshold
        });
        
        const result = await testDetector.testConnection();
        return result;
      } else {
        return {
          success: false,
          message: '❌ Built-in AI not available'
        };
      }
    }
    
    // Test custom provider
    if (!apiKey) {
      return {
        success: false,
        message: '❌ API key required'
      };
    }
    
    const testDetector = initializeMultiAIDetector({
      enabled: true,
      provider: selectedProvider as AIProvider,
      apiKey: apiKey,
      model: model || undefined,
      confidenceThreshold: AI_CONFIG.confidenceThreshold
    });
    
    const result = await testDetector.testConnection();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: `❌ ${error.message}`
    };
  }
}

// Handle AI configuration updates from popup
async function handleAIConfigUpdate(request) {
  const { enabled, provider, apiKey, model } = request;
  
  try {
    if (!enabled) {
      // Disable AI
      aiDetector = null;
      await chrome.storage.local.set({ aiDetectionEnabled: false });
      console.log('ℹ️  AI Detection disabled');
      return;
    }

    const selectedProvider = (provider || 'builtin') as AIProvider | 'builtin';

    // Use built-in AI if selected or no API key provided
    if (selectedProvider === 'builtin' || !apiKey) {
      if (hasBuiltInToken()) {
        console.log('🤖 Switching to built-in AI...');
        aiDetector = initializeMultiAIDetector({
          enabled: true,
          provider: 'github',
          apiKey: BUILTIN_GITHUB_TOKEN,
          model: model || AI_CONFIG.model,
          confidenceThreshold: AI_CONFIG.confidenceThreshold
        });
        
        await chrome.storage.local.set({
          aiDetectionEnabled: true,
          aiProvider: 'builtin',
          aiApiKey: null,
          aiModel: model || null
        });
        
        console.log('✅ Built-in AI enabled');
      } else {
        throw new Error('Built-in AI not available');
      }
    } else {
      // Use custom provider
      console.log(`🤖 Configuring ${selectedProvider}...`);
      aiDetector = initializeMultiAIDetector({
        enabled: true,
        provider: selectedProvider as AIProvider,
        apiKey: apiKey,
        model: model || undefined,
        confidenceThreshold: AI_CONFIG.confidenceThreshold
      });
      
      await chrome.storage.local.set({
        aiDetectionEnabled: true,
        aiProvider: selectedProvider,
        aiApiKey: apiKey,
        aiModel: model || null
      });
      
      console.log(`✅ AI enabled with ${selectedProvider}`);
    }
  } catch (error: any) {
    console.error('Failed to update AI config:', error);
    throw error;
  }
}

// Get all settings
async function getSettings() {
  const data = await chrome.storage.local.get([
    "enabled",
    "mode",
    "expectedSenders",
    "expectedLinkDomains",
    "whitelistedSenders",
    "whitelistedDomains",
    "organizationConfig",
    "privacyMode",
  ]);

  return data;
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Handle domain verification requests
async function handleDomainVerification(domain) {
  // This would call external APIs in production
  // For now, return basic analysis
  return {
    domain,
    hasMX: null, // Would check MX records
    hasDMARC: null, // Would check DMARC
    hasSPF: null, // Would check SPF
    domainAge: null, // Would check WHOIS
    reputation: "unknown",
  };
}
