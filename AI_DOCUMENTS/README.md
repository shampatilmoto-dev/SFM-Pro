# SFM PRO Enterprise Architecture Guide

## Purpose

Explain the documentation, metadata, and future-integration structure for SFM PRO Enterprise.

## Description

SFM PRO currently retains its existing application runtime. The folders introduced in this setup provide a controlled foundation for future metadata, import, and Firebase work without activating those capabilities.

### Project Architecture

```text
Admin
  -> Master Excel Workbook
  -> Import Engine
  -> Validation Engine
  -> JSON Runtime Configuration
  -> Firebase Configuration
  -> Application Runtime
  -> Business Logic
  -> Firebase Database
  -> Laptop, Mobile, Tablet
```

### Folder Structure

```text
AI_DOCUMENTS/           Governance, standards, roadmap, and review records
CODEX_REPORTS/          Reserved for future generated review reports
MASTER_CONFIGURATION/   Templates and controlled import/export staging folders
config/                 Versioned, declarative runtime metadata templates
docs/                   Existing product documentation
```

### Future Firebase

The future Firebase configuration belongs in `config/firebase.json` as declarative metadata only. Credentials, project identifiers, and active connection behavior require separate human approval.

### Future Metadata Engine

The `config` directory defines the contracts a future metadata engine may consume. The files are not loaded by the current application runtime.

### Future Excel Import Engine

`MASTER_CONFIGURATION/Templates` is reserved for reviewed workbook templates. `Imports`, `Exports`, and `Archive` provide clear staging boundaries for a future import workflow.

### Configuration Flow

```text
Approved workbook template
  -> import validation
  -> reviewed JSON metadata
  -> approved Firebase configuration
  -> application runtime integration
```

## Future Usage

Use this guide as the entry point for future architecture reviews and before enabling any metadata, import, or Firebase integration.

## Relationships

- [AI development manual](SFM_PRO_AI_DEVELOPMENT_MANUAL.md)
- [Coding standards](CODING_STANDARDS.md)
- [Master configuration guide](../MASTER_CONFIGURATION/README.md)
- [Configuration manifest](../config/app.json)

## Revision History

| Date | Revision | Summary |
| --- | --- | --- |
| 2026-07-21 | 1.0 | Initial architecture and configuration-flow guide created. |
