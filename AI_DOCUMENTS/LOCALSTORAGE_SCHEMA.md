# SFM PRO Enterprise

# LocalStorage Schema

**Version:** 1.0

**Application Version:** v6.0

---

# Purpose

This document defines the LocalStorage architecture used by SFM PRO Enterprise.

It serves as the single source of truth for:

- Storage Keys
- Data Structures
- Validation Rules
- Backup & Restore
- Future Database Migration

Never modify LocalStorage keys without explicit approval.

---

# Storage Principles

Every LocalStorage object must be:

- Consistent
- Backward Compatible
- Version Controlled
- JSON Valid
- Easily Migratable

---

# Storage Naming Convention

Use:

```
sfm_<module>
```

Examples

```
sfm_income
sfm_expense
sfm_budget
sfm_loans
sfm_profile
sfm_settings
```

Never use random storage names.

---

# Current Storage Keys

| Storage Key | Purpose | Status |
|--------------|---------|--------|
| sfm_dashboard | Dashboard Cache | Planned |
| sfm_income | Income Records | Active |
| sfm_expense | Expense Records | Active |
| sfm_budget | Budget Data | Planned |
| sfm_loans | Loan Records | Planned |
| sfm_credit_cards | Credit Cards | Planned |
| sfm_investments | Investments | Planned |
| sfm_reports | Report Cache | Planned |
| sfm_documents | Documents | Planned |
| sfm_notifications | Notifications | Planned |
| sfm_profile | User Profile | Planned |
| sfm_settings | Application Settings | Planned |
| sfm_backup | Backup Information | Planned |

---

# Standard Record Structure

Every record should contain:

```
{
  "id": "",
  "createdAt": "",
  "updatedAt": "",
  "status": "active"
}
```

---

# Income Object

```
{
  "id": "",
  "date": "",
  "source": "",
  "category": "",
  "amount": 0,
  "notes": "",
  "createdAt": "",
  "updatedAt": ""
}
```

---

# Expense Object

```
{
  "id": "",
  "date": "",
  "category": "",
  "paymentMethod": "",
  "amount": 0,
  "notes": "",
  "createdAt": "",
  "updatedAt": ""
}
```

---

# Budget Object

```
{
  "id": "",
  "month": "",
  "category": "",
  "budgetAmount": 0,
  "spentAmount": 0,
  "remainingAmount": 0
}
```

---

# Loan Object

```
{
  "id": "",
  "lender": "",
  "loanAmount": 0,
  "interestRate": 0,
  "emi": 0,
  "outstandingBalance": 0,
  "nextDueDate": ""
}
```

---

# Profile Object

```
{
  "fullName": "",
  "email": "",
  "phone": "",
  "currency": "INR",
  "theme": "light"
}
```

---

# Settings Object

```
{
  "currency": "INR",
  "language": "English",
  "theme": "light",
  "notifications": true,
  "backup": true
}
```

---

# Data Validation Rules

Always validate:

- Required fields
- Numbers
- Currency values
- Dates
- Empty objects
- Duplicate IDs

Never save invalid data.

---

# Backup Rules

Backup must include:

- All LocalStorage Keys
- Metadata
- Application Version
- Backup Timestamp

Preferred format:

```
JSON
```

---

# Restore Rules

Before restoring:

- Validate backup version
- Validate JSON format
- Check required keys
- Prevent data corruption

---

# Migration Strategy

Future migration path:

LocalStorage

↓

IndexedDB

↓

Firebase

↓

Cloud Database

Migration must preserve all user data.

---

# Security Rules

Never:

- Store passwords
- Store API keys
- Store authentication tokens
- Store sensitive secrets

Only store application data.

---

# Version Compatibility

Current Version

v6.0

Storage Schema

Version 1.0

Backward Compatibility

Required

---

# Developer Notes

When modifying LocalStorage:

- Preserve existing keys.
- Preserve object structure.
- Maintain backward compatibility.
- Validate before writing.
- Handle missing keys safely.

---

End of LocalStorage Schema