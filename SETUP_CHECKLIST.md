# Email Guard - Setup Checklist

Use this checklist to ensure Email Guard is properly set up and ready to use.

## 📋 Pre-Installation Checklist

- [ ] Chrome browser installed (version 88 or higher)
- [ ] Downloaded/cloned Email Guard files
- [ ] All files present in Email-Guard directory

## 🎨 Icon Generation (Required)

- [ ] Open `create-icons.html` in your browser
- [ ] Click "Download All Icons"
- [ ] Create `icons` folder in Email-Guard directory (if not exists)
- [ ] Save downloaded files as:
  - [ ] icon16.png
  - [ ] icon32.png
  - [ ] icon48.png
  - [ ] icon128.png
- [ ] Verify all 4 icon files are in the `icons` folder

## 🔧 Chrome Extension Installation

- [ ] Open Chrome browser
- [ ] Navigate to `chrome://extensions/`
- [ ] Enable "Developer mode" (toggle in top-right)
- [ ] Click "Load unpacked"
- [ ] Select the Email-Guard folder
- [ ] Extension appears in extensions list
- [ ] Extension shows "Enabled" status
- [ ] Shield icon (🛡️) visible in Chrome toolbar
- [ ] No errors shown in extension card

## ⚙️ Initial Configuration

### Basic Setup
- [ ] Click Email Guard icon in toolbar
- [ ] Popup opens successfully
- [ ] Dashboard tab displays
- [ ] Statistics show "0 Emails Scanned, 0 Threats Blocked"
- [ ] Status indicator shows "Active" (green dot)

### Settings Configuration
- [ ] Navigate to Settings tab
- [ ] Privacy Mode is set to "Local Only" (default)
- [ ] Add at least one expected sender
- [ ] Verify sender appears in list
- [ ] Test remove button works

### Optional: Advanced Configuration
- [ ] Add expected link domains for specific senders
- [ ] Add whitelisted domains
- [ ] Configure organization mode (if needed)

## 🧪 Testing

### Gmail Testing
- [ ] Open https://mail.google.com
- [ ] Log in to your account
- [ ] Click on any email
- [ ] Email opens successfully
- [ ] No console errors (press F12 to check)
- [ ] Extension is working silently

### Outlook Testing
- [ ] Open https://outlook.office.com or https://outlook.live.com
- [ ] Log in to your account
- [ ] Click on any email
- [ ] Email opens successfully
- [ ] No console errors
- [ ] Extension is working

## 🔍 Verification

### Extension Functionality
- [ ] Extension icon clickable
- [ ] Popup opens without errors
- [ ] All tabs accessible (Dashboard, Settings, Alerts, Organization)
- [ ] Settings save and persist
- [ ] Statistics update when emails viewed

### Performance
- [ ] Email loading not noticeably slower
- [ ] Chrome not lagging
- [ ] No console errors or warnings

### Permissions
- [ ] Extension has access to Gmail
- [ ] Extension has access to Outlook
- [ ] Storage permission granted

## ✅ Final Verification

- [ ] Extension installed and active
- [ ] Icons generated and displaying
- [ ] Basic configuration complete
- [ ] Tested on at least one email client
- [ ] No errors or issues
- [ ] Ready to use daily

## 🎉 Setup Complete!

If all items are checked, Email Guard is ready to protect your inbox!

### Quick Reference
- **Enable/Disable**: Click icon → Dashboard → Toggle
- **Add Sender**: Click icon → Settings → Expected Senders
- **View Alerts**: Click icon → Alerts tab
- **Get Help**: See FAQ.md or README.md

---

**Congratulations! Email Guard is now protecting your inbox. 🛡️**
