// Email Guard Popup Script

// Type definitions (inline to avoid import issues)
type AlertSeverity = 'low' | 'medium' | 'high';
type AlertType = string;

interface Alert {
  severity: AlertSeverity;
  type: AlertType;
  message: string;
  details: string;
  recommendation: string;
  sender?: string;
  subject?: string;
  timestamp?: number;
  id?: string;
  emailUrl?: string | null;
}

document.addEventListener('DOMContentLoaded', async (): Promise<void> => {
  // Initialize
  await loadSettings();
  await loadStatistics();
  await loadAlerts();
  
  // Setup event listeners
  setupTabNavigation();
  setupToggleListeners();
  setupFormListeners();
  setupActionListeners();
});

// Tab Navigation
function setupTabNavigation(): void {
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.tab-panel');
  
  tabs.forEach((tab: Element) => {
    tab.addEventListener('click', () => {
      const targetTab = (tab as HTMLElement).dataset.tab;
      
      // Update active tab
      tabs.forEach((t: Element) => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update active panel
      panels.forEach((p: Element) => p.classList.remove('active'));
      document.getElementById(targetTab!)!.classList.add('active');
    });
  });
}

// Toggle Listeners
function setupToggleListeners(): void {
  // Enable/Disable toggle
  const enabledToggle = document.getElementById('enabledToggle') as HTMLInputElement;
  enabledToggle.addEventListener('change', async (e: Event) => {
    await chrome.storage.local.set({ enabled: (e.target as HTMLInputElement).checked });
    updateStatus((e.target as HTMLInputElement).checked);
  });
  
  // Organization mode toggle
  const orgModeToggle = document.getElementById('orgModeToggle') as HTMLInputElement;
  orgModeToggle.addEventListener('change', (e: Event) => {
    const orgSettings = document.getElementById('orgSettings')!;
    const orgStats = document.getElementById('orgStats')!;
    
    if ((e.target as HTMLInputElement).checked) {
      orgSettings.style.display = 'block';
      orgStats.style.display = 'block';
    } else {
      orgSettings.style.display = 'none';
      orgStats.style.display = 'none';
    }
    
    chrome.storage.local.set({ mode: (e.target as HTMLInputElement).checked ? 'organization' : 'personal' });
  });
  
  // AI Detection toggle
  const aiDetectionToggle = document.getElementById('aiDetectionToggle') as HTMLInputElement;
  const aiSettings = document.getElementById('aiSettings')!;
  
  aiDetectionToggle.addEventListener('change', async (e: Event) => {
    const enabled = (e.target as HTMLInputElement).checked;
    await chrome.storage.local.set({ aiDetectionEnabled: enabled });
    aiSettings.style.display = enabled ? 'block' : 'none';
  });

  // AI Provider selection
  const aiProviderSelect = document.getElementById('aiProviderSelect') as HTMLSelectElement;
  const customProviderSettings = document.getElementById('customProviderSettings')!;
  const providerHelpText = document.getElementById('providerHelpText')!;
  const modelHelpText = document.getElementById('modelHelpText')!;

  const providerInfo: Record<string, { help: string; model: string; link: string }> = {
    builtin: {
      help: 'Using our built-in AI service. No configuration needed!',
      model: 'Default model: GPT-4o',
      link: ''
    },
    github: {
      help: 'Get your token at: <a href="https://github.com/settings/tokens" target="_blank">github.com/settings/tokens</a>',
      model: 'Default: gpt-4o, or try: gpt-4o-mini',
      link: 'https://github.com/settings/tokens'
    },
    openai: {
      help: 'Get your API key at: <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com/api-keys</a>',
      model: 'Default: gpt-4o, or try: gpt-4o-mini, gpt-3.5-turbo',
      link: 'https://platform.openai.com/api-keys'
    },
    anthropic: {
      help: 'Get your API key at: <a href="https://console.anthropic.com/settings/keys" target="_blank">console.anthropic.com</a>',
      model: 'Default: claude-3-5-sonnet-20241022, or try: claude-3-5-haiku-20241022',
      link: 'https://console.anthropic.com/settings/keys'
    },
    gemini: {
      help: 'Get your API key at: <a href="https://makersuite.google.com/app/apikey" target="_blank">Google AI Studio</a>',
      model: 'Default: gemini-1.5-pro, or try: gemini-1.5-flash',
      link: 'https://makersuite.google.com/app/apikey'
    },
    groq: {
      help: 'Get your API key at: <a href="https://console.groq.com/keys" target="_blank">console.groq.com/keys</a> (Free & Fast!)',
      model: 'Default: llama-3.3-70b-versatile, or try: mixtral-8x7b-32768',
      link: 'https://console.groq.com/keys'
    }
  };

  aiProviderSelect.addEventListener('change', (e: Event) => {
    const provider = (e.target as HTMLSelectElement).value;
    
    if (provider === 'builtin') {
      customProviderSettings.style.display = 'none';
    } else {
      customProviderSettings.style.display = 'block';
      const info = providerInfo[provider];
      providerHelpText.innerHTML = info.help;
      modelHelpText.textContent = info.model;
    }
  });

  // Save AI Configuration
  const saveAiConfigBtn = document.getElementById('saveAiConfigBtn')!;
  saveAiConfigBtn.addEventListener('click', async () => {
    await saveAIConfiguration();
  });

  // Test AI Connection
  const testAiConnectionBtn = document.getElementById('testAiConnectionBtn')!;
  testAiConnectionBtn.addEventListener('click', async () => {
    await testAIConnection();
  });
}

// Form Listeners
function setupFormListeners(): void {
  // Privacy mode
  const privacyMode = document.getElementById('privacyMode') as HTMLSelectElement;
  privacyMode.addEventListener('change', (e: Event) => {
    chrome.storage.local.set({ privacyMode: (e.target as HTMLSelectElement).value });
  });
  
  // Add expected sender
  document.getElementById('addExpectedSenderBtn')!.addEventListener('click', async () => {
    const input = document.getElementById('expectedSenderInput') as HTMLInputElement;
    const value = input.value.trim().toLowerCase();
    
    if (!value) return;
    
    const { expectedSenders = [] } = await chrome.storage.local.get('expectedSenders');
    
    if (!expectedSenders.includes(value)) {
      expectedSenders.push(value);
      await chrome.storage.local.set({ expectedSenders });
      renderExpectedSenders(expectedSenders);
    }
    
    input.value = '';
  });
  
  // Add link domain
  document.getElementById('addLinkDomainBtn')!.addEventListener('click', async () => {
    const senderInput = document.getElementById('linkSenderInput') as HTMLInputElement;
    const domainInput = document.getElementById('linkDomainInput') as HTMLInputElement;
    
    const sender = senderInput.value.trim().toLowerCase();
    const domain = domainInput.value.trim().toLowerCase();
    
    if (!sender || !domain) return;
    
    const { expectedLinkDomains = {} } = await chrome.storage.local.get('expectedLinkDomains');
    
    if (!expectedLinkDomains[sender]) {
      expectedLinkDomains[sender] = [];
    }
    
    if (!expectedLinkDomains[sender].includes(domain)) {
      expectedLinkDomains[sender].push(domain);
      await chrome.storage.local.set({ expectedLinkDomains });
      renderLinkDomains(expectedLinkDomains);
    }
    
    senderInput.value = '';
    domainInput.value = '';
  });
  
  // Add whitelisted domain
  document.getElementById('addWhitelistedDomainBtn')!.addEventListener('click', async () => {
    const input = document.getElementById('whitelistedDomainInput') as HTMLInputElement;
    const value = input.value.trim().toLowerCase();
    
    if (!value) return;
    
    const { whitelistedDomains = [] } = await chrome.storage.local.get('whitelistedDomains');
    
    if (!whitelistedDomains.includes(value)) {
      whitelistedDomains.push(value);
      await chrome.storage.local.set({ whitelistedDomains });
      renderWhitelistedDomains(whitelistedDomains);
    }
    
    input.value = '';
  });
  
  // Save GitHub token for AI
  document.getElementById('saveGithubTokenBtn')!.addEventListener('click', async () => {
    const tokenInput = document.getElementById('githubTokenInput') as HTMLInputElement;
    const token = tokenInput.value.trim();
    const statusDiv = document.getElementById('aiStatus')!;
    
    if (!token) {
      statusDiv.textContent = '❌ Please enter a valid GitHub token';
      statusDiv.style.background = '#fee';
      statusDiv.style.color = '#c00';
      return;
    }
    
    // Save token securely
    await chrome.storage.local.set({ githubToken: token });
    
    // Notify background script to initialize AI
    chrome.runtime.sendMessage({ 
      action: 'updateAIConfig', 
      enabled: true,
      token 
    }, (response) => {
      if (response && response.success) {
        statusDiv.textContent = '✅ AI Detection enabled successfully!';
        statusDiv.style.background = '#efe';
        statusDiv.style.color = '#060';
        tokenInput.value = '';
      } else {
        statusDiv.textContent = '❌ Failed to initialize AI. Check your token.';
        statusDiv.style.background = '#fee';
        statusDiv.style.color = '#c00';
      }
    });
  });
  
  // Save organization config
  document.getElementById('saveOrgConfigBtn')!.addEventListener('click', async () => {
    const orgName = (document.getElementById('orgName') as HTMLInputElement).value.trim();
    const orgAdminEmail = (document.getElementById('orgAdminEmail') as HTMLInputElement).value.trim();
    const orgPolicyUrl = (document.getElementById('orgPolicyUrl') as HTMLInputElement).value.trim();
    
    // Validate inputs
    if (!orgName) {
      showNotification('Organization name is required', 'error');
      return;
    }
    
    if (!orgAdminEmail || !isValidEmail(orgAdminEmail)) {
      showNotification('Valid admin email is required', 'error');
      return;
    }
    
    if (orgPolicyUrl && !isValidUrl(orgPolicyUrl)) {
      showNotification('Invalid policy URL format', 'error');
      return;
    }
    
    const organizationConfig = {
      name: orgName,
      adminEmail: orgAdminEmail,
      policyUrl: orgPolicyUrl
    };
    
    await chrome.storage.local.set({ organizationConfig });
    
    // Fetch policies immediately if URL provided
    if (orgPolicyUrl) {
      showNotification('Fetching organization policies...', 'success');
      
      try {
        const response = await chrome.runtime.sendMessage({
          action: 'fetchOrganizationPolicies',
          policyUrl: orgPolicyUrl
        });
        
        if (response && response.success) {
          showNotification('Organization configuration saved and policies loaded!', 'success');
        } else {
          showNotification(`Configuration saved but policy fetch failed: ${response?.error || 'Unknown error'}`, 'error');
        }
      } catch (error: any) {
        showNotification(`Configuration saved but policy fetch failed: ${error.message}`, 'error');
      }
    } else {
      showNotification('Organization configuration saved', 'success');
    }
  });
}

// Validation helper functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

// Action Listeners
function setupActionListeners(): void {
  // View alerts
  document.getElementById('viewAlertsBtn')!.addEventListener('click', () => {
    (document.querySelector('[data-tab="alerts"]') as HTMLElement).click();
  });
  
  // Export report
  document.getElementById('exportReportBtn')!.addEventListener('click', async () => {
    await exportReport();
  });
  
  // Clear alerts
  document.getElementById('clearAlertsBtn')!.addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all alerts?')) {
      await chrome.storage.local.set({ alertHistory: [] });
      renderAlerts([]);
    }
  });
}

