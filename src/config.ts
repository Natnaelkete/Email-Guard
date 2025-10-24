// Email Guard Configuration
// This file contains the built-in GitHub token for AI functionality

// Built-in GitHub token (will be replaced during build)
export const BUILTIN_GITHUB_TOKEN: string = "__GITHUB_TOKEN__";

// AI Configuration
export const AI_CONFIG = {
  enabled: true,
  confidenceThreshold: 0.7,
  endpoint: "https://models.github.ai/inference",
  model: "openai/gpt-5",
};

// Check if built-in token is available
export function hasBuiltInToken(): boolean {
  return (
    BUILTIN_GITHUB_TOKEN !== "__GITHUB_TOKEN__" &&
    (BUILTIN_GITHUB_TOKEN as string).length > 0
  );
}
