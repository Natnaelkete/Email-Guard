// Multi-Provider AI Detection Service
// Supports: GitHub Models, OpenAI, Anthropic, Google Gemini, Groq

export type AIProvider = 'github' | 'openai' | 'anthropic' | 'gemini' | 'groq';

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  enabled: boolean;
}

export interface AIDetectionConfig {
  enabled: boolean;
  provider: AIProvider;
  apiKey?: string;
  model?: string;
  confidenceThreshold: number;
}

export interface AIAnalysisResult {
  isPhishing: boolean;
  confidence: number;
  reasons: string[];
  detectedThreats: {
    brandImpersonation?: string;
    urgencyTactics?: boolean;
    suspiciousLanguage?: boolean;
    credentialHarvesting?: boolean;
    maliciousIntent?: boolean;
  };
  recommendation: string;
  provider: string;
}

export interface EmailContext {
  sender: string;
  subject: string;
  body?: string;
  links: Array<{ displayText: string; href: string }>;
  replyTo?: string;
}

// Provider configurations
const PROVIDER_CONFIGS = {
  github: {
    name: 'GitHub Models',
    endpoint: 'https://models.github.ai/inference',
    defaultModel: 'gpt-4o',
    requiresKey: true
  },
  openai: {
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    requiresKey: true
  },
  anthropic: {
    name: 'Anthropic Claude',
    endpoint: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-5-sonnet-20241022',
    requiresKey: true
  },
  gemini: {
    name: 'Google Gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-1.5-pro',
    requiresKey: true
  },
  groq: {
    name: 'Groq',
    endpoint: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    requiresKey: true
  }
};

/**
 * Multi-provider AI phishing detector
 */
export class MultiAIDetector {
  private config: AIDetectionConfig;
  private lastError: string | null = null;

  constructor(config: AIDetectionConfig) {
    this.config = config;
  }

  /**
   * Check if AI is available and configured
   */
  isAvailable(): boolean {
    return this.config.enabled && !!this.config.apiKey;
  }

  /**
   * Get the last error message
   */
  getLastError(): string | null {
    return this.lastError;
  }

  /**
   * Analyze email for phishing using configured AI provider
   */
  async analyzeEmail(emailContext: EmailContext): Promise<AIAnalysisResult | null> {
    if (!this.isAvailable()) {
      return null;
    }

    this.lastError = null;

    try {
      const prompt = this.buildAnalysisPrompt(emailContext);
      const systemPrompt = this.getSystemPrompt();

      let result: any;

      switch (this.config.provider) {
        case 'github':
          result = await this.analyzeWithGitHub(systemPrompt, prompt);
          break;
        case 'openai':
          result = await this.analyzeWithOpenAI(systemPrompt, prompt);
          break;
        case 'anthropic':
          result = await this.analyzeWithAnthropic(systemPrompt, prompt);
          break;
        case 'gemini':
          result = await this.analyzeWithGemini(systemPrompt, prompt);
          break;
        case 'groq':
          result = await this.analyzeWithGroq(systemPrompt, prompt);
          break;
        default:
          throw new Error(`Unsupported provider: ${this.config.provider}`);
      }

      return this.parseAIResponse(result, this.config.provider);
    } catch (error: any) {
      this.lastError = `${PROVIDER_CONFIGS[this.config.provider].name} Error: ${error.message}`;
      console.error('AI analysis error:', error);
      return null;
    }
  }

