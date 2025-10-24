# Email Guard - Installation Guide

## Prerequisites

- Google Chrome browser (version 88 or higher)
- Basic understanding of Chrome extensions

## Installation Methods

### Method 1: Load Unpacked (Development/Testing)

This method is ideal for development, testing, or if you want to customize the extension.

#### Steps:

1. **Download the Extension**
   - Download or clone the Email Guard repository
   - Extract the files to a folder on your computer (e.g., `C:\Email-Guard`)

2. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - Or click the three-dot menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Look for the "Developer mode" toggle in the top-right corner
   - Click to enable it

4. **Load the Extension**
   - Click the "Load unpacked" button
   - Navigate to the Email Guard folder
   - Select the folder and click "Select Folder"

5. **Verify Installation**
   - You should see the Email Guard card appear in your extensions list
   - The shield icon (🛡️) should appear in your Chrome toolbar
   - Status should show "Enabled"

6. **Grant Permissions**
   - Click "Details" on the Email Guard card
   - Ensure all required permissions are granted:
     - Storage
     - Notifications
     - Access to mail.google.com
     - Access to outlook sites

### Method 2: Chrome Web Store (Coming Soon)

Once published to the Chrome Web Store:

1. Visit the Chrome Web Store
2. Search for "Email Guard"
3. Click "Add to Chrome"
4. Click "Add extension" in the confirmation dialog
5. The extension will install automatically

## Post-Installation Setup

### First-Time Configuration

1. **Click the Email Guard Icon**
   - Find the shield icon in your Chrome toolbar
   - Click it to open the popup interface

2. **Review Default Settings**
   - Protection is enabled by default
   - Privacy mode is set to "Local Only"

3. **Configure Expected Senders (Recommended)**
   - Go to the "Settings" tab
   - Add email addresses or domains you regularly receive emails from
   - Examples:
     - `john@company.com` (specific email)
     - `company.com` (entire domain)
     - `hr@organization.org` (department email)

4. **Configure Link Domain Rules (Optional but Recommended)**
   - In the "Expected Link Domains" section
   - Define which domains specific senders can link to
   - Example: If `finance@company.com` should only link to `company.com` and `payroll.com`:
     - Sender: `finance@company.com`
     - Allowed domain: `company.com` → Add
     - Allowed domain: `payroll.com` → Add

5. **Choose Privacy Mode**
   - **Local Only** (Default): All processing on your device
     - Best for privacy
     - No external API calls
     - Works offline
   - **Enhanced**: Enables external domain verification
     - More comprehensive checks
     - Requires internet connection
     - Minimal data sent (only domain names)

### Testing the Installation

1. **Open Gmail or Outlook Web**
   - Navigate to https://mail.google.com or https://outlook.office.com
   - Log in to your account

2. **Open an Email**
   - Click on any email to view it

3. **Verify Email Guard is Active**
   - Look for the Email Guard processing (happens automatically)
   - If the email has no threats, you won't see any alerts
   - The extension works silently in the background

4. **Test with a Suspicious Email** (Optional)
   - If you have a known phishing email in your spam folder
   - Open it to see Email Guard's alert system in action
   - **DO NOT** click any links in suspicious emails

## Organization Deployment

### For IT Administrators

#### Using Chrome Enterprise Policies

1. **Package the Extension**
   - Create a .crx file or use the Chrome Web Store version
   - Host on your internal server if needed

2. **Configure Enterprise Policy**
   - Use Chrome's ExtensionInstallForcelist policy
   - Add Email Guard's extension ID
   - Push via Group Policy (Windows) or MDM

3. **Pre-Configure Settings**
   - Create a managed storage policy
   - Define organization-wide expected senders
   - Set default privacy mode
   - Configure central policy URL

Example managed storage policy:
```json
{
  "expectedSenders": ["company.com", "partner.com"],
  "privacyMode": "enhanced",
  "mode": "organization",
  "organizationConfig": {
    "name": "Acme Corp",
    "adminEmail": "security@acme.com",
    "policyUrl": "https://internal.acme.com/email-guard-policy.json"
  }
}
```

4. **Deploy to Users**
   - Push extension via Chrome Enterprise
   - Extension installs automatically
   - Users see pre-configured settings

#### Manual Organization Setup

If not using enterprise policies:

1. **Install on Each Machine**
   - Follow Method 1 (Load Unpacked) on each computer
   - Or distribute via Chrome Web Store once published

2. **Configure Organization Mode**
   - Open Email Guard popup
   - Go to "Organization" tab
   - Enable "Organization Mode"
   - Enter organization details
   - Save configuration

3. **Share Policy File**
   - Create a central policy JSON file
   - Host on accessible server
   - Provide URL to all users
   - Users enter URL in organization settings

## Troubleshooting

### Extension Not Appearing

**Problem**: Extension icon not visible in toolbar

**Solutions**:
- Click the puzzle piece icon in Chrome toolbar
- Find "Email Guard" and click the pin icon
- The shield icon should now appear in the toolbar

### Alerts Not Showing

**Problem**: No alerts appear when viewing emails

**Solutions**:
1. **Check if protection is enabled**
   - Click Email Guard icon
   - Verify toggle is ON in Dashboard tab

2. **Verify permissions**
   - Go to `chrome://extensions/`
   - Click "Details" on Email Guard
   - Ensure site access is granted

3. **Refresh the email page**
   - Close and reopen the email tab
   - Or press Ctrl+Shift+R (hard refresh)

4. **Check browser console**
   - Press F12 to open DevTools
   - Look for Email Guard messages
   - Report any errors

### Extension Not Working on Outlook

**Problem**: Works on Gmail but not Outlook

**Solutions**:
- Ensure you're using Outlook Web (not desktop app)
- Supported URLs:
  - outlook.live.com
  - outlook.office.com
  - outlook.office365.com
- Check that permissions are granted for Outlook sites
- Try disabling and re-enabling the extension

### Settings Not Saving

**Problem**: Configuration changes don't persist

**Solutions**:
- Check Chrome storage quota
- Clear extension storage and reconfigure
- Ensure Chrome sync is working
- Check for conflicting extensions

## Updating the Extension

### Manual Updates (Unpacked)

1. Download the latest version
2. Replace files in the installation folder
3. Go to `chrome://extensions/`
4. Click the refresh icon on Email Guard card
5. Verify new version number

### Automatic Updates (Chrome Web Store)

- Chrome automatically updates extensions
- No action required
- Check version in extension details

## Uninstallation

### Complete Removal

1. **Open Extensions Page**
   - Navigate to `chrome://extensions/`

2. **Remove Extension**
   - Find Email Guard
   - Click "Remove"
   - Confirm removal

3. **Clear Data (Optional)**
   - Extension data is automatically removed
   - To manually clear:
     - Open Chrome settings
     - Privacy and security → Clear browsing data
     - Advanced → Cached images and files
     - Select "All time" and clear

### Temporary Disable

If you want to disable without uninstalling:

1. Go to `chrome://extensions/`
2. Find Email Guard
3. Toggle the switch to OFF
4. Extension remains installed but inactive

## Getting Help

If you encounter issues not covered here:

1. **Check the README.md** for general information
2. **Review the FAQ** (if available)
3. **Open an issue** on GitHub with:
   - Chrome version
   - Extension version
   - Detailed description of the problem
   - Steps to reproduce
   - Console errors (if any)

---

**Installation complete! You're now protected by Email Guard. 🛡️**
