// Gmail Content Script - Email Guard
// Monitors Gmail interface and scans emails for threats

(function() {
  'use strict';
  
  let isInitialized = false;
  let currentEmailId = null;
  let observer = null;
  
  // Initialize the extension
  function init() {
    if (isInitialized) return;
    isInitialized = true;
    
    console.log('Email Guard: Initializing Gmail protection');
    
    // Monitor for email view changes
    startMonitoring();
    
    // Check current email if already viewing one
    checkCurrentEmail();
  }
  
  // Start monitoring DOM changes
  function startMonitoring() {
    observer = new MutationObserver((mutations) => {
      // Check if email view changed
      const emailView = document.querySelector('[role="main"]');
      if (emailView) {
        checkCurrentEmail();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Check currently displayed email
  async function checkCurrentEmail() {
    try {
      const emailData = extractEmailData();
      
      if (!emailData || !emailData.sender) {
        return;
      }
      
      // Check if this is a new email
      const emailId = generateEmailId(emailData);
      if (emailId === currentEmailId) {
        return;
      }
      
      currentEmailId = emailId;
      
      // Remove any existing alerts
      removeExistingAlerts();
      
      // Verify email
      const response = await chrome.runtime.sendMessage({
        action: 'verifyEmail',
        data: emailData
      });
      
      if (response.success) {
        const { result } = response;
        
        // Update statistics
        chrome.runtime.sendMessage({
          action: 'updateStatistics',
          stats: {
            scanned: 1,
            blocked: result.alerts.length > 0 ? 1 : 0
          }
        });
        
        // Display alerts if any
        if (result.alerts.length > 0) {
          displayAlerts(result.alerts, emailData);
          
          // Log alerts
          for (const alert of result.alerts) {
            chrome.runtime.sendMessage({
              action: 'logAlert',
              alert: {
                ...alert,
                sender: emailData.sender,
                subject: emailData.subject
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Email Guard: Error checking email', error);
    }
  }
  
  // Extract email data from Gmail DOM
  function extractEmailData() {
    try {
      // Find email container
      const emailContainer = document.querySelector('[role="main"]');
      if (!emailContainer) return null;
      
      // Extract sender
      const senderElement = emailContainer.querySelector('[email]');
      const sender = senderElement ? senderElement.getAttribute('email') : null;
      
      if (!sender) return null;
      
      // Extract subject
      const subjectElement = emailContainer.querySelector('h2');
      const subject = subjectElement ? subjectElement.textContent.trim() : '';
      
      // Extract reply-to if different
      let replyTo = null;
      const replyToElement = emailContainer.querySelector('[data-hovercard-id*="reply-to"]');
      if (replyToElement) {
        replyTo = replyToElement.getAttribute('email');
      }
      
      // Extract links
      const links = [];
      const linkElements = emailContainer.querySelectorAll('a[href]');
      
      linkElements.forEach(link => {
        const href = link.getAttribute('href');
        const displayText = link.textContent.trim();
        
        // Filter out Gmail internal links
        if (href && !href.includes('mail.google.com') && !href.startsWith('#')) {
          links.push({
            href,
            displayText: displayText || href
          });
        }
      });
      
      return {
        sender,
        subject,
        replyTo,
        links
      };
    } catch (error) {
      console.error('Email Guard: Error extracting email data', error);
      return null;
    }
  }
  
  // Generate unique email ID
  function generateEmailId(emailData) {
    return `${emailData.sender}-${emailData.subject}`.replace(/\s/g, '');
  }
  
  // Display alerts in Gmail interface
  function displayAlerts(alerts, emailData) {
    const emailContainer = document.querySelector('[role="main"]');
    if (!emailContainer) return;
    
    // Find the best insertion point (after subject, before email body)
    const subjectElement = emailContainer.querySelector('h2');
    if (!subjectElement) return;
    
    // Determine highest severity
    const severityLevels = { high: 3, medium: 2, low: 1 };
    const maxSeverity = alerts.reduce((max, alert) => {
      const level = severityLevels[alert.severity] || 0;
      return level > max ? level : max;
    }, 0);
    
    const severity = maxSeverity === 3 ? 'high' : maxSeverity === 2 ? 'medium' : 'low';
    
    // Create alert panel
    const alertPanel = createAlertPanel(alerts, severity, emailData);
    
    // Insert after subject
    subjectElement.parentNode.insertBefore(alertPanel, subjectElement.nextSibling);
  }
  
  // Create alert panel element
  function createAlertPanel(alerts, severity, emailData) {
    const panel = document.createElement('div');
    panel.className = `email-guard-alert email-guard-${severity}`;
    panel.setAttribute('data-email-guard', 'true');
    
    // Header
    const header = document.createElement('div');
    header.className = 'email-guard-header';
    
    const icon = document.createElement('span');
    icon.className = 'email-guard-icon';
    icon.textContent = severity === 'high' ? '🛑' : severity === 'medium' ? '⚠️' : 'ℹ️';
    
    const title = document.createElement('strong');
    title.textContent = severity === 'high' ? 'SECURITY ALERT' : 
                       severity === 'medium' ? 'Security Warning' : 'Security Notice';
    
    header.appendChild(icon);
    header.appendChild(title);
    
    // Alert count
    const count = document.createElement('span');
    count.className = 'email-guard-count';
    count.textContent = `${alerts.length} issue${alerts.length > 1 ? 's' : ''} detected`;
    header.appendChild(count);
    
    panel.appendChild(header);
    
    // Alerts list
    const alertsList = document.createElement('div');
    alertsList.className = 'email-guard-alerts-list';
    
    alerts.forEach((alert, index) => {
      const alertItem = document.createElement('div');
      alertItem.className = 'email-guard-alert-item';
      
      const alertTitle = document.createElement('div');
      alertTitle.className = 'email-guard-alert-title';
      alertTitle.textContent = alert.message;
      
      const alertDetails = document.createElement('div');
      alertDetails.className = 'email-guard-alert-details';
      alertDetails.textContent = alert.details;
      
      const alertRec = document.createElement('div');
      alertRec.className = 'email-guard-alert-recommendation';
      alertRec.innerHTML = `<strong>What to do:</strong> ${alert.recommendation}`;
      
      alertItem.appendChild(alertTitle);
      alertItem.appendChild(alertDetails);
      alertItem.appendChild(alertRec);
      
      alertsList.appendChild(alertItem);
      
      // Add separator between alerts
      if (index < alerts.length - 1) {
        const separator = document.createElement('hr');
        separator.className = 'email-guard-separator';
        alertsList.appendChild(separator);
      }
    });
    
    panel.appendChild(alertsList);
    
    // Actions
    const actions = document.createElement('div');
    actions.className = 'email-guard-actions';
    
    const whitelistBtn = document.createElement('button');
    whitelistBtn.className = 'email-guard-btn email-guard-btn-secondary';
    whitelistBtn.textContent = 'Mark as Safe';
    whitelistBtn.onclick = () => handleWhitelist(emailData, panel);
    
    const detailsBtn = document.createElement('button');
    detailsBtn.className = 'email-guard-btn email-guard-btn-primary';
    detailsBtn.textContent = 'View Details';
    detailsBtn.onclick = () => toggleDetails(alertsList);
    
    actions.appendChild(whitelistBtn);
    actions.appendChild(detailsBtn);
    
    panel.appendChild(actions);
    
    return panel;
  }
  
  // Toggle alert details
  function toggleDetails(alertsList) {
    alertsList.style.display = alertsList.style.display === 'none' ? 'block' : 'none';
  }
  
  // Handle whitelist action
  async function handleWhitelist(emailData, panel) {
    try {
      const settings = await chrome.runtime.sendMessage({ action: 'getSettings' });
      
      if (!settings.success) return;
      
      const { whitelistedSenders = [] } = settings.settings;
      
      if (!whitelistedSenders.includes(emailData.sender)) {
        whitelistedSenders.push(emailData.sender);
        await chrome.storage.local.set({ whitelistedSenders });
      }
      
      // Remove alert panel
      panel.remove();
      
      // Show confirmation
      showNotification('Sender added to safe list', 'success');
    } catch (error) {
      console.error('Email Guard: Error whitelisting sender', error);
      showNotification('Failed to add sender to safe list', 'error');
    }
  }
  
  // Remove existing alerts
  function removeExistingAlerts() {
    const existingAlerts = document.querySelectorAll('[data-email-guard="true"]');
    existingAlerts.forEach(alert => alert.remove());
  }
  
  // Show notification
  function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `email-guard-notification email-guard-notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('email-guard-notification-show');
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove('email-guard-notification-show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  // Wait for Gmail to load
  function waitForGmail() {
    if (document.querySelector('[role="main"]')) {
      init();
    } else {
      setTimeout(waitForGmail, 1000);
    }
  }
  
  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForGmail);
  } else {
    waitForGmail();
  }
})();
