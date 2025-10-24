// AI-Powered Phishing Detection Service
// Uses GitHub Models (GPT-4o) for intelligent email analysis

import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const endpoint = "https://models.github.ai/inference";
const modelName = "gpt-4o"; // or "openai/gpt-4o" depending on GitHub Models availability

// AI Detection Configuration
interface AIDetectionConfig {
  enabled: boolean;
  githubToken?: string;
  confidenceThreshold: number; // 0-1, minimum confidence to flag as phishing
}

interface AIAnalysisResult {
  isPhishing: boolean;
  confidence: number; // 0-1
  reasons: string[];
  detectedThreats: {
    brandImpersonation?: string;
    urgencyTactics?: boolean;
    suspiciousLanguage?: boolean;
    credentialHarvesting?: boolean;
    maliciousIntent?: boolean;
  };
  recommendation: string;
}

interface EmailContext {
  sender: string;
  subject: string;
  body?: string;
  links: Array<{ displayText: string; href: string }>;
  replyTo?: string;
}

/**
 * AI-powered email analysis using GitHub Models
 */
export class AIPhishingDetector {
  private client: any;
  private config: AIDetectionConfig;

  constructor(config: AIDetectionConfig) {
    this.config = config;

    if (config.enabled && config.githubToken) {
      try {
        this.client = ModelClient(
          endpoint,
          new AzureKeyCredential(config.githubToken)
        );
      } catch (error) {
        console.error("Failed to initialize AI client:", error);
        this.client = null;
      }
    }
  }

