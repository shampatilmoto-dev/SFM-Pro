# Master Configuration Guide

## Purpose

Define the controlled staging structure for future master-workbook, import, export, and archive processes.

## Description

`Templates` is reserved for approved workbook templates. `Imports` is reserved for pending reviewed imports. `Exports` is reserved for generated external artifacts. `Archive` is reserved for retained historical artifacts. These folders contain no operational data in the initial setup.

## Future Usage

A future import engine may use this structure to accept approved workbooks, validate metadata, generate reviewed JSON configuration, and retain audited artifacts.

## Relationships

- [Architecture guide](../AI_DOCUMENTS/README.md)
- [Coding standards](../AI_DOCUMENTS/CODING_STANDARDS.md)
- [Configuration manifest](../config/app.json)

## Revision History

| Date | Revision | Summary |
| --- | --- | --- |
| 2026-07-21 | 1.0 | Initial master-configuration staging structure documented. |
