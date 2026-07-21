# Deployment Guide

## Prerequisites

- Modern Chromium, Firefox, Safari, or Edge browser.
- JavaScript enabled.
- Local storage enabled.
- Network access only if you rely on CDN-hosted fonts or chart assets.

## Deployment Steps

1. Publish the full project folder to a static hosting location.
2. Keep the directory structure intact.
3. Confirm `index.html`, `login.html`, `dashboard.html`, `pages/`, `js/`, and `css/` are all present.
4. Open the deployed site and complete the login and dashboard smoke check.
5. Export and import a small backup sample before release approval.

## Verification Checklist

- Login opens correctly.
- Dashboard loads without console errors.
- Income, Expense, Budget, Loans, EMI, Credit Cards, Investments, Reports, and Settings open correctly.
- Backup export works.
- Backup import rejects invalid files and accepts valid files.
- Search, filters, and charts respond normally.

## Rollback

If a production issue is found, restore the previous static file set and keep the existing browser-local data model unchanged.
