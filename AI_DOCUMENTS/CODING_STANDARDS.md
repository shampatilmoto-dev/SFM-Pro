# SFM PRO Coding Standards

## Purpose

Define future implementation standards for maintainable, reviewed SFM PRO changes.

## Description

Future code should separate presentation, configuration, validation, data access, and business logic. Metadata files must remain declarative, versioned, valid JSON, and free of financial records, calculations, or environment secrets. Changes must preserve accessibility, responsiveness, and backward compatibility unless an approved migration states otherwise.

## Future Usage

This document will support pull-request review, AI contribution review, metadata validation, and future Firebase or import-engine development.

## Relationships

- [AI development manual](SFM_PRO_AI_DEVELOPMENT_MANUAL.md)
- [Master configuration guide](../MASTER_CONFIGURATION/README.md)
- [Project roadmap](PROJECT_ROADMAP.md)

## Revision History

| Date | Revision | Summary |
| --- | --- | --- |
| 2026-07-21 | 1.0 | Initial future-development standards recorded. |
