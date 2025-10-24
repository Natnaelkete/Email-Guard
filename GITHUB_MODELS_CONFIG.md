# GitHub Models Configuration - Quick Reference

## ✅ Correct Configuration

### Endpoint
```typescript
const endpoint = "https://models.github.ai/inference";
```

### Model Name
```typescript
const modelName = "gpt-4o";
// Alternative format: "openai/gpt-4o"
```

### Authentication
```typescript
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env["GITHUB_TOKEN"]; // or from chrome.storage
const client = ModelClient(endpoint, new AzureKeyCredential(token));
```

### API Call Example
```typescript
const response = await client.path("/chat/completions").post({
  body: {
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Analyze this email..." }
    ],
    model: modelName,
    temperature: 0.3,
    max_tokens: 500,
    response_format: { type: "json_object" } // For JSON responses
  }
});

if (isUnexpected(response)) {
  throw response.body.error;
}

const result = response.body.choices[0].message.content;
```

## 🔑 GitHub Token Setup

### Token Requirements
- **No specific scopes required** for GitHub Models
- Optional: `read:user` for basic access
- Token must be valid and active

### Where to Get Token
1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Name it: "Email Guard AI"
4. No scopes needed (or select `read:user`)
5. Copy the token

### Token Storage
```typescript
// In Chrome extension
await chrome.storage.local.set({ githubToken: token });

// Retrieve
const { githubToken } = await chrome.storage.local.get('githubToken');
```

## 📦 Required Dependencies

```json
{
  "dependencies": {
    "@azure-rest/ai-inference": "^1.0.0-beta.2",
    "@azure/core-auth": "^1.5.0",
    "@azure/core-sse": "^2.3.0"
  }
}
```

Install with:
```bash
npm install
```

## 🎯 Available Models

GitHub Models provides access to:
- `gpt-4o` - Latest GPT-4 Optimized
- `gpt-4o-mini` - Faster, cheaper variant
- `gpt-3.5-turbo` - Legacy model
- Other models (check GitHub Models marketplace)

## ⚡ Rate Limits

- **Free tier**: Limited requests per minute
- **Rate limiting**: Automatic retry recommended
- **Best practice**: Cache results when possible

## 🔒 Security Notes

1. **Never commit tokens** to git
2. **Store securely** in chrome.storage
3. **Rotate regularly** (every 90 days)
4. **Revoke if compromised**
5. **Use environment variables** in development

## 🧪 Testing

### Test Connection
```typescript
async function testGitHubModels(token: string) {
  const client = ModelClient(
    "https://models.github.ai/inference",
    new AzureKeyCredential(token)
  );
  
  const response = await client.path("/chat/completions").post({
    body: {
      messages: [
        { role: "user", content: "Hello!" }
      ],
      model: "gpt-4o",
      max_tokens: 10
    }
  });
  
  if (isUnexpected(response)) {
    console.error("Error:", response.body.error);
    return false;
  }
  
  console.log("Success:", response.body.choices[0].message.content);
  return true;
}
```

## 📊 Response Format

### Standard Response
```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Response text here"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

### JSON Mode Response
When using `response_format: { type: "json_object" }`:
```json
{
  "choices": [
    {
      "message": {
        "content": "{\"key\": \"value\"}"
      }
    }
  ]
}
```

## 🚀 Email Guard Integration

### In `ai-detector.ts`
```typescript
const endpoint = "https://models.github.ai/inference";
const modelName = "gpt-4o";

// Initialize
const client = ModelClient(endpoint, new AzureKeyCredential(githubToken));

// Analyze email
const response = await client.path("/chat/completions").post({
  body: {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: emailAnalysisPrompt }
    ],
    model: modelName,
    temperature: 0.3,
    response_format: { type: "json_object" }
  }
});
```

## ✅ Checklist

- [x] Endpoint set to `https://models.github.ai/inference`
- [x] Model name is `gpt-4o`
- [x] Dependencies installed
- [x] GitHub token generated
- [x] Token saved in extension
- [ ] Test API connection
- [ ] Verify phishing detection works

## 🔗 Resources

- **GitHub Models**: https://github.com/marketplace/models
- **Azure AI SDK**: https://www.npmjs.com/package/@azure-rest/ai-inference
- **Documentation**: https://learn.microsoft.com/azure/ai-services/

---

**Status**: Configuration updated and verified ✅
**Build**: Successful ✅
**Ready for testing**: Yes ✅
