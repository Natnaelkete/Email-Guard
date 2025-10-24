# Email Guard - Quick Start Guide

Get Email Guard up and running in 5 minutes! 🚀

## Step 1: Install the Extension (2 minutes)

### Option A: Load from Source

1. **Download** the Email Guard folder to your computer
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable** "Developer mode" (toggle in top-right)
4. **Click** "Load unpacked"
5. **Select** the Email-Guard folder
6. **Done!** You should see the shield icon 🛡️ in your toolbar

### Option B: Generate Icons First

If you don't see icons:

1. **Open** `create-icons.html` in your browser
2. **Click** "Download All Icons"
3. **Create** an `icons` folder in Email-Guard directory (if not exists)
4. **Save** the downloaded files as icon16.png, icon32.png, icon48.png, icon128.png
5. **Reload** the extension in Chrome

## Step 2: Basic Configuration (2 minutes)

1. **Click** the Email Guard shield icon in your toolbar
2. **Go to** the Settings tab
3. **Add expected senders** (people you regularly email with):
   - Type an email: `boss@company.com` → Click Add
   - Or a domain: `company.com` → Click Add
4. **Choose privacy mode**:
   - Keep "Local Only" for maximum privacy (recommended)
   - Or select "Enhanced" for deeper checks

## Step 3: Test It Out (1 minute)

1. **Open Gmail** or **Outlook Web**
2. **Click on any email**
3. **Email Guard** automatically scans it
4. **If threats detected**, you'll see a colored alert:
   - 🛑 **Red** = High risk (don't click anything!)
   - ⚠️ **Yellow** = Medium risk (be careful)
   - ℹ️ **Blue** = Low risk (informational)

## That's It! You're Protected! 🎉

## Optional: Advanced Setup

### Add Link Domain Rules

Specify which domains specific senders can link to:

1. **Settings tab** → Expected Link Domains
2. **Sender**: `finance@company.com`
3. **Allowed domain**: `company.com` → Add
4. Now if finance sends a link to any other domain, you'll get an alert!

### Enable Organization Mode

For teams and businesses:

1. **Organization tab** → Enable Organization Mode
2. **Enter** organization name and admin email
3. **Configure** central policies
4. **Share** settings with your team

## Common Use Cases

### Personal Use
```
Expected Senders:
- gmail.com (personal contacts)
- company.com (work emails)
- bank.com (your bank)

Expected Link Domains:
- bank.com → bank.com only
- company.com → company.com, company-cdn.com
```

### Business Use
```
Expected Senders:
- mycompany.com (internal)
- partner.com (trusted partner)
- vendor.com (approved vendor)

Expected Link Domains:
- mycompany.com → mycompany.com, cdn.mycompany.com
- partner.com → partner.com
```

## What Email Guard Protects Against

✅ **Phishing emails** - Fake emails pretending to be legitimate  
✅ **Malicious links** - Links that look safe but aren't  
✅ **Sender impersonation** - Fake sender addresses  
✅ **Look-alike domains** - paypal.com vs pαypal.com  
✅ **Suspicious patterns** - Common phishing tactics  
✅ **Unknown senders** - Emails from unexpected sources  

## Tips for Best Protection

1. **Add your regular contacts** to expected senders
2. **Review alerts carefully** - don't just dismiss them
3. **Use "Mark as Safe"** for legitimate emails to reduce false positives
4. **Check the Dashboard** regularly to see what's been blocked
5. **Keep the extension updated** for latest protections

## Troubleshooting

### No alerts showing?
- Check if protection is enabled (Dashboard tab)
- Refresh the email page
- Verify extension has permissions

### Too many false alerts?
- Add trusted senders to whitelist
- Use "Mark as Safe" on legitimate emails
- Adjust expected sender list

### Extension not working?
- Reload extension in chrome://extensions/
- Check browser console for errors (F12)
- Verify you're on Gmail or Outlook Web

## Next Steps

- Explore the **Alerts tab** to see what's been detected
- Review **Statistics** to see how many emails you've scanned
- Configure **Organization mode** if using for a team
- Read the full **README.md** for advanced features

---

**You're all set! Email Guard is now protecting your inbox. 🛡️**

Stay safe online!
