// Email Guard Background Service Worker
// Handles storage, verification requests, and cross-tab communication

// Initialize default settings on install
chrome.runtime.onInstalled.addListener(async () => {
  const defaults = {
    enabled: true,
    mode: 'personal', // 'personal' or 'organization'
    expectedSenders: [],
    expectedLinkDomains: {},
    whitelistedSenders: [],
    whitelistedDomains: [],
    organizationConfig: null,
    privacyMode: 'local', // 'local' or 'enhanced'
    alertHistory: [],
    statistics: {
      totalEmailsScanned: 0,
      threatsBlocked: 0,
      lastScan: null
    }
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
  
  console.log('Email Guard initialized');
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'verifyEmail') {
    handleEmailVerification(request.data)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'verifyDomain') {
    handleDomainVerification(request.domain)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'logAlert') {
    logAlert(request.alert)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'updateStatistics') {
    updateStatistics(request.stats)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'getSettings') {
    getSettings()
      .then(settings => sendResponse({ success: true, settings }))
      .catch(error => sendResponse({ success: false, error: error.message }));
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
  const expectedSenderCheck = await checkExpectedSender(senderEmail, senderDomain, settings);
  if (expectedSenderCheck.alert) {
    alerts.push(expectedSenderCheck.alert);
  }
  
  // Check 2: Whitelisted sender
  const isWhitelisted = settings.whitelistedSenders.some(ws => 
    ws === senderEmail || senderEmail.endsWith('@' + ws)
  );
  
  // Check 3: Reply-To mismatch
  if (replyTo && replyTo.toLowerCase() !== senderEmail) {
    alerts.push({
      severity: 'medium',
      type: 'reply_to_mismatch',
      message: 'Reply-To address differs from sender',
      details: `Sender: ${sender}, Reply-To: ${replyTo}`,
      recommendation: 'Verify the sender before replying'
    });
  }
  
  // Check 4: Domain verification (if enhanced mode)
  if (settings.privacyMode === 'enhanced' && !isWhitelisted) {
    const domainCheck = await verifyDomainInfrastructure(senderDomain);
    if (domainCheck.alerts.length > 0) {
      alerts.push(...domainCheck.alerts);
    }
  }
  
  // Check 5: Link verification
  if (links && links.length > 0) {
    for (const link of links) {
      const linkChecks = await verifyLink(link, senderEmail, senderDomain, settings);
      if (linkChecks.length > 0) {
        alerts.push(...linkChecks);
      }
    }
  }
  
  // Check 6: Homograph/Punycode detection in sender
  const homographCheck = detectHomograph(senderDomain);
  if (homographCheck.suspicious) {
    alerts.push({
      severity: 'high',
      type: 'homograph_domain',
      message: 'Suspicious domain characters detected',
      details: homographCheck.details,
      recommendation: 'This may be a look-alike domain. Verify carefully.'
    });
  }
  
  return {
    safe: alerts.length === 0,
    alerts,
    isWhitelisted,
    senderDomain
  };
}

// Check if sender is in expected list
async function checkExpectedSender(senderEmail, senderDomain, settings) {
  const expectedSenders = settings.expectedSenders || [];
  
  // If no expected senders configured, skip this check
  if (expectedSenders.length === 0) {
    return { alert: null };
  }
  
  const isExpected = expectedSenders.some(expected => {
    if (expected.includes('@')) {
      return expected.toLowerCase() === senderEmail;
    } else {
      return senderDomain === expected.toLowerCase();
    }
  });
  
  if (!isExpected) {
    return {
      alert: {
        severity: 'medium',
        type: 'unexpected_sender',
        message: 'Sender not in expected list',
        details: `${senderEmail} is not in your expected senders list`,
        recommendation: 'Verify this sender before interacting with the email'
      }
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
          severity: 'medium',
          type: 'suspicious_domain_pattern',
          message: 'Domain has suspicious pattern',
          details: `Domain "${domain}" matches suspicious pattern`,
          recommendation: 'Verify the sender legitimacy'
        });
        break;
      }
    }
    
    // Check for newly registered domains (would need API in production)
    // This is a placeholder for the concept
    
  } catch (error) {
    console.error('Domain verification error:', error);
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
          severity: 'high',
          type: 'link_text_mismatch',
          message: 'Link text does not match actual destination',
          details: `Shows "${displayText}" but goes to "${href}"`,
          recommendation: 'Do not click this link. This is a common phishing technique.'
        });
      }
    }
    
    // Check 2: Punycode/Homograph in link
    const homographCheck = detectHomograph(linkDomain);
    if (homographCheck.suspicious) {
      alerts.push({
        severity: 'high',
        type: 'homograph_link',
        message: 'Link contains suspicious characters',
        details: homographCheck.details,
        recommendation: 'This may be a look-alike domain. Do not click.'
      });
    }
    
    // Check 3: Expected link domains for this sender
    const expectedLinkDomains = settings.expectedLinkDomains[senderEmail] || 
                                settings.expectedLinkDomains[senderDomain] || [];
    
    if (expectedLinkDomains.length > 0) {
      const isExpectedDomain = expectedLinkDomains.some(expected => 
        linkDomain === expected.toLowerCase() || linkDomain.endsWith('.' + expected.toLowerCase())
      );
      
      if (!isExpectedDomain) {
        alerts.push({
          severity: 'high',
          type: 'unexpected_link_domain',
          message: 'Link domain not expected from this sender',
          details: `${senderEmail} sent link to ${linkDomain}, but expected domains are: ${expectedLinkDomains.join(', ')}`,
          recommendation: 'Verify with sender before clicking'
        });
      }
    }
    
    // Check 4: Whitelisted domains
    const isWhitelistedDomain = settings.whitelistedDomains.some(wd =>
      linkDomain === wd.toLowerCase() || linkDomain.endsWith('.' + wd.toLowerCase())
    );
    
    if (!isWhitelistedDomain) {
      // Check for common phishing domains
      const phishingKeywords = ['login', 'verify', 'secure', 'account', 'update', 'confirm', 'suspended'];
      const hasPhishingKeyword = phishingKeywords.some(keyword => 
        linkDomain.includes(keyword) || href.toLowerCase().includes(keyword)
      );
      
      if (hasPhishingKeyword) {
        alerts.push({
          severity: 'medium',
          type: 'suspicious_link_keywords',
          message: 'Link contains common phishing keywords',
          details: `Link to ${linkDomain} contains suspicious keywords`,
          recommendation: 'Be cautious. Verify the legitimacy before clicking.'
        });
      }
    }
    
    // Check 5: IP address links
    if (/^https?:\/\/\d+\.\d+\.\d+\.\d+/.test(href)) {
      alerts.push({
        severity: 'high',
        type: 'ip_address_link',
        message: 'Link uses IP address instead of domain',
        details: `Link goes directly to IP address: ${href}`,
        recommendation: 'Legitimate sites rarely use IP addresses. Do not click.'
      });
    }
    
    // Check 6: Shortened URLs
    const shortenerDomains = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd'];
    if (shortenerDomains.some(sd => linkDomain.includes(sd))) {
      alerts.push({
        severity: 'medium',
        type: 'url_shortener',
        message: 'Link uses URL shortener',
        details: `Link uses ${linkDomain} which hides the real destination`,
        recommendation: 'Use caution. The real destination is hidden.'
      });
    }
    
  } catch (error) {
    console.error('Link verification error:', error);
  }
  
  return alerts;
}

