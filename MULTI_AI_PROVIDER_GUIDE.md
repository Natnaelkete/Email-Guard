# 🤖 Multi-AI Provider Guide

## Overview

Email Guard now supports **multiple AI providers** for phishing detection! Users can choose from:

- **Built-in AI** (Default) - Uses your GitHub token, no user setup needed
- **GitHub Models** - User's own GitHub token
- **OpenAI** - GPT-4, GPT-4o, GPT-3.5-turbo
- **Anthropic** - Claude 3.5 Sonnet, Claude 3.5 Haiku
- **Google Gemini** - Gemini 1.5 Pro, Gemini 1.5 Flash
- **Groq** - Llama 3.3, Mixtral (Fast & Free!)

---

## 🎯 How It Works

### For Users Without API Keys

1. **Enable AI Detection** in Settings
2. **Select "Built-in AI"** (default)
3. **Done!** AI works automatically using your built-in token

### For Users With Their Own API Keys

1. **Enable AI Detection** in Settings
2. **Select AI Provider** (OpenAI, Claude, etc.)
3. **Enter API Key**
4. **Optional: Specify Model**
5. **Click "Save Configuration"**
6. **Test Connection** to verify
7. **Done!** Extension uses their chosen provider

---

## 🎨 User Interface

### Settings Tab → AI-Powered Detection

```
🤖 AI-Powered Detection
├── [Toggle] Enable AI Analysis
└── [When Enabled]
    ├── AI Provider Dropdown
    │   ├── Built-in AI (Default)
    │   ├── GitHub Models
    │   ├── OpenAI (GPT-4)
    │   ├── Anthropic (Claude)
    │   ├── Google Gemini
    │   └── Groq (Fast & Free)
    │
    ├── [If Custom Provider Selected]
    │   ├── API Key Input (password field)
    │   ├── Model Input (optional)
    │   ├── [Save Configuration] Button
    │   └── [Test Connection] Button
    │
    └── Status Display (success/error/info)
```

### Status Messages

**Success:**
- ✅ Configuration saved successfully!
- ✅ Connected to OpenAI successfully!
- ✅ Using built-in AI

**Error:**
- ❌ Please enter an API key
- ❌ OpenAI API error: Invalid API key
- ❌ Connection failed

**Info:**
- 🔌 Testing connection to OpenAI...
- 🔌 Testing built-in AI connection...

---

## 🔧 Provider Configuration

### Built-in AI (Default)

**No configuration needed!**
- Uses your GitHub token from `.env`
- Works automatically for all users
- No user setup required

### GitHub Models

**Get API Key:**
- https://github.com/settings/tokens
- No specific scopes required

**Models:**
- Default: `gpt-4o`
- Alternative: `gpt-4o-mini`

### OpenAI

**Get API Key:**
- https://platform.openai.com/api-keys
- Requires billing setup

**Models:**
- Default: `gpt-4o`
- Alternatives: `gpt-4o-mini`, `gpt-3.5-turbo`

**Cost:** ~$0.01 per email analysis

### Anthropic Claude

**Get API Key:**
- https://console.anthropic.com/settings/keys
- Requires billing setup

**Models:**
- Default: `claude-3-5-sonnet-20241022`
- Alternative: `claude-3-5-haiku-20241022` (cheaper)

**Cost:** ~$0.015 per email analysis

### Google Gemini

**Get API Key:**
- https://makersuite.google.com/app/apikey
- Free tier available!

**Models:**
- Default: `gemini-1.5-pro`
- Alternative: `gemini-1.5-flash` (faster)

**Cost:** Free tier: 15 requests/minute

### Groq

**Get API Key:**
- https://console.groq.com/keys
- **FREE** with generous limits!

**Models:**
- Default: `llama-3.3-70b-versatile`
- Alternative: `mixtral-8x7b-32768`

**Cost:** FREE! 🎉

---

## 💾 Data Storage

### Chrome Storage

```javascript
{
  aiDetectionEnabled: true,
  aiProvider: 'openai',        // or 'builtin', 'github', etc.
  aiApiKey: 'sk-...',          // encrypted by Chrome
  aiModel: 'gpt-4o-mini'       // optional
}
```

### Security

- API keys stored in `chrome.storage.local`
- Encrypted by Chrome browser
- Never sent to any server except the chosen AI provider
- Masked in UI after saving (`••••••••••••••••`)

---

