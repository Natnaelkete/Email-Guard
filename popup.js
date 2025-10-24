// Email Guard Popup Script

document.addEventListener('DOMContentLoaded', async () => {
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
function setupTabNavigation() {
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.tab-panel');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update active panel
      panels.forEach(p => p.classList.remove('active'));
      document.getElementById(targetTab).classList.add('active');
    });
  });
}

// Toggle Listeners
function setupToggleListeners() {
  // Enable/Disable toggle
  const enabledToggle = document.getElementById('enabledToggle');
  enabledToggle.addEventListener('change', async (e) => {
    await chrome.storage.local.set({ enabled: e.target.checked });
    updateStatus(e.target.checked);
  });
  
  // Organization mode toggle
  const orgModeToggle = document.getElementById('orgModeToggle');
  orgModeToggle.addEventListener('change', (e) => {
    const orgSettings = document.getElementById('orgSettings');
    const orgStats = document.getElementById('orgStats');
    
    if (e.target.checked) {
      orgSettings.style.display = 'block';
      orgStats.style.display = 'block';
    } else {
      orgSettings.style.display = 'none';
      orgStats.style.display = 'none';
    }
    
    chrome.storage.local.set({ mode: e.target.checked ? 'organization' : 'personal' });
  });
}

// Form Listeners
function setupFormListeners() {
  // Privacy mode
  const privacyMode = document.getElementById('privacyMode');
  privacyMode.addEventListener('change', (e) => {
    chrome.storage.local.set({ privacyMode: e.target.value });
  });
  
  // Add expected sender
  document.getElementById('addExpectedSenderBtn').addEventListener('click', async () => {
    const input = document.getElementById('expectedSenderInput');
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
  document.getElementById('addLinkDomainBtn').addEventListener('click', async () => {
    const senderInput = document.getElementById('linkSenderInput');
    const domainInput = document.getElementById('linkDomainInput');
    
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
  document.getElementById('addWhitelistedDomainBtn').addEventListener('click', async () => {
    const input = document.getElementById('whitelistedDomainInput');
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
  
  // Save organization config
  document.getElementById('saveOrgConfigBtn').addEventListener('click', async () => {
    const orgName = document.getElementById('orgName').value.trim();
    const orgAdminEmail = document.getElementById('orgAdminEmail').value.trim();
    const orgPolicyUrl = document.getElementById('orgPolicyUrl').value.trim();
    
    const organizationConfig = {
      name: orgName,
      adminEmail: orgAdminEmail,
      policyUrl: orgPolicyUrl,
      updatedAt: Date.now()
    };
    
    await chrome.storage.local.set({ organizationConfig });
    
    // Show success message
    showNotification('Organization configuration saved', 'success');
  });
}

// Action Listeners
function setupActionListeners() {
  // View alerts
  document.getElementById('viewAlertsBtn').addEventListener('click', () => {
    document.querySelector('[data-tab="alerts"]').click();
  });
  
  // Export report
  document.getElementById('exportReportBtn').addEventListener('click', async () => {
    await exportReport();
  });
  
  // Clear alerts
  document.getElementById('clearAlertsBtn').addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all alerts?')) {
      await chrome.storage.local.set({ alertHistory: [] });
      renderAlerts([]);
    }
  });
}

// Load Settings
async function loadSettings() {
  const data = await chrome.storage.local.get([
    'enabled',
    'mode',
    'privacyMode',
    'expectedSenders',
    'expectedLinkDomains',
    'whitelistedSenders',
    'whitelistedDomains',
    'organizationConfig'
  ]);
  
  // Update UI
  document.getElementById('enabledToggle').checked = data.enabled !== false;
  document.getElementById('privacyMode').value = data.privacyMode || 'local';
  
  updateStatus(data.enabled !== false);
  
  // Render lists
  renderExpectedSenders(data.expectedSenders || []);
  renderLinkDomains(data.expectedLinkDomains || {});
  renderWhitelistedSenders(data.whitelistedSenders || []);
  renderWhitelistedDomains(data.whitelistedDomains || []);
  
  // Organization mode
  if (data.mode === 'organization') {
    document.getElementById('orgModeToggle').checked = true;
    document.getElementById('orgSettings').style.display = 'block';
    document.getElementById('orgStats').style.display = 'block';
    
    if (data.organizationConfig) {
      document.getElementById('orgName').value = data.organizationConfig.name || '';
      document.getElementById('orgAdminEmail').value = data.organizationConfig.adminEmail || '';
      document.getElementById('orgPolicyUrl').value = data.organizationConfig.policyUrl || '';
    }
  }
}

// Load Statistics
async function loadStatistics() {
  const { statistics = {} } = await chrome.storage.local.get('statistics');
  
  document.getElementById('emailsScanned').textContent = statistics.totalEmailsScanned || 0;
  document.getElementById('threatsBlocked').textContent = statistics.threatsBlocked || 0;
  
  // Load recent activity
  const { alertHistory = [] } = await chrome.storage.local.get('alertHistory');
  renderRecentActivity(alertHistory.slice(0, 5));
}

// Load Alerts
async function loadAlerts() {
  const { alertHistory = [] } = await chrome.storage.local.get('alertHistory');
  renderAlerts(alertHistory);
}

// Render Functions
function renderExpectedSenders(senders) {
  const container = document.getElementById('expectedSendersList');
  container.innerHTML = '';
  
  if (senders.length === 0) {
    container.innerHTML = '<p class="empty-state" style="padding: 20px;">No expected senders configured</p>';
    return;
  }
  
  senders.forEach(sender => {
    const item = createListItem(sender, async () => {
      const { expectedSenders = [] } = await chrome.storage.local.get('expectedSenders');
      const updated = expectedSenders.filter(s => s !== sender);
      await chrome.storage.local.set({ expectedSenders: updated });
      renderExpectedSenders(updated);
    });
    container.appendChild(item);
  });
}

function renderLinkDomains(linkDomains) {
  const container = document.getElementById('linkDomainsList');
  container.innerHTML = '';
  
  const entries = Object.entries(linkDomains);
  
  if (entries.length === 0) {
    container.innerHTML = '<p class="empty-state" style="padding: 20px;">No link domain rules configured</p>';
    return;
  }
  
  entries.forEach(([sender, domains]) => {
    domains.forEach(domain => {
      const item = createListItem(
        `${sender} → ${domain}`,
        async () => {
          const { expectedLinkDomains = {} } = await chrome.storage.local.get('expectedLinkDomains');
          expectedLinkDomains[sender] = expectedLinkDomains[sender].filter(d => d !== domain);
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

function renderWhitelistedSenders(senders) {
  const container = document.getElementById('whitelistedSendersList');
  container.innerHTML = '';
  
  if (senders.length === 0) {
    container.innerHTML = '<p class="empty-state" style="padding: 20px;">No whitelisted senders</p>';
    return;
  }
  
  senders.forEach(sender => {
    const item = createListItem(sender, async () => {
      const { whitelistedSenders = [] } = await chrome.storage.local.get('whitelistedSenders');
      const updated = whitelistedSenders.filter(s => s !== sender);
      await chrome.storage.local.set({ whitelistedSenders: updated });
      renderWhitelistedSenders(updated);
    });
    container.appendChild(item);
  });
}

function renderWhitelistedDomains(domains) {
  const container = document.getElementById('whitelistedDomainsList');
  container.innerHTML = '';
  
  if (domains.length === 0) {
    container.innerHTML = '<p class="empty-state" style="padding: 20px;">No whitelisted domains</p>';
    return;
  }
  
  domains.forEach(domain => {
    const item = createListItem(domain, async () => {
      const { whitelistedDomains = [] } = await chrome.storage.local.get('whitelistedDomains');
      const updated = whitelistedDomains.filter(d => d !== domain);
      await chrome.storage.local.set({ whitelistedDomains: updated });
      renderWhitelistedDomains(updated);
    });
    container.appendChild(item);
  });
}

function renderRecentActivity(alerts) {
  const container = document.getElementById('recentActivity');
  container.innerHTML = '';
  
  if (alerts.length === 0) {
    container.innerHTML = '<p class="empty-state">No recent activity</p>';
    return;
  }
  
  alerts.forEach(alert => {
    const item = document.createElement('div');
    item.className = 'activity-item';
    
    const time = document.createElement('div');
    time.className = 'activity-time';
    time.textContent = formatTime(alert.timestamp);
    
    const message = document.createElement('div');
    message.className = 'activity-message';
    message.textContent = `${alert.type}: ${alert.message}`;
    
    item.appendChild(time);
    item.appendChild(message);
    container.appendChild(item);
  });
}

function renderAlerts(alerts) {
  const container = document.getElementById('alertsList');
  container.innerHTML = '';
  
  if (alerts.length === 0) {
    container.innerHTML = '<p class="empty-state">No alerts recorded</p>';
    return;
  }
  
  alerts.forEach(alert => {
    const item = document.createElement('div');
    item.className = `alert-item ${alert.severity}`;
    
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
function createListItem(text, onRemove) {
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

function updateStatus(enabled) {
  const indicator = document.getElementById('statusIndicator');
  const text = document.getElementById('statusText');
  
  if (enabled) {
    indicator.classList.remove('inactive');
    text.textContent = 'Active';
  } else {
    indicator.classList.add('inactive');
    text.textContent = 'Inactive';
  }
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

async function exportReport() {
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
  (data.alertHistory || []).forEach(alert => {
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

function showNotification(message, type) {
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