  /**
   * Analyze with GitHub Models
   */
  private async analyzeWithGitHub(systemPrompt: string, userPrompt: string): Promise<any> {
    const ModelClient = (await import("@azure-rest/ai-inference")).default;
    const { AzureKeyCredential } = await import("@azure/core-auth");
    const { isUnexpected } = await import("@azure-rest/ai-inference");

    const client = ModelClient(
      PROVIDER_CONFIGS.github.endpoint,
      new AzureKeyCredential(this.config.apiKey!)
    );

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        model: this.config.model || PROVIDER_CONFIGS.github.defaultModel,
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" }
      }
    });

    if (isUnexpected(response)) {
      throw new Error(response.body.error?.message || 'GitHub Models API error');
    }

    return JSON.parse(response.body.choices[0]?.message?.content || '{}');
  }

  /**
   * Analyze with OpenAI
   */
  private async analyzeWithOpenAI(systemPrompt: string, userPrompt: string): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || PROVIDER_CONFIGS.openai.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    return JSON.parse(data.choices[0]?.message?.content || '{}');
  }

  /**
   * Analyze with Anthropic Claude
   */
  private async analyzeWithAnthropic(systemPrompt: string, userPrompt: string): Promise<any> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model || PROVIDER_CONFIGS.anthropic.defaultModel,
        max_tokens: 500,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt + '\n\nRespond with valid JSON only.' }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Anthropic API error');
    }

    const data = await response.json();
    const content = data.content[0]?.text || '{}';
    return JSON.parse(content);
  }

  /**
   * Analyze with Google Gemini
   */
  private async analyzeWithGemini(systemPrompt: string, userPrompt: string): Promise<any> {
    const model = this.config.model || PROVIDER_CONFIGS.gemini.defaultModel;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.config.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${userPrompt}\n\nRespond with valid JSON only.`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Gemini API error');
    }

    const data = await response.json();
    const content = data.candidates[0]?.content?.parts[0]?.text || '{}';
    return JSON.parse(content);
  }

  /**
   * Analyze with Groq
   */
  private async analyzeWithGroq(systemPrompt: string, userPrompt: string): Promise<any> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || PROVIDER_CONFIGS.groq.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Groq API error');
    }

    const data = await response.json();
    return JSON.parse(data.choices[0]?.message?.content || '{}');
  }

  /**
   * Build system prompt for AI
   */
  private getSystemPrompt(): string {
    return `You are an expert email security analyst specializing in phishing detection. Analyze emails for phishing indicators and respond ONLY with valid JSON in this exact format:

{
  "isPhishing": boolean,
  "confidence": number (0-1),
  "reasons": ["reason1", "reason2"],
  "detectedThreats": {
    "brandImpersonation": "BrandName" or null,
    "urgencyTactics": boolean,
    "suspiciousLanguage": boolean,
    "credentialHarvesting": boolean,
    "maliciousIntent": boolean
  },
  "recommendation": "string"
}

Focus on:
1. Brand impersonation (fake PayPal, Amazon, Microsoft, etc.)
2. Urgency tactics ("act now", "account suspended")
3. Credential harvesting (asking for passwords, personal info)
4. Suspicious language (poor grammar, threats)
5. Link mismatches (display text vs actual URL)`;
  }

  /**
   * Build analysis prompt
   */
  private buildAnalysisPrompt(email: EmailContext): string {
    let prompt = `Analyze this email for phishing indicators:\n\n`;

    prompt += `**Sender:** ${email.sender}\n`;
    prompt += `**Subject:** ${email.subject}\n`;

    if (email.replyTo && email.replyTo !== email.sender) {
      prompt += `**Reply-To:** ${email.replyTo} (DIFFERENT FROM SENDER)\n`;
    }

    if (email.body) {
      prompt += `**Body Preview:** ${email.body.substring(0, 500)}\n`;
    }

    if (email.links.length > 0) {
      prompt += `\n**Links:**\n`;
      email.links.forEach((link, index) => {
        prompt += `${index + 1}. Display: "${link.displayText}" → URL: ${link.href}\n`;
      });
    }

    prompt += `\nProvide your analysis in JSON format.`;

    return prompt;
  }

  /**
   * Parse AI response
   */
  private parseAIResponse(analysis: any, provider: string): AIAnalysisResult {
    return {
      isPhishing: analysis.isPhishing || false,
      confidence: Math.min(Math.max(analysis.confidence || 0, 0), 1),
      reasons: Array.isArray(analysis.reasons) ? analysis.reasons : [],
      detectedThreats: {
        brandImpersonation: analysis.detectedThreats?.brandImpersonation || undefined,
        urgencyTactics: analysis.detectedThreats?.urgencyTactics || false,
        suspiciousLanguage: analysis.detectedThreats?.suspiciousLanguage || false,
        credentialHarvesting: analysis.detectedThreats?.credentialHarvesting || false,
        maliciousIntent: analysis.detectedThreats?.maliciousIntent || false
      },
      recommendation: analysis.recommendation || "Exercise caution with this email.",
      provider: PROVIDER_CONFIGS[provider as AIProvider].name
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AIDetectionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.lastError = null;
  }

  /**
   * Test connection to AI provider
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.config.apiKey) {
      return { success: false, message: 'No API key provided' };
    }

    try {
      const testResult = await this.analyzeEmail({
        sender: 'test@example.com',
        subject: 'Test',
        body: 'This is a test email.',
        links: []
      });

      if (testResult) {
        return {
          success: true,
          message: `✅ Connected to ${PROVIDER_CONFIGS[this.config.provider].name} successfully!`
        };
      } else {
        return {
          success: false,
          message: this.lastError || 'Connection test failed'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `❌ ${error.message}`
      };
    }
  }
}

// Export provider configurations
export { PROVIDER_CONFIGS };

// Singleton instance
let multiAIDetectorInstance: MultiAIDetector | null = null;

export function initializeMultiAIDetector(config: AIDetectionConfig): MultiAIDetector {
  multiAIDetectorInstance = new MultiAIDetector(config);
  return multiAIDetectorInstance;
}

export function getMultiAIDetector(): MultiAIDetector | null {
  return multiAIDetectorInstance;
}