// Load Settings
async function loadSettings(): Promise<void> {
  const data = await chrome.storage.local.get([
    'enabled',
    'mode',
    'privacyMode',
    'expectedSenders',
    'expectedLinkDomains',
    'whitelistedSenders',
    'whitelistedDomains',
    'organizationConfig',
    'aiDetectionEnabled',
    'aiProvider',
    'aiApiKey',
    'aiModel'
  ]);
  
  // Update UI
  (document.getElementById('enabledToggle') as HTMLInputElement).checked = data.enabled !== false;
  (document.getElementById('privacyMode') as HTMLSelectElement).value = data.privacyMode || 'local';
  
  // AI Detection settings
  const aiToggle = document.getElementById('aiDetectionToggle') as HTMLInputElement;
  const aiSettings = document.getElementById('aiSettings')!;
  const aiProviderSelect = document.getElementById('aiProviderSelect') as HTMLSelectElement;
  const customProviderSettings = document.getElementById('customProviderSettings')!;
  const aiApiKeyInput = document.getElementById('aiApiKeyInput') as HTMLInputElement;
  const aiModelInput = document.getElementById('aiModelInput') as HTMLInputElement;
  
  aiToggle.checked = data.aiDetectionEnabled || false;
  aiSettings.style.display = data.aiDetectionEnabled ? 'block' : 'none';
  
  // Load AI provider configuration
  const provider = data.aiProvider || 'builtin';
  aiProviderSelect.value = provider;
  
  if (provider !== 'builtin') {
    customProviderSettings.style.display = 'block';
    if (data.aiApiKey) {
      aiApiKeyInput.value = '••••••••••••••••'; // Mask the key
    }
    if (data.aiModel) {
      aiModelInput.value = data.aiModel;
    }
    
    // Show configured status
    if (data.aiApiKey) {
      showAIStatus('success', `✅ ${provider.toUpperCase()} configured`);
    }
  } else {
    customProviderSettings.style.display = 'none';
    if (data.aiDetectionEnabled) {
      showAIStatus('success', '✅ Using built-in AI');
    }
  }
  
  updateStatus(data.enabled !== false);
  
  // Render lists
  renderExpectedSenders(data.expectedSenders || []);
  renderLinkDomains(data.expectedLinkDomains || {});
  renderWhitelistedSenders(data.whitelistedSenders || []);
  renderWhitelistedDomains(data.whitelistedDomains || []);
  
  // Organization mode
  if (data.mode === 'organization') {
    (document.getElementById('orgModeToggle') as HTMLInputElement).checked = true;
    document.getElementById('orgSettings')!.style.display = 'block';
    document.getElementById('orgStats')!.style.display = 'block';
    
    if (data.organizationConfig) {
      (document.getElementById('orgName') as HTMLInputElement).value = data.organizationConfig.name || '';
      (document.getElementById('orgAdminEmail') as HTMLInputElement).value = data.organizationConfig.adminEmail || '';
      (document.getElementById('orgPolicyUrl') as HTMLInputElement).value = data.organizationConfig.policyUrl || '';
      
      // Show policy fetch status
      if (data.organizationConfig.lastPolicyFetch) {
        const lastFetch = new Date(data.organizationConfig.lastPolicyFetch);
        console.log(`Last policy fetch: ${lastFetch.toLocaleString()}`);
      }
      
      if (data.organizationConfig.policyFetchError) {
        console.warn(`Policy fetch error: ${data.organizationConfig.policyFetchError}`);
      }
    }
    
    // Load organization statistics
    loadOrganizationStatistics(data);
  }
}

