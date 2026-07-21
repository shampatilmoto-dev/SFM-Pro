# SFM PRO Enterprise

## Release Notes - v3.5 Stable

**Release Date:** 20 July 2026  
**Release Status:** Production Ready

### Application Overview

SFM PRO Enterprise is a browser-based personal-finance application for recording and reviewing day-to-day financial activity. It brings income, expenses, budgets, loans, credit cards, EMI, investments, goals, calendar activity, recurring transactions, reporting, and backup management into one workspace. Financial data is stored locally in the browser unless it is exported as a backup.

### What's New in v3.5 Stable

- Complete Settings module with validated application-preference controls and local persistence.
- Completed Backup & Restore hardening, including compatibility checks and safer invalid-file handling.
- A visible dashboard logout action and session guard.
- Stronger dashboard session handling and strengthened dynamic-content handling.
- Enterprise UI refinement, responsive layout review, and accessibility improvements.

### Major Improvements

| Area | Improvement |
| --- | --- |
| Settings | Supported currency, date format, theme, and decimal-precision preferences can be saved, reset, and applied safely. |
| Backup & Restore | Supports v3.3 to v3.5 backups and rejects invalid, oversized, unsafe, or incompatible files before data is restored. |
| Security | Import validation guards against unexpected keys, unsafe identifiers, duplicate data, malformed records, and prototype pollution. |
| Accessibility | Controls have accessible names, Settings has live status messaging, and navigation and controls are keyboard-operable. |
| Reliability | Dashboard access checks the active session and provides a clear logout action. |

### Completed Modules

- Dashboard
- Income and Expense Management
- Budget Management
- Loans, Credit Cards, and EMI Tracking
- Investments
- Financial Reports
- Goals, Notifications, and Financial Calendar
- Recurring Transactions
- Backup & Restore
- Settings

### Browser Support

SFM PRO Enterprise is intended for current, standards-compliant desktop and mobile browsers with JavaScript and Local Storage enabled. Use the latest stable release of a modern Chromium-based browser, Firefox, Safari, or Microsoft Edge for the best experience. Browser extensions or privacy settings that block Local Storage can prevent local data from being saved.

### System Requirements

| Requirement | Details |
| --- | --- |
| Device | Desktop, laptop, tablet, or mobile device with a modern web browser |
| Browser | Current browser with JavaScript, JSON, File APIs, and Local Storage enabled |
| Network | Not required for core locally stored financial data; an internet connection may be needed for externally hosted visual assets |
| Storage | Enough available browser storage for application records and exported backup files |
| Screen | Responsive layouts are designed for desktop through mobile widths |

### Known Limitations

- Data is browser-local. It is not automatically synchronized across devices or browsers.
- Clearing site data can remove locally stored records. Export a backup before clearing browser data, changing devices, or resetting a browser profile.
- Notification preferences are informational UI settings only; there is no background, email, or push notification service.
- The final hosted audit environment could not start browser automation because of a host setup failure. Automated source-level and QA checks passed; a live-browser smoke test should remain part of deployment validation.

### Upgrade Notes

1. Open the existing application in the same browser profile to retain locally stored data.
2. Export a backup before replacing project files, clearing browser data, or moving to another device.
3. After upgrading, open Settings to review presentation preferences and verify the selected theme.
4. If restoring an earlier backup, use Dashboard > Backup & Restore and review the import summary before confirming the restore.

### Compatibility Notes

- The application label for this release is **v3.5 Stable**.
- Backup import supports payloads labelled **v3.3**, **v3.4**, and **v3.5**.
- Unsupported backup versions are rejected with a compatibility warning.
- Existing local-storage data remains in its existing storage structure; the release does not require a data migration.

### Release Summary

v3.5 Stable is the production-ready release of SFM PRO Enterprise. It completes the Settings and Backup & Restore experience, strengthens validation and rendering safety, resolves release-blocking navigation and startup issues, and documents the operational practices needed to protect browser-local financial data.
