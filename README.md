# Email Guard 🛡️

**Advanced Chrome Extension for Email Protection Against Phishing and Malicious Attacks**

Email Guard is a comprehensive email security extension that protects users from phishing attempts, malicious links, and suspicious senders across Gmail and Outlook Web. It features advanced threat detection, organization-level controls, and privacy-first design.

## 🌟 Key Features

### 1. **Expected Sender & Link Domain List**
- Define trusted senders (email addresses or domains)
- Configure expected link domains for specific senders
- Automatic alerts when unexpected senders or link domains are detected
- Support for personal and organizational contexts

### 2. **Real-World Sender Verification**
- Domain infrastructure checks (MX records, DMARC, SPF, DKIM)
- Domain age verification
- Impersonation and look-alike domain detection
- Suspicious domain pattern analysis
- User-facing risk explanations

### 3. **Link Domain Reconciliation + Original vs Display Mismatch + Punycode/Homograph Detection**
- Detect if link text says "bank.com" but href goes to "bȧnk.com" (punycode or homograph)
- Detect redirect chains and flag when final domain is unrelated
- Provide "why this link is suspicious" context to the user

### 4. **Whitelist Override + User Feedback Loop**
- Allow user to override/whitelist safely and record it
- Allow user to see "why this was flagged" and optionally "report safe" so the system learns from exceptions
- Maintain UI/UX to reduce false positives

### 5. **Privacy-First Local Analysis with Optional Backend for Advanced Checks**
- Default to local heuristics/analysis (no email content sent externally) for privacy
- Optionally integrate a backend if users want deeper checks (domain age, external verification) but allow opt-in
- Clearly document what is processed locally vs remotely

### 6. **Shared/Organisation Mode**
- For business/organisation users: allow setting a central expected-sender+link-domain list, push to users
- Alerts sent to admin if unknown senders appear
- Reporting dashboard: number of alerts, top flagged senders/links, etc.

### 7. **Explainable Alerts**
- Every alert should say why it triggered: "Sender domain missing MX", "Link domain not in expected list", "Look-alike domain detected", etc.
- Provide quick "What to do" guidance: "Do not click link until verifying", "Reply-To is different from From", etc.

### 8. **Cross-Client Support**
- ✅ Gmail (mail.google.com)
- ✅ Outlook Web (outlook.live.com, outlook.office.com, outlook.office365.com)
- Extensible architecture for additional webmail clients

### 9. **Offline/Flight Mode / No-Internet Fallback**
- If internet connectivity is limited, still run basic offline heuristics (sender whitelists, link text vs href mismatch) so protection still functions

## 🚀 Installation

### From Source (Development)

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd Email-Guard
   ```

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `Email-Guard` directory

3. **Grant Permissions**
   - The extension will request permissions for Gmail and Outlook
   - Accept to enable protection

### From Chrome Web Store (Coming Soon)
- Search for "Email Guard" in the Chrome Web Store
- Click "Add to Chrome"

## 📖 Usage Guide

### Initial Setup

1. **Click the Email Guard icon** in your Chrome toolbar
2. **Configure Expected Senders** (Settings tab):
   - Add email addresses or domains you regularly receive emails from
   - Example: `boss@company.com` or `company.com`

3. **Configure Expected Link Domains** (Settings tab):
   - Define which domains specific senders can link to
   - Example: `finance@company.com` → `company.com, payroll.com`

4. **Choose Privacy Mode**:
   - **Local Only**: All processing on your device (recommended for privacy)
   - **Enhanced**: Enables external domain verification checks

### Daily Use

When you open an email in Gmail or Outlook:

1. **Email Guard automatically scans** the email in real-time
2. **If threats are detected**, a colored alert panel appears:
   - 🛑 **Red (High)**: Critical threat - do not interact
   - ⚠️ **Yellow (Medium)**: Suspicious - verify before proceeding
   - ℹ️ **Blue (Low)**: Informational notice

3. **Review the alert details**:
   - Click "View Details" to see all detected issues
   - Read the "What to do" recommendations

4. **Take action**:
   - **Mark as Safe**: If you trust the sender, add to whitelist
   - **Ignore**: Close the alert but remain cautious

### Organization Setup

For IT administrators deploying Email Guard across an organization:

1. **Enable Organization Mode** (Organization tab)
2. **Configure Organization Details**:
   - Organization name
   - Admin email
   - Central policy URL (optional)

3. **Define Central Policies**:
   - Expected senders for the entire organization
   - Approved link domains
   - Whitelisted external partners

4. **Monitor Dashboard**:
   - View total alerts across users
   - Identify top threats
   - Export reports for compliance

## 🔍 Threat Detection Details

### Alert Types

| Alert Type | Severity | Description |
|------------|----------|-------------|
| **Unexpected Sender** | Medium | Sender not in your expected list |
| **Reply-To Mismatch** | Medium | Reply-To address differs from sender |
| **Suspicious Domain Pattern** | Medium | Domain has unusual characteristics |
| **Homograph Domain** | High | Domain uses look-alike characters |
| **Link Text Mismatch** | High | Display text doesn't match actual URL |
| **Unexpected Link Domain** | High | Link domain not expected from sender |
| **IP Address Link** | High | Link uses IP instead of domain |
| **URL Shortener** | Medium | Link uses URL shortening service |
| **Phishing Keywords** | Medium | Link contains common phishing terms |

## 🔒 Privacy & Security

### Data Handling

- **Local-First**: All email analysis happens on your device by default
- **No Email Storage**: Email content is never stored or transmitted
- **Minimal Permissions**: Only requests necessary browser permissions
- **Opt-In External Checks**: Enhanced mode requires explicit user consent
- **No Tracking**: No analytics or user behavior tracking

### What Data is Processed

**Locally (Always)**:
- Sender email address
- Link URLs and display text
- Reply-To addresses
- Subject lines (for alert logging only)

**Externally (Enhanced Mode Only)**:
- Domain names for MX/DMARC/SPF verification
- Domain age lookups
- Reputation checks

**Never Transmitted**:
- Email body content
- Attachments
- Personal information
- Email metadata beyond sender/links

## 📊 Statistics & Reporting

The extension tracks:
- **Total emails scanned**: Lifetime count
- **Threats blocked**: Number of flagged emails
- **Last scan time**: Timestamp of most recent scan
- **Alert history**: Detailed log of all alerts

Export reports include:
- Alert breakdown by type
- Alert breakdown by severity
- Top flagged senders
- Top flagged domains
- Timeline data

## 🛠️ Configuration Options

### Settings

| Setting | Options | Default | Description |
|---------|---------|---------|-------------|
| **Email Protection** | On/Off | On | Enable/disable all protection |
| **Privacy Mode** | Local/Enhanced | Local | Processing mode |
| **Expected Senders** | List | Empty | Trusted sender list |
| **Expected Link Domains** | Map | Empty | Sender-to-domain mappings |
| **Whitelisted Senders** | List | Empty | Bypass all checks |
| **Whitelisted Domains** | List | Empty | Trusted link domains |
| **Organization Mode** | On/Off | Off | Enable org features |

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check FAQ.md for common questions
- See documentation files for detailed guides

## 🙏 Acknowledgments

Built with security and privacy in mind. Special thanks to the cybersecurity community for threat intelligence and best practices.

---

**Stay Safe Online with Email Guard! 🛡️**