// Load organization statistics
function loadOrganizationStatistics(data: any): void {
  // For now, show individual user stats
  // In a full implementation, this would aggregate from multiple users
  const orgTotalUsers = 1; // Current user
  const orgTotalAlerts = data.alertHistory?.length || 0;
  
  (document.getElementById('orgTotalUsers') as HTMLElement).textContent = orgTotalUsers.toString();
  (document.getElementById('orgTotalAlerts') as HTMLElement).textContent = orgTotalAlerts.toString();
}

// Load Statistics
async function loadStatistics(): Promise<void> {
  const { statistics = {} } = await chrome.storage.local.get('statistics');
  
  document.getElementById('emailsScanned')!.textContent = String(statistics.totalEmailsScanned || 0);
  document.getElementById('threatsBlocked')!.textContent = String(statistics.threatsBlocked || 0);
  
  // Load recent activity
  const { alertHistory = [] } = await chrome.storage.local.get('alertHistory');
  renderRecentActivity(alertHistory.slice(0, 5));
}

// Load Alerts
async function loadAlerts(): Promise<void> {
  const { alertHistory = [] } = await chrome.storage.local.get('alertHistory');
  renderAlerts(alertHistory);
}

// Render Functions
function renderExpectedSenders(senders: string[]): void {
  const container = document.getElementById('expectedSendersList')!;
  container.innerHTML = '';
  
  if (senders.length === 0) {
    container.innerHTML = '<p class="empty-state" style="padding: 20px;">No expected senders configured</p>';
    return;
  }
  
  senders.forEach(sender => {
    const item = createListItem(sender, async () => {
      const { expectedSenders = [] } = await chrome.storage.local.get('expectedSenders');
      const updated = expectedSenders.filter((s: string) => s !== sender);
      await chrome.storage.local.set({ expectedSenders: updated });
      renderExpectedSenders(updated);
    });
    container.appendChild(item);
  });
}