  /**
   * Analyze email for phishing indicators using AI
   */
  async analyzeEmail(
    emailContext: EmailContext
  ): Promise<AIAnalysisResult | null> {
    if (!this.client || !this.config.enabled) {
      return null;
    }

    try {
      const prompt = this.buildAnalysisPrompt(emailContext);

      const response = await this.client.path("/chat/completions").post({
        body: {
          messages: [
            {
              role: "system",
              content: this.getSystemPrompt(),
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          model: modelName,
          temperature: 0.3, // Lower temperature for more consistent analysis
          max_tokens: 500,
          response_format: { type: "json_object" },
        },
      });

      if (isUnexpected(response)) {
        console.error("AI Analysis failed:", response.body.error);
        return null;
      }

      const result = response.body.choices[0]?.message?.content;
      if (!result) return null;

      const analysis = JSON.parse(result);
      return this.parseAIResponse(analysis);
    } catch (error) {
      console.error("AI analysis error:", error);
      return null;
    }
  }

  /**
   * System prompt for AI model
   */
  private getSystemPrompt(): string {
    return `You are an expert email security analyst specializing in phishing detection. 
Analyze emails for phishing indicators including:

1. **Brand Impersonation**: Fake emails pretending to be from legitimate companies (PayPal, Amazon, Microsoft, Google, Apple, banks, etc.)
2. **Urgency Tactics**: Language creating false urgency ("account suspended", "verify now", "immediate action required")
3. **Credential Harvesting**: Requests for passwords, personal info, or login credentials
4. **Suspicious Language**: Poor grammar, unusual phrasing, threatening language
5. **Link Manipulation**: Display text doesn't match actual URL, suspicious domains
6. **Social Engineering**: Manipulation tactics, impersonation, fake authority

Respond ONLY with valid JSON in this exact format:
{
  "isPhishing": boolean,
  "confidence": number (0-1),
  "reasons": ["reason1", "reason2"],
  "detectedThreats": {
    "brandImpersonation": "brand name or null",
    "urgencyTactics": boolean,
    "suspiciousLanguage": boolean,
    "credentialHarvesting": boolean,
    "maliciousIntent": boolean
  },
  "recommendation": "string"
}`;
  }

  /**
   * Build analysis prompt from email context
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
   * Parse and validate AI response
   */
  private parseAIResponse(analysis: any): AIAnalysisResult {
    return {
      isPhishing: analysis.isPhishing || false,
      confidence: Math.min(Math.max(analysis.confidence || 0, 0), 1),
      reasons: Array.isArray(analysis.reasons) ? analysis.reasons : [],
      detectedThreats: {
        brandImpersonation:
          analysis.detectedThreats?.brandImpersonation || undefined,
        urgencyTactics: analysis.detectedThreats?.urgencyTactics || false,
        suspiciousLanguage:
          analysis.detectedThreats?.suspiciousLanguage || false,
        credentialHarvesting:
          analysis.detectedThreats?.credentialHarvesting || false,
        maliciousIntent: analysis.detectedThreats?.maliciousIntent || false,
      },
      recommendation:
        analysis.recommendation || "Exercise caution with this email.",
    };
  }

  /**
   * Quick brand impersonation check using AI
   */
  async checkBrandImpersonation(
    sender: string,
    subject: string
  ): Promise<string | null> {
    if (!this.client || !this.config.enabled) {
      return null;
    }

    try {
      const prompt = `Is this email attempting to impersonate a known brand?
Sender: ${sender}
Subject: ${subject}

Respond with ONLY the brand name if impersonation detected, or "none" if legitimate.`;

      const response = await this.client.path("/chat/completions").post({
        body: {
          messages: [
            {
              role: "system",
              content:
                "You are a brand impersonation detector. Respond with only the brand name or 'none'.",
            },
            { role: "user", content: prompt },
          ],
          model: modelName,
          temperature: 0.1,
          max_tokens: 50,
        },
      });

      if (isUnexpected(response)) {
        return null;
      }

      const result = response.body.choices[0]?.message?.content
        ?.trim()
        .toLowerCase();
      return result && result !== "none" ? result : null;
    } catch (error) {
      console.error("Brand check error:", error);
      return null;
    }
  }

  /**
   * Analyze email body text for suspicious patterns
   */
  async analyzeEmailBody(bodyText: string): Promise<{
    suspiciousKeywords: string[];
    urgencyScore: number;
    threatLevel: "low" | "medium" | "high";
  } | null> {
    if (!this.client || !this.config.enabled) {
      return null;
    }

    try {
      const prompt = `Analyze this email body for phishing indicators:

"${bodyText.substring(0, 1000)}"

Identify:
1. Suspicious keywords (urgency, threats, requests for credentials)
2. Urgency score (0-10)
3. Overall threat level (low/medium/high)

Respond in JSON: {"suspiciousKeywords": [], "urgencyScore": number, "threatLevel": "low|medium|high"}`;

      const response = await this.client.path("/chat/completions").post({
        body: {
          messages: [
            {
              role: "system",
              content:
                "You are an email content analyzer. Respond only with valid JSON.",
            },
            { role: "user", content: prompt },
          ],
          model: modelName,
          temperature: 0.2,
          max_tokens: 200,
          response_format: { type: "json_object" },
        },
      });

      if (isUnexpected(response)) {
        return null;
      }

      const result = response.body.choices[0]?.message?.content;
      if (!result) return null;

      return JSON.parse(result);
    } catch (error) {
      console.error("Body analysis error:", error);
      return null;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AIDetectionConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (newConfig.githubToken && newConfig.enabled) {
      try {
        this.client = ModelClient(
          endpoint,
          new AzureKeyCredential(newConfig.githubToken)
        );
      } catch (error) {
        console.error("Failed to update AI client:", error);
      }
    }
  }

  /**
   * Check if AI detection is available
   */
  isAvailable(): boolean {
    return this.client !== null && this.config.enabled;
  }
}

// Export singleton instance
let aiDetectorInstance: AIPhishingDetector | null = null;

export function initializeAIDetector(
  config: AIDetectionConfig
): AIPhishingDetector {
  aiDetectorInstance = new AIPhishingDetector(config);
  return aiDetectorInstance;
}

export function getAIDetector(): AIPhishingDetector | null {
  return aiDetectorInstance;
}