// Detect homograph/punycode attacks
function detectHomograph(domain) {
  // Check for punycode
  if (domain.includes('xn--')) {
    return {
      suspicious: true,
      details: `Domain uses punycode (${domain}), which may be used to impersonate legitimate domains`
    };
  }
  
  // Check for mixed scripts or confusable characters
  const confusableChars = /[а-яА-Я]|[α-ωΑ-Ω]|[ａ-ｚＡ-Ｚ]/; // Cyrillic, Greek, Fullwidth
  if (confusableChars.test(domain)) {
    return {
      suspicious: true,
      details: `Domain contains non-Latin characters that may look like Latin letters: ${domain}`
    };
  }
  
  // Check for common brand impersonation patterns
  const commonBrands = ['paypal', 'amazon', 'microsoft', 'google', 'apple', 'facebook', 'netflix'];
  for (const brand of commonBrands) {
    if (domain.includes(brand) && !domain.endsWith(brand + '.com')) {
      // Check if it's a suspicious variation
      const variations = [
        brand + '-',
        brand + 'secure',
        brand + 'verify',
        brand + 'login',
        'secure' + brand,
        'verify' + brand
      ];
      
      if (variations.some(v => domain.includes(v))) {
        return {
          suspicious: true,
          details: `Domain appears to impersonate ${brand}: ${domain}`
        };
      }
    }
  }
  
  return { suspicious: false };
}

// Extract domain from email or URL
function extractDomain(input) {
  if (!input) return '';
  
  // If it's an email
  if (input.includes('@')) {
    return input.split('@')[1].toLowerCase();
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
  const { alertHistory = [] } = await chrome.storage.local.get('alertHistory');
  
  const logEntry = {
    ...alert,
    timestamp: Date.now(),
    id: generateId()
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
  const { statistics = {} } = await chrome.storage.local.get('statistics');
  
  const updated = {
    totalEmailsScanned: (statistics.totalEmailsScanned || 0) + (stats.scanned || 0),
    threatsBlocked: (statistics.threatsBlocked || 0) + (stats.blocked || 0),
    lastScan: Date.now()
  };
  
  await chrome.storage.local.set({ statistics: updated });
}

// Get all settings
async function getSettings() {
  const data = await chrome.storage.local.get([
    'enabled',
    'mode',
    'expectedSenders',
    'expectedLinkDomains',
    'whitelistedSenders',
    'whitelistedDomains',
    'organizationConfig',
    'privacyMode'
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
    reputation: 'unknown'
  };
}