function renderLinkDomains(linkDomains: Record<string, string[]>): void {
  const container = document.getElementById('linkDomainsList')!;
  container.innerHTML = '';
  
  const entries = Object.entries(linkDomains);
  
  if (entries.length === 0) {
    container.innerHTML = '<p class="empty-state" style="padding: 20px;">No link domain rules configured</p>';
    return;
  }
  
  entries.forEach(([sender, domains]: [string, string[]]) => {
    domains.forEach((domain: string) => {
      const item = createListItem(
        `${sender} → ${domain}`,
        async () => {
          const { expectedLinkDomains = {} } = await chrome.storage.local.get('expectedLinkDomains');
          expectedLinkDomains[sender] = expectedLinkDomains[sender].filter((d: string) => d !== domain);
          if (expectedLinkDomains[sender].length === 0) {
            delete expectedLinkDomains[sender];
          }
          await chrome.storage.local.set({ expectedLinkDomains });
          renderLinkDomains(expectedLinkDomains);
        }
      );
      container.appendChild(item);
    });
  });
}

function renderWhitelistedSenders(senders: string[]): void {
  const container = document.getElementById('whitelistedSendersList')!;
  container.innerHTML = '';
  
  if (senders.length === 0) {
    container.innerHTML = '<p class="empty-state" style="padding: 20px;">No whitelisted senders</p>';
    return;
  }
  
  senders.forEach((sender: string) => {
    const item = createListItem(sender, async () => {
      const { whitelistedSenders = [] } = await chrome.storage.local.get('whitelistedSenders');
      const updated = whitelistedSenders.filter((s: string) => s !== sender);
      await chrome.storage.local.set({ whitelistedSenders: updated });
      renderWhitelistedSenders(updated);
    });
    container.appendChild(item);
  });
}

