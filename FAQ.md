# Email Guard - Frequently Asked Questions (FAQ)

## General Questions

### What is Email Guard?
Email Guard is a Chrome extension that protects you from phishing emails, malicious links, and suspicious senders. It works with Gmail and Outlook Web to provide real-time threat detection.

### How does Email Guard work?
Email Guard monitors your emails in real-time and checks for unexpected senders, suspicious links, domain impersonation, phishing patterns, and malicious content. When a threat is detected, it displays a clear alert with recommendations.

### Is Email Guard free?
Yes, Email Guard is currently free and open-source under the MIT license.

### Which email clients are supported?
- ✅ Gmail (mail.google.com)
- ✅ Outlook Web (outlook.live.com, outlook.office.com, outlook.office365.com)

### Does Email Guard work with desktop email clients?
No, Email Guard is a browser extension and only works with web-based email clients (webmail).

## Privacy & Security

### Does Email Guard read my emails?
Email Guard only analyzes sender email addresses, link URLs, Reply-To addresses, and subject lines (for logging only). It does NOT read email body content, attachments, or personal information.

### Where is my data stored?
All data is stored locally on your device using Chrome's encrypted storage API. Nothing is sent to external servers in "Local Only" mode (default).

### What data is sent externally?
**Local Only Mode (Default)**: Nothing is sent externally.
**Enhanced Mode (Opt-in)**: Only domain names are sent for verification checks. Email content is never transmitted.

### Is Email Guard safe to use?
Yes. Email Guard uses minimal permissions, processes data locally by default, is open-source, does not track user behavior, and does not collect analytics or sell data.

## Features & Functionality

### What threats does Email Guard detect?
- Phishing emails
- Malicious links
- Sender impersonation
- Look-alike domains (homograph attacks)
- Suspicious patterns
- Unknown senders
- Reply-To mismatches
- IP address links
- URL shorteners

### What are "Expected Senders"?
A list of email addresses or domains you regularly receive emails from. If an email comes from someone not on this list, Email Guard alerts you.

### What are "Expected Link Domains"?
Lets you specify which websites specific senders are allowed to link to. For example, if your bank should only send links to their official website, you can configure that.

### What's the difference between "Expected Senders" and "Whitelisted Senders"?
- **Expected Senders**: Senders you expect to hear from. Emails from others trigger alerts, but still get scanned.
- **Whitelisted Senders**: Completely trusted senders. Emails from them bypass ALL security checks.

### What do the alert colors mean?
- 🛑 **Red (High)**: Critical threat. Do not click links or reply.
- ⚠️ **Yellow (Medium)**: Suspicious. Be cautious.
- ℹ️ **Blue (Low)**: Informational. Minor concern.

## Troubleshooting

### Email Guard isn't showing alerts
1. Check if protection is enabled (Dashboard tab)
2. Verify you're on Gmail or Outlook Web
3. Refresh the email page (Ctrl+Shift+R)
4. Check extension permissions in chrome://extensions/

### I'm getting too many false alerts
1. Add trusted senders to your whitelist
2. Use "Mark as Safe" on legitimate emails
3. Configure your Expected Senders list more accurately

### The extension icon isn't visible
1. Click the puzzle piece icon in Chrome toolbar
2. Find "Email Guard"
3. Click the pin icon to pin it to toolbar

### Settings aren't saving
1. Clear extension data and reconfigure
2. Disable Chrome sync temporarily
3. Check for conflicting extensions

## Organization Mode

### What is Organization Mode?
Organization Mode allows businesses to manage settings centrally, deploy policies to all users, view aggregated alerts, and generate compliance reports.

### How do I set up Organization Mode?
1. Click Email Guard icon → Organization tab
2. Enable "Organization Mode"
3. Enter organization details
4. Configure central policies

## Best Practices

### What should I add to Expected Senders?
Add your workplace domain, frequent contacts, financial institutions, and important services. Don't add every sender.

### How should I respond to alerts?
1. Read the alert carefully
2. Check the explanation
3. Follow recommendations
4. Verify sender through another channel if unsure
5. Don't click links in suspicious emails

### Should I use Local or Enhanced mode?
**Use Local Mode if**: Privacy is your top priority, you don't need advanced domain checks.
**Use Enhanced Mode if**: You want maximum protection and are okay with minimal data sharing (domain names only).

---

**Still Have Questions? Check README.md or open an issue on GitHub! 🛡️**
