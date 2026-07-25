# SFM PRO Enterprise

# Database Structure

**Version:** 1.0

**Application Version:** v6.0

---

# Purpose

This document defines the future database architecture for SFM PRO Enterprise.

The database design is intended to:

- Support future cloud migration
- Maintain data integrity
- Reduce duplication
- Improve scalability
- Simplify reporting
- Support API integration

The current application uses LocalStorage, but all new modules should be designed to remain compatible with a future database.

---

# Database Design Principles

The database should be:

- Normalized
- Modular
- Scalable
- Secure
- Maintainable
- API Ready

---

# Entity Overview

Core entities include:

- Users
- Income
- Expenses
- Budgets
- Loans
- Credit Cards
- Investments
- Documents
- Notifications
- Settings
- Reports
- Backups

---

# Entity Relationships

User

├── Income

├── Expense

├── Budget

├── Loan

├── Credit Card

├── Investment

├── Document

├── Notification

├── Backup

└── Settings

---

# Users Table

Purpose

Store user profile information.

Columns

- id (Primary Key)
- full_name
- email
- phone
- currency
- language
- theme
- created_at
- updated_at

---

# Income Table

Purpose

Store all income transactions.

Columns

- id (Primary Key)
- user_id (Foreign Key)
- date
- source
- category
- amount
- notes
- created_at
- updated_at

---

# Expense Table

Purpose

Store expense transactions.

Columns

- id (Primary Key)
- user_id (Foreign Key)
- date
- category
- payment_method
- amount
- notes
- created_at
- updated_at

---

# Budget Table

Purpose

Store monthly budgets.

Columns

- id
- user_id
- month
- category
- budget_amount
- spent_amount
- remaining_amount
- created_at
- updated_at

---

# Loans Table

Purpose

Store loan information.

Columns

- id
- user_id
- lender
- loan_amount
- interest_rate
- emi
- outstanding_balance
- start_date
- next_due_date
- created_at
- updated_at

---

# Credit Cards Table

Purpose

Manage credit card information.

Columns

- id
- user_id
- card_name
- bank_name
- credit_limit
- outstanding_balance
- billing_date
- due_date
- created_at
- updated_at

---

# Investments Table

Purpose

Track investments.

Columns

- id
- user_id
- investment_type
- investment_name
- purchase_date
- invested_amount
- current_value
- returns
- created_at
- updated_at

---

# Documents Table

Purpose

Store document metadata.

Columns

- id
- user_id
- document_type
- document_name
- file_name
- created_at

---

# Notifications Table

Purpose

Manage reminders and alerts.

Columns

- id
- user_id
- title
- message
- notification_type
- is_read
- scheduled_date
- created_at

---

# Settings Table

Purpose

Store application settings.

Columns

- id
- user_id
- currency
- language
- theme
- notifications_enabled
- backup_enabled
- updated_at

---

# Reports Table

Purpose

Store generated report history.

Columns

- id
- user_id
- report_type
- generated_on
- export_format

---

# Backup Table

Purpose

Track backup history.

Columns

- id
- user_id
- backup_name
- backup_date
- backup_version
- storage_location

---

# Primary Keys

Every table must use:

id

Requirements:

- Unique
- Immutable
- Non-null

---

# Foreign Keys

Every financial table references:

user_id

This enables:

- Multi-user support
- Secure ownership
- Data isolation

---

# Index Recommendations

Create indexes for:

- user_id
- date
- category
- month
- due_date
- report_type

These improve search and reporting performance.

---

# Data Integrity Rules

Always enforce:

- Required fields
- Valid dates
- Positive monetary values
- Valid foreign key references

---

# Security Guidelines

Never store:

- Passwords in plain text
- API keys
- Access tokens
- Sensitive secrets

Sensitive data should be encrypted when cloud storage is introduced.

---

# Migration Strategy

Current Storage

LocalStorage

↓

Future

IndexedDB

↓

Firebase

↓

Cloud SQL / PostgreSQL (if required)

Migration must preserve all user records.

---

# API Readiness

The schema should support future REST APIs by:

- Using stable identifiers
- Maintaining consistent field names
- Returning structured JSON
- Supporting pagination and filtering

---

# Version Information

Application Version

v6.0

Database Schema Version

1.0

Status

Planning Stage

---

# Developer Notes

When implementing new modules:

- Keep field names consistent.
- Match LocalStorage object names where practical.
- Avoid unnecessary duplication.
- Design with future cloud migration in mind.

---

End of Database Structure