# SFM PRO Enterprise Import Center

An additive React/TypeScript application for high-volume spreadsheet imports. It does not modify any existing SFM PRO manager, route, service, calculation, notification, report, or navigation file.

## Run locally

```powershell
cd import
npm.cmd install
npm.cmd run dev
```

Production verification:

```powershell
npm.cmd test
npm.cmd run build
```

Deploy `import/dist` beneath the same origin as the existing application (for example `/import/`). Same-origin hosting lets it use the established `SFM_DATABASE` and `sfm_emi_records` browser keys and notify the parent application after a commit or rollback.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API contracts](docs/API_CONTRACTS.md)
- [Validation rules and error codes](docs/VALIDATION_RULES.md)
- [Performance and security](docs/PERFORMANCE_SECURITY.md)
- [Integration checklist](docs/INTEGRATION_CHECKLIST.md)
