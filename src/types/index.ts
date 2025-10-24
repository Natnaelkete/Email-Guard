// Email Guard - Type Definitions

// ============================================================================
// Alert Types
// ============================================================================

export type AlertSeverity = 'low' | 'medium' | 'high';

export type AlertType =
  | 'unexpected_sender'
  | 'reply_to_mismatch'
  | 'homograph_domain'
  | 'link_text_mismatch'
  | 'homograph_link'
  | 'unexpected_link_domain'
  | 'ip_address_link'
  | 'url_shortener'
  | 'suspicious_link_keywords'
  | 'suspicious_domain_pattern';

export interface Alert {
  severity: AlertSeverity;
  type: AlertType;
  message: string;
  details: string;
  recommendation: string;
  sender?: string;
  subject?: string;
  timestamp?: number;
  id?: string;
  emailUrl?: string | null;
}

// ============================================================================
// Email Data Types
// ============================================================================

export interface Link {
  displayText: string;
  href: string;
}

export interface EmailData {
  sender: string;
  subject: string;
  links: Link[];
  replyTo?: string;
}

// ============================================================================
// Settings Types
// ============================================================================

export type PrivacyMode = 'local' | 'enhanced';
export type ExtensionMode = 'personal' | 'organization';

export interface OrganizationConfig {
  name: string;
  adminEmail: string;
  policyUrl?: string;
}

export interface Statistics {
  totalEmailsScanned: number;
  threatsBlocked: number;
  lastScan: number | null;
}

export interface Settings {
  enabled: boolean;
  mode: ExtensionMode;
  expectedSenders: string[];
  expectedLinkDomains: Record<string, string[]>;
  whitelistedSenders: string[];
  whitelistedDomains: string[];
  organizationConfig: OrganizationConfig | null;
  privacyMode: PrivacyMode;
  alertHistory: Alert[];
  statistics: Statistics;
}

// ============================================================================
// Verification Result Types
// ============================================================================

export interface HomographCheck {
  suspicious: boolean;
  details?: string;
}

export interface DomainVerificationResult {
  alerts: Alert[];
}

export interface EmailVerificationResult {
  safe: boolean;
  alerts: Alert[];
  isWhitelisted: boolean;
  senderDomain: string;
}

export interface ExpectedSenderCheck {
  alert: Alert | null;
}

// ============================================================================
// Message Types (for Chrome messaging)
// ============================================================================

export interface VerifyEmailMessage {
  action: 'verifyEmail';
  data: EmailData;
}

export interface VerifyDomainMessage {
  action: 'verifyDomain';
  domain: string;
}

export interface LogAlertMessage {
  action: 'logAlert';
  alert: Alert;
}

export interface UpdateStatisticsMessage {
  action: 'updateStatistics';
  stats: {
    scanned: number;
    blocked: number;
  };
}

export interface GetSettingsMessage {
  action: 'getSettings';
}

export type ChromeMessage =
  | VerifyEmailMessage
  | VerifyDomainMessage
  | LogAlertMessage
  | UpdateStatisticsMessage
  | GetSettingsMessage;

export interface ChromeMessageResponse<T = any> {
  success: boolean;
  result?: T;
  settings?: Settings;
  error?: string;
}

// ============================================================================
// Storage Keys
// ============================================================================

export type StorageKey =
  | 'enabled'
  | 'mode'
  | 'expectedSenders'
  | 'expectedLinkDomains'
  | 'whitelistedSenders'
  | 'whitelistedDomains'
  | 'organizationConfig'
  | 'privacyMode'
  | 'alertHistory'
  | 'statistics';

// ============================================================================
// Utility Types
// ============================================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// Partial settings for updates
export type PartialSettings = Partial<Settings>;

// Alert without optional fields (for creation)
export type AlertInput = Omit<Alert, 'timestamp' | 'id' | 'emailUrl'>;
