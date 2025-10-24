# Built-in AI Setup Guide

## 🎯 Overview

Email Guard now supports **built-in AI detection** using your GitHub token! The AI functionality works automatically without requiring users to provide their own tokens.

---

## 🔧 Setup for Developers

### Step 1: Create `.env` File

Create a `.env` file in the project root:

```bash
# .env
GITHUB_TOKEN=your_github_personal_access_token_here
```

**How to get your GitHub token:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it: "Email Guard AI"
4. No specific scopes required
5. Copy the token

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- `@azure-rest/ai-inference` - GitHub Models SDK
- `@azure/core-auth` - Authentication
- `@azure/core-sse` - Server-sent events
- `dotenv` - Environment variable loader

### Step 3: Build the Extension

```bash
npm run build
```

**What happens during build:**
1. ✅ TypeScript compiles to JavaScript
2. ✅ Assets copied to `dist/`
3. ✅ **GitHub token injected** from `.env` into `config.js`
4. ✅ Extension ready with built-in AI

### Step 4: Load in Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist/` folder
5. ✅ AI detection works automatically!

---

## 🔒 Security

### Token Protection

1. **`.env` is gitignored** - Token never committed
2. **Token injected at build time** - Only in `dist/` folder
3. **`dist/` is gitignored** - Built files never committed
4. **Users get working AI** - No token setup needed

### For Production

When distributing to users:
1. Build with your token: `npm run build`
2. Zip the `dist/` folder
3. Upload to Chrome Web Store
4. Users get AI detection automatically!

### Token Usage

- Your token is used for all users
- GitHub Models has rate limits
- Free tier should handle moderate usage
- Monitor usage at https://github.com/settings/tokens

---

## 🎯 How It Works

### Build Process

```
npm run build
    ↓
1. tsc (TypeScript compile)
    ↓
2. copy-assets.js (Copy HTML/CSS/manifest)
    ↓
3. inject-env.js (Inject GitHub token)
    ↓
dist/ folder ready with built-in AI!
```

### Token Injection

**Before injection** (`dist/config.js`):
```javascript
export const BUILTIN_GITHUB_TOKEN = "__GITHUB_TOKEN__";
```

**After injection** (`dist/config.js`):
```javascript
export const BUILTIN_GITHUB_TOKEN = "ghp_your_actual_token_here";
```

### Runtime Behavior

```javascript
// On extension startup
if (hasBuiltInToken()) {
  // ✅ Use built-in token (your token)
  initializeAI(BUILTIN_GITHUB_TOKEN);
} else {
  // ⚠️ Fallback to user token (if provided)
  initializeAI(userToken);
}
```

---

## 🧪 Testing

### Test Built-in AI

1. Build with token: `npm run build`
2. Load extension in Chrome
3. Open browser console
4. Look for: `✅ AI Detection enabled with built-in token`
5. Send test phishing email
6. Check for AI analysis in console

### Test Without Token

1. Remove `.env` file
2. Build: `npm run build`
3. Load extension
4. Console shows: `⚠️ No .env file found`
5. Users can still provide their own token in settings

---

## 📊 Token Management

### Rate Limits

GitHub Models free tier:
- Limited requests per minute
- Sufficient for moderate usage
- Monitor at GitHub settings

### Token Rotation

To update token:
1. Generate new token on GitHub
2. Update `.env` file
3. Rebuild: `npm run build`
4. Reload extension

### Multiple Environments

**Development:**
```bash
# .env
GITHUB_TOKEN=ghp_dev_token_here
```

**Production:**
```bash
# .env.production
GITHUB_TOKEN=ghp_prod_token_here
```

Use different tokens for dev/prod if needed.

---

## 🎨 User Experience

### With Built-in Token

✅ AI works immediately after installation  
✅ No setup required  
✅ Seamless phishing detection  
✅ Users don't see token settings  

### Without Built-in Token

⚠️ AI disabled by default  
📝 Users can enable in settings  
🔑 Users provide their own token  
✅ Still works, just requires setup  

---

## 🔧 Configuration

### AI Settings (`src/config.ts`)

```typescript
export const AI_CONFIG = {
  enabled: true,              // Enable AI by default
  confidenceThreshold: 0.7,   // 70% confidence to alert
  endpoint: "https://models.github.ai/inference",
  model: "gpt-4o"            // GPT-4 Optimized
};
```

### Adjust Confidence Threshold

Higher = fewer false positives, may miss some threats  
Lower = catch more threats, more false positives  

**Recommended:** 0.7 (70%)

---

## 📝 Files Overview

### New Files

- `src/config.ts` - Configuration with token placeholder
- `src/services/ai-detector.ts` - AI detection service
- `scripts/inject-env.js` - Token injection script
- `.env.example` - Template for `.env`
- `.env` - Your actual token (gitignored)

### Modified Files

- `src/background.ts` - AI integration
- `src/popup.ts` - AI settings UI
- `public/popup.html` - AI settings section
- `package.json` - Build script + dependencies

---

## ✅ Checklist

### For Developers

- [ ] Create `.env` file with GitHub token
- [ ] Run `npm install`
- [ ] Run `npm run build`
- [ ] Check console for: `✅ GitHub token injected successfully!`
- [ ] Load `dist/` in Chrome
- [ ] Verify AI works (check console logs)

### For Distribution

- [ ] Build with production token
- [ ] Test AI detection
- [ ] Zip `dist/` folder
- [ ] Upload to Chrome Web Store
- [ ] Users get automatic AI detection!

---

## 🆘 Troubleshooting

### "No .env file found"

**Solution:** Create `.env` file in project root with `GITHUB_TOKEN=your_token`

### "config.js not found"

**Solution:** Run `npm run build` first to compile TypeScript

### "AI Detection disabled"

**Check:**
1. Token in `.env` file
2. Build completed successfully
3. Extension reloaded in Chrome
4. Console logs for errors

### "Token injected but AI not working"

**Check:**
1. Token is valid (not expired)
2. Token has correct format (starts with `ghp_`)
3. GitHub Models API is accessible
4. Check network tab for API errors

---

## 🚀 Quick Start

```bash
# 1. Create .env file
echo "GITHUB_TOKEN=your_token_here" > .env

# 2. Install dependencies
npm install

# 3. Build extension
npm run build

# 4. Load dist/ folder in Chrome
# 5. AI works automatically! 🎉
```

---

## 📚 Additional Resources

- **GitHub Models:** https://github.com/marketplace/models
- **Token Management:** https://github.com/settings/tokens
- **AI Setup Guide:** `AI_SETUP_GUIDE.md`
- **GitHub Models Config:** `GITHUB_MODELS_CONFIG.md`

---

**Status:** Built-in AI ready for deployment ✅  
**User Experience:** Seamless, no setup required ✅  
**Security:** Token protected, never committed ✅