## 🔌 Connection Testing

### Test Flow

1. User clicks "Test Connection"
2. Extension creates temporary AI detector
3. Sends test email to AI provider
4. Returns success/error message
5. Shows nice status display

### Test Email

```javascript
{
  sender: 'test@example.com',
  subject: 'Test',
  body: 'This is a test email.',
  links: []
}
```

### Success Response

```
✅ Connected to OpenAI successfully!
```

### Error Response

```
❌ OpenAI Error: Invalid API key
```

---

## 🎯 Provider Selection Logic

### Background Script Logic

```javascript
// On extension load
if (aiDetectionEnabled) {
  if (aiProvider === 'builtin' || !aiApiKey) {
    // Use built-in AI
    if (hasBuiltInToken()) {
      initializeAI('github', BUILTIN_GITHUB_TOKEN);
    }
  } else {
    // Use user's provider
    initializeAI(aiProvider, aiApiKey, aiModel);
  }
}
```

### Priority

1. **User's custom provider** (if configured)
2. **Built-in AI** (if available)
3. **Disabled** (if no token available)

---

## 📊 AI Analysis Results

### Alert Format

```javascript
{
  severity: 'high',
  type: 'ai_phishing_detection',
  message: 'OpenAI detected potential phishing (92% confidence)',
  details: 'Brand impersonation: PayPal; Urgency tactics detected',
  recommendation: 'Do not click any links. Delete this email.',
  aiAnalysis: {
    confidence: 0.92,
    threats: {
      brandImpersonation: 'PayPal',
      urgencyTactics: true,
      credentialHarvesting: true,
      suspiciousLanguage: false,
      maliciousIntent: true
    },
    provider: 'OpenAI'
  }
}
```

### Console Logs

**Analysis Start:**
```
🤖 Running AI analysis...
```

**Threat Detected:**
```
⚠️  OpenAI flagged as phishing: {
  isPhishing: true,
  confidence: 0.92,
  provider: 'OpenAI'
}
```

**No Threat:**
```
✅ OpenAI analysis complete - no threats detected
```

**Error:**
```
AI analysis error: OpenAI Error: Rate limit exceeded
Detailed error: OpenAI Error: Rate limit exceeded
```

---

## 🚀 User Experience

### Scenario 1: New User (No API Key)

1. Install extension
2. Enable AI Detection
3. See "Built-in AI (Default)" selected
4. Click Save (optional)
5. ✅ AI works immediately!

### Scenario 2: User With OpenAI Key

1. Install extension
2. Enable AI Detection
3. Select "OpenAI (GPT-4)"
4. Enter API key
5. Click "Test Connection"
6. See: ✅ Connected to OpenAI successfully!
7. Click "Save Configuration"
8. ✅ Extension uses OpenAI!

### Scenario 3: Switching Providers

1. User has OpenAI configured
2. Wants to try Groq (free!)
3. Select "Groq (Fast & Free)"
4. Enter Groq API key
5. Test connection
6. Save configuration
7. ✅ Now using Groq!

### Scenario 4: Error Handling