function renderWhitelistedDomains(domains: string[]): void {
  const container = document.getElementById('whitelistedDomainsList')!;
  container.innerHTML = '';
  
  if (domains.length === 0) {
    container.innerHTML = '<p class="empty-state" style="padding: 20px;">No whitelisted domains</p>';
    return;
  }
  
  domains.forEach((domain: string) => {
    const item = createListItem(domain, async () => {
      const { whitelistedDomains = [] } = await chrome.storage.local.get('whitelistedDomains');
      const updated = whitelistedDomains.filter((d: string) => d !== domain);
      await chrome.storage.local.set({ whitelistedDomains: updated });
      renderWhitelistedDomains(updated);
    });
    container.appendChild(item);
  });
}

function renderRecentActivity(alerts: Alert[]): void {
  const container = document.getElementById('recentActivity')!;
  container.innerHTML = '';
  
  if (alerts.length === 0) {
    container.innerHTML = '<p class="empty-state">No recent activity</p>';
    return;
  }
  
  alerts.forEach((alert: Alert) => {
    const item = document.createElement('div');
    item.className = 'activity-item';
    
    const time = document.createElement('div');
    time.className = 'activity-time';
    time.textContent = formatTime(alert.timestamp!);
    
    const message = document.createElement('div');
    message.className = 'activity-message';
    message.textContent = `${alert.type}: ${alert.message}`;
    
    item.appendChild(time);
    item.appendChild(message);
    container.appendChild(item);
  });
}

function renderAlerts(alerts: Alert[]): void {
  const container = document.getElementById('alertsList')!;
  container.innerHTML = '';
  
  if (alerts.length === 0) {
    container.innerHTML = '<p class="empty-state">No alerts recorded</p>';
    return;
  }
  
  alerts.forEach((alert: Alert) => {
    const item = document.createElement('div');
    item.className = `alert-item ${alert.severity}`;
    
    // Always make alert clickable
    item.classList.add('clickable');
    item.style.cursor = 'pointer';
    
    // Add click handler
    item.addEventListener('click', () => {
      if (alert.emailUrl) {
        // Open the specific email
        chrome.tabs.create({ url: alert.emailUrl });
      } else {
        // Fallback: open Gmail or Outlook
        const isGmail = alert.sender && alert.sender.includes('@gmail');
        const defaultUrl = isGmail ? 'https://mail.google.com' : 'https://outlook.office.com';
        chrome.tabs.create({ url: defaultUrl });
      }
    });
    
    const header = document.createElement('div');
    header.className = 'alert-header';
    
    const type = document.createElement('div');
    type.className = 'alert-type';
    type.textContent = alert.message;
    
    const time = document.createElement('div');
    time.className = 'alert-time';
    time.textContent = formatTime(alert.timestamp);
    
    header.appendChild(type);
    header.appendChild(time);
    
    const sender = document.createElement('div');
    sender.className = 'alert-sender';
    sender.textContent = `From: ${alert.sender}`;
    
    const message = document.createElement('div');
    message.className = 'alert-message';
    message.textContent = alert.details;
    
    item.appendChild(header);
    item.appendChild(sender);
    item.appendChild(message);
    
    container.appendChild(item);
  });
}

// Helper Functions
function createListItem(text: string, onRemove: () => void): HTMLDivElement {
  const item = document.createElement('div');
  item.className = 'list-item';
  
  const textSpan = document.createElement('span');
  textSpan.className = 'list-item-text';
  textSpan.textContent = text;
  
  const removeBtn = document.createElement('button');
  removeBtn.className = 'list-item-remove';
  removeBtn.textContent = 'Remove';
  removeBtn.onclick = onRemove;
  
  item.appendChild(textSpan);
  item.appendChild(removeBtn);
  
  return item;
}

