# Email Guard - Technical Architecture

## Overview

Email Guard is a Chrome extension built on Manifest V3 that provides real-time email threat detection for Gmail and Outlook Web.

## System Architecture

```
User Interface (Gmail/Outlook)
          ↓
Content Scripts Layer
  - content-gmail.js
  - content-outlook.js
          ↓
Background Service Worker
  - background.js
  - Verification Engine
  - Storage Manager
          ↓
Chrome Storage API
```

## Component Details

### 1. Manifest (manifest.json)

**Purpose**: Extension configuration and permissions declaration

**Key Configurations**:
- Manifest Version: 3
- Permissions: storage, alarms, notifications, activeTab, scripting
- Host Permissions: Gmail and Outlook domains
- Content Scripts: Injected into webmail pages
- Background Service Worker: Persistent verification engine

### 2. Background Service Worker (background.js)

**Purpose**: Core verification logic and state management

**Responsibilities**:
- Email verification orchestration
- Threat detection algorithms
- Storage management
- Cross-tab communication
- Statistics tracking

**Key Functions**:
- `handleEmailVerification(emailData)` - Main verification
- `checkExpectedSender()` - Sender verification
- `verifyLink()` - Link analysis
- `detectHomograph()` - Homograph detection

### 3. Content Scripts

#### content-gmail.js

**Purpose**: Gmail DOM integration and monitoring

**Key Features**:
- MutationObserver for email view changes
- DOM parsing for email data extraction
- Alert panel injection
- User interaction handling

#### content-outlook.js

**Purpose**: Outlook Web integration

Similar to Gmail script but with Outlook-specific selectors.

### 4. Popup Interface

#### popup.html

**Structure**:
- Header (Logo, Status Indicator)
- Statistics Cards
- Tab Navigation (Dashboard, Settings, Alerts, Organization)
- Tab Content Panels

#### popup.js

**Responsibilities**:
- UI state management
- Settings CRUD operations
- Alert history display
- Statistics visualization
- Export functionality

### 5. Styling

- **styles.css**: Content script styles (alert panels)
- **popup-styles.css**: Popup interface styling

## Data Flow

### Email Verification Flow

```
1. User opens email
2. Content script detects email view change
3. Content script extracts email data
4. Content script sends verification request to background worker
5. Background worker retrieves settings
6. Background worker runs verification checks
7. Background worker returns result with alerts
8. Content script displays alerts if any
9. User can interact with alert
```

## Storage Schema

```javascript
{
  enabled: boolean,
  mode: 'personal' | 'organization',
  privacyMode: 'local' | 'enhanced',
  expectedSenders: string[],
  expectedLinkDomains: {
    'sender@domain.com': ['domain1.com', 'domain2.com']
  },
  whitelistedSenders: string[],
  whitelistedDomains: string[],
  organizationConfig: {...},
  alertHistory: [...],
  statistics: {...}
}
```

## Threat Detection Algorithms

### 1. Expected Sender Verification
Checks if sender is in expected list. If not, returns alert.

### 2. Homograph Detection
- Checks for punycode (xn--)
- Checks for non-Latin characters
- Checks for brand impersonation

### 3. Link Verification
- Display text vs href mismatch
- Homograph in link domain
- Expected link domains check
- IP address links
- URL shorteners
- Phishing keywords

## Performance Considerations

- Lazy loading
- Debouncing
- Caching
- Efficient DOM queries
- Storage limits (1000 alerts max)

## Security Considerations

### Privacy Protection
- Local-first processing
- No data transmission (default mode)
- Secure storage

### Threat Model
**Protected Against**: Phishing, malicious links, sender impersonation, homograph attacks
**Not Protected Against**: Zero-day exploits, compromised accounts, malware in attachments

## Extensibility

### Adding New Email Clients
1. Create new content script
2. Implement `extractEmailData()`
3. Reuse alert display logic
4. Add to manifest.json

### Adding New Threat Checks
1. Add verification function in background.js
2. Call from `handleEmailVerification()`
3. Return alerts in standard format

---

**Architecture Version**: 1.0.0