1. User enters invalid API key
2. Clicks "Test Connection"
3. Sees: ❌ OpenAI API error: Invalid API key
4. Error stays visible (doesn't auto-hide)
5. User fixes key and retries
6. ✅ Success!

---

## 🎨 UI Behavior

### Provider Dropdown Change

- **Built-in AI selected:**
  - Hide API key input
  - Hide model input
  - Hide save/test buttons
  - Show: "Using our built-in AI service"

- **Custom provider selected:**
  - Show API key input
  - Show model input
  - Show save/test buttons
  - Update help text with provider-specific info

### Save Button

- Validates API key (if custom provider)
- Saves to Chrome storage
- Notifies background script
- Masks API key in UI
- Shows success message
- Auto-hides after 5 seconds

### Test Button

- Validates API key
- Shows "Testing..." message
- Calls background script
- Displays result
- Errors don't auto-hide

---

## 🔒 Security & Privacy

### API Key Storage

- Stored in `chrome.storage.local`
- Encrypted by Chrome
- Never logged to console
- Masked in UI after saving

### Data Sent to AI

**Sent:**
- Sender email
- Subject line
- First 500 chars of body
- Link URLs and display text

**NOT Sent:**
- Full email content
- Attachments
- Your personal data
- Other emails

### Provider Privacy

- **Built-in AI:** Your token, your responsibility
- **User's provider:** Their token, their data
- **No tracking:** We don't see their API usage

---

## 📈 Performance

### Response Times

| Provider | Avg Time | Notes |
|----------|----------|-------|
| Groq | 0.5-1s | Fastest! |
| Gemini | 1-2s | Fast |
| OpenAI | 2-3s | Standard |
| Claude | 2-4s | Thorough |
| GitHub | 2-3s | Standard |

### Cost Comparison

| Provider | Cost/Email | Free Tier |
|----------|-----------|-----------|
| Groq | FREE | Yes! |
| Gemini | FREE | 15/min |
| GitHub | FREE | Limited |
| OpenAI | $0.01 | No |
| Claude | $0.015 | No |

---

## 🛠️ Implementation Details

### Files Modified

1. **`src/services/multi-ai-detector.ts`** - New multi-provider service
2. **`public/popup.html`** - Updated UI with provider selection
3. **`src/popup.ts`** - Provider selection handlers
4. **`src/background.ts`** - Multi-provider initialization
5. **`src/config.ts`** - Configuration constants

### Key Functions

**Multi-AI Detector:**
- `analyzeEmail()` - Routes to correct provider
- `testConnection()` - Tests provider connectivity
- `analyzeWithOpenAI()` - OpenAI implementation
- `analyzeWithAnthropic()` - Claude implementation
- `analyzeWithGemini()` - Gemini implementation
- `analyzeWithGroq()` - Groq implementation
- `analyzeWithGitHub()` - GitHub Models implementation

**Popup:**
- `saveAIConfiguration()` - Saves user config
- `testAIConnection()` - Tests connection
- `showAIStatus()` - Displays status messages

**Background:**
- `initializeAI()` - Initializes correct provider
- `handleAIConfigUpdate()` - Updates configuration
- `handleAIConnectionTest()` - Tests connection

---

## ✅ Testing Checklist

### Built-in AI

- [ ] Enable AI Detection
- [ ] Select "Built-in AI"
- [ ] Verify console shows: ✅ Built-in AI enabled
- [ ] Send test phishing email
- [ ] Verify AI analysis runs

### Custom Provider (OpenAI)

- [ ] Enable AI Detection
- [ ] Select "OpenAI (GPT-4)"
- [ ] Enter valid API key
- [ ] Click "Test Connection"
- [ ] Verify: ✅ Connected to OpenAI successfully!
- [ ] Click "Save Configuration"
- [ ] Verify: ✅ Configuration saved successfully!
- [ ] Send test phishing email
- [ ] Verify alert shows: "OpenAI detected potential phishing"

### Error Handling

- [ ] Enter invalid API key
- [ ] Click "Test Connection"
- [ ] Verify error message displays
- [ ] Error doesn't auto-hide
- [ ] Fix key and retry
- [ ] Verify success

### Provider Switching

- [ ] Configure OpenAI
- [ ] Switch to Groq
- [ ] Enter Groq key
- [ ] Save and test
- [ ] Verify Groq is used

---

## 🎉 Benefits

### For Users

✅ **Choice** - Pick their preferred AI provider  
✅ **Cost Control** - Use free providers (Groq, Gemini)  
✅ **Privacy** - Use their own API keys  
✅ **Flexibility** - Switch providers anytime  
✅ **Fallback** - Built-in AI always available  

### For Developers

✅ **Scalability** - Users bring their own API keys  
✅ **Cost Savings** - Not paying for all users' AI  
✅ **Flexibility** - Easy to add new providers  
✅ **Reliability** - Multiple fallback options  

---

## 📚 Resources

### Provider Documentation

- **GitHub Models:** https://github.com/marketplace/models
- **OpenAI:** https://platform.openai.com/docs
- **Anthropic:** https://docs.anthropic.com
- **Google Gemini:** https://ai.google.dev/docs
- **Groq:** https://console.groq.com/docs

### API Key Management

- **GitHub:** https://github.com/settings/tokens
- **OpenAI:** https://platform.openai.com/api-keys
- **Anthropic:** https://console.anthropic.com/settings/keys
- **Gemini:** https://makersuite.google.com/app/apikey
- **Groq:** https://console.groq.com/keys

---

**Status:** Multi-provider AI fully implemented ✅  
**User Experience:** Seamless with nice error handling ✅  
**Built-in AI:** Works automatically ✅  
**Custom Providers:** Full support for 5 providers ✅