function updateStatus(enabled: boolean): void {
  const indicator = document.getElementById('statusIndicator')!;
  const text = document.getElementById('statusText')!;
  
  if (enabled) {
    indicator.classList.remove('inactive');
    text.textContent = 'Active';
  } else {
    indicator.classList.add('inactive');
    text.textContent = 'Inactive';
  }
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

async function exportReport(): Promise<void> {
  const data = await chrome.storage.local.get([
    'statistics',
    'alertHistory',
    'expectedSenders',
    'whitelistedSenders'
  ]);
  
  const report = {
    generatedAt: new Date().toISOString(),
    statistics: data.statistics || {},
    totalAlerts: (data.alertHistory || []).length,
    alertsByType: {},
    alertsBySeverity: {},
    topThreats: []
  };
  
  // Analyze alerts
  (data.alertHistory || []).forEach((alert: Alert) => {
    // By type
    report.alertsByType[alert.type] = (report.alertsByType[alert.type] || 0) + 1;
    
    // By severity
    report.alertsBySeverity[alert.severity] = (report.alertsBySeverity[alert.severity] || 0) + 1;
  });
  
  // Create downloadable file
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `email-guard-report-${Date.now()}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
  
  showNotification('Report exported successfully', 'success');
}

function showNotification(message: string, type: 'success' | 'error'): void {
  // Create a simple notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: ${type === 'success' ? '#28a745' : '#dc3545'};
    color: white;
    border-radius: 4px;
    font-size: 13px;
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// AI Configuration Functions
async function saveAIConfiguration(): Promise<void> {
  const aiProviderSelect = document.getElementById('aiProviderSelect') as HTMLSelectElement;
  const aiApiKeyInput = document.getElementById('aiApiKeyInput') as HTMLInputElement;
  const aiModelInput = document.getElementById('aiModelInput') as HTMLInputElement;
  const aiStatus = document.getElementById('aiStatus')!;

  const provider = aiProviderSelect.value;
  const apiKey = aiApiKeyInput.value.trim();
  const model = aiModelInput.value.trim();

  // Validate
  if (provider !== 'builtin' && !apiKey) {
    showAIStatus('error', '❌ Please enter an API key');
    return;
  }

  try {
    // Save configuration
    const config = {
      aiProvider: provider,
      aiApiKey: provider === 'builtin' ? null : apiKey,
      aiModel: model || null,
      aiDetectionEnabled: true
    };

    await chrome.storage.local.set(config);

    // Notify background script
    const response = await chrome.runtime.sendMessage({
      action: 'updateAIConfig',
      provider: provider,
      apiKey: provider === 'builtin' ? null : apiKey,
      model: model || null,
      enabled: true
    });

    if (response && response.success) {
      showAIStatus('success', '✅ Configuration saved successfully!');
      
      // Clear sensitive input
      if (provider !== 'builtin') {
        aiApiKeyInput.value = '••••••••••••••••';
      }
    } else {
      showAIStatus('error', `❌ ${response?.error || 'Failed to save configuration'}`);
    }
  } catch (error: any) {
    showAIStatus('error', `❌ Error: ${error.message}`);
  }
}

async function testAIConnection(): Promise<void> {
  const aiProviderSelect = document.getElementById('aiProviderSelect') as HTMLSelectElement;
  const aiApiKeyInput = document.getElementById('aiApiKeyInput') as HTMLInputElement;
  const aiModelInput = document.getElementById('aiModelInput') as HTMLInputElement;

  const provider = aiProviderSelect.value;
  const apiKey = aiApiKeyInput.value.trim();
  const model = aiModelInput.value.trim();

  if (provider === 'builtin') {
    showAIStatus('info', '🔌 Testing built-in AI connection...');
  } else if (!apiKey || apiKey === '••••••••••••••••') {
    showAIStatus('error', '❌ Please enter your API key first');
    return;
  } else {
    showAIStatus('info', `🔌 Testing connection to ${provider}...`);
  }

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'testAIConnection',
      provider: provider,
      apiKey: provider === 'builtin' ? null : apiKey,
      model: model || null
    });

    if (response && response.success) {
      showAIStatus('success', response.message || '✅ Connection successful!');
    } else {
      showAIStatus('error', response?.message || '❌ Connection failed');
    }
  } catch (error: any) {
    showAIStatus('error', `❌ Connection error: ${error.message}`);
  }
}

function showAIStatus(type: 'success' | 'error' | 'info', message: string): void {
  const aiStatus = document.getElementById('aiStatus')!;
  
  aiStatus.style.display = 'block';
  aiStatus.textContent = message;
  
  // Style based on type
  if (type === 'success') {
    aiStatus.style.background = '#d4edda';
    aiStatus.style.color = '#155724';
    aiStatus.style.border = '1px solid #c3e6cb';
  } else if (type === 'error') {
    aiStatus.style.background = '#f8d7da';
    aiStatus.style.color = '#721c24';
    aiStatus.style.border = '1px solid #f5c6cb';
  } else {
    aiStatus.style.background = '#d1ecf1';
    aiStatus.style.color = '#0c5460';
    aiStatus.style.border = '1px solid #bee5eb';
  }

  // Auto-hide after 5 seconds for success/info
  if (type !== 'error') {
    setTimeout(() => {
      aiStatus.style.display = 'none';
    }, 5000);
  }
}
