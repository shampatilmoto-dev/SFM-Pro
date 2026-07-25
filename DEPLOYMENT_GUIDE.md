# Deployment Guide

## Deployment Model

SFM PRO Enterprise is a static browser application. It can be deployed to any static hosting platform that preserves file paths and allows JavaScript, HTML, CSS, and image assets to load normally.

## Requirements

| Requirement | Notes |
| --- | --- |
| Browser | Current stable browser with JavaScript enabled |
| Storage | Browser local storage enabled |
| Hosting | Static hosting or local web server |
| Network | Required only for externally hosted assets |

## Deployment Steps

1. Upload the repository contents without changing the folder structure.
2. Confirm `index.html`, `login.html`, `dashboard.html`, `pages/`, `js/`, `css/`, and `assets/` are present.
3. Open the application from the hosted URL.
4. Verify login, dashboard, and a sample module page.
5. Confirm that backup and restore work as expected.

## Verification Checklist

- Login opens correctly.
- Dashboard loads cleanly.
- Module pages open from navigation.
- Backup export and restore respond as expected.
- Search, filters, and charts display correctly.

## Rollback

If deployment issues occur, restore the previous static file set and keep the browser storage model unchanged.
