# Validation rules and error codes

## Common behavior

- Header matching ignores case, spaces, punctuation, and underscores.
- Blank required text is rejected; general text is capped at 200 characters and notes at 1,000.
- Amounts are coerced from spreadsheet numeric strings and must satisfy the module's positive/non-negative rule.
- Dates accept Excel serial dates, JavaScript dates, `YYYY-MM-DD`, `YYYY/MM/DD`, `DD/MM/YYYY`, and `DD-MM-YYYY`, then normalize to `YYYY-MM-DD`.
- A row with any validation error cannot be committed.
- Duplicate rows inside the same workbook are always skipped. Database duplicates follow the selected skip/update/create strategy.

## Module rules

| Module | Required rules |
| --- | --- |
| Income | date, source, category, positive amount |
| Expense | date, title, category, positive amount |
| Budget | category, positive amount, month 1-12, year 1900-3000 |
| Loan | loan name, bank, positive principal/interest/tenure, start date |
| Credit Card | bank/card/type, positive limit, non-negative outstanding, billing/due dates |
| EMI | name, positive monthly/total, non-negative paid not exceeding total, due date |
| Investment | name, positive invested amount, non-negative current value, date |
| Account | name, type, institution, finite balance, three-letter currency |
| Category | name, income/expense type, optional six-digit hex color |
| Bill | title, category, positive amount, due date, pending/paid status |
| Recurring | title, income/expense type, positive amount, supported frequency, start date |
| Asset | name, category, non-negative purchase/current values, purchase date |
| Settings | allow-listed currency/language key and value; future-ready storage |

## Error codes

| Code | Meaning | Suggested fix |
| --- | --- | --- |
| `WORKBOOK_PARSE_FAILED` | Corrupt, encrypted, or unsupported workbook content | Open and resave the file as XLSX or UTF-8 CSV |
| `VALIDATION_FAILED` | A cell violates its module schema | Use the row, column, value, and message in the error report |
| `DUPLICATE_FILE` | The same logical record occurs more than once in the workbook | Remove the duplicate workbook row |
| `DUPLICATE_DATABASE` | A logical match already exists | Select skip, update, or create-copy behavior |
| `STORAGE_UNAVAILABLE` | Browser privacy/security settings blocked persistence | Allow site storage and retry |
| `STORAGE_QUOTA_EXCEEDED` | Browser storage capacity is exhausted | Remove old site data/backups or use a smaller import |
| `TRANSACTION_FAILED` | A commit step failed and snapshot restoration ran | Retry after resolving the reported storage error |
| `ROLLBACK_UNAVAILABLE` | No eligible snapshot exists | Choose a completed, not-yet-rolled-back import |
