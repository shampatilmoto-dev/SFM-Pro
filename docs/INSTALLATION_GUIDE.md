# SFM PRO Enterprise

## Installation Guide — v3.5 Stable

SFM PRO Enterprise is a browser-based personal-finance application. It is distributed as a static HTML, CSS, and JavaScript project: it does not require a server-side database, package manager, or build step for normal use.

## Project Requirements

| Requirement | Recommendation |
| --- | --- |
| Operating system | Windows, macOS, Linux, or another modern desktop/mobile operating system |
| Web browser | Current Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari |
| Web server | Optional for simple viewing; recommended for consistent local development and testing |
| Internet connection | Not required for core local use after the project files are available |
| Storage | Browser local storage enabled for the application origin |

For the best experience, use a current browser with JavaScript and local storage enabled. Private/incognito windows may clear local data when the session closes and are not recommended for long-term records.

## Folder Structure

```text
SFM-Pro/
├── index.html                 # Entry point; redirects to login
├── login.html                 # Login screen
├── dashboard.html             # Main dashboard
├── pages/                     # Feature pages, including Settings
├── css/                       # Shared, dashboard, and module styles
├── js/                        # Application, core, service, and module scripts
├── components/                # Reusable interface fragments
├── tests/                     # QA and validation scripts
├── docs/                      # Product documentation
└── version.json               # Release metadata
```

Keep the folder hierarchy intact. HTML pages reference scripts and styles using relative paths; moving individual files can cause assets or navigation to fail.

## Installation Steps

1. Obtain the complete SFM PRO Enterprise project folder from an authorized source.
2. Extract it to a location where you have read and write access.
3. Do not rename or relocate the `css`, `js`, `pages`, or `components` folders.
4. Open the application as described in [Running the Project](#running-the-project).
5. Confirm that the login page loads, then sign in using the credentials configured for your deployment.
6. Before entering important records, create and store an initial backup.

No dependency installation is required for the standard static application.

## Running the Project

### Recommended: local web server

Serve the project root through a local static web server, then open the displayed local address in a supported browser. For example:

```text
http://localhost:8000/
http://localhost:8080/
```

Any standards-compliant static server is suitable. Serve the **project root** so that `index.html`, `login.html`, `dashboard.html`, `pages/`, `css/`, and `js/` remain available at their existing relative paths.

### Direct local opening

For a quick local review, you may open `index.html` directly in a browser. Browser security rules vary for `file://` URLs, however. If navigation, scripts, or local-storage behavior is inconsistent, switch to a local web server. Data saved under `file://` may be stored separately from data saved under `http://localhost`.

## Browser Requirements

SFM PRO Enterprise supports current stable releases of Chrome, Edge, Firefox, and Safari on current supported desktop and mobile operating systems. Enable JavaScript, cookies/site data, and local storage for the local origin where the application is hosted. Legacy browsers and browsers with storage disabled are not supported.

## Local Storage Information

The application stores finance records and preferences in the browser's local storage for its current origin.

- Data remains on the same browser profile and origin until it is cleared or replaced.
- Data does not automatically sync between browsers, devices, or user profiles.
- Clearing browser site data, using storage-cleanup tools, or changing to a different origin can make existing records unavailable.
- Browser storage is not a substitute for an independent backup.

Use a separate browser profile on shared computers, sign out when you finish, and do not store sensitive financial information in an untrusted browser profile.

## Backup Recommendations

Use Backup & Restore from the dashboard to protect your records.

1. Export a backup before upgrades, browser cleanup, device changes, or major data edits.
2. Store exported backup files in a protected location separate from the browser, such as approved encrypted storage.
3. Use a descriptive filename that includes the export date.
4. Keep more than one recent backup when practical.
5. Test a restore in a safe environment when validating a critical archive.

Import only backups created by a trusted SFM PRO Enterprise installation. The application validates supported backup structures, but a backup can still replace local records after confirmation.

## Troubleshooting

| Symptom | Likely cause | Resolution |
| --- | --- | --- |
| Blank page or missing styles | Files were moved, or the wrong folder is being served | Restore the original hierarchy and serve the project root |
| Page navigation does not work | Browser blocked local-file behavior | Run the project with a local static web server |
| Records appear missing | A different browser, profile, or origin is in use | Return to the original browser/profile/origin or restore a backup |
| Changes do not persist | Local storage is disabled, full, or cleared | Enable site storage, free browser space, and restore a recent backup if needed |
| Backup import is rejected | The file is invalid, damaged, too large, or unsupported | Use a trusted compatible backup and export a fresh backup from the source installation |
| Display looks incorrect | Browser is outdated or zoom is extreme | Update the browser and return zoom to 100% |

If a problem persists, preserve any current backup file and record the browser name, browser version, local URL, and reproduction steps before contacting support.

## Updating the Application

Before applying an update:

1. Export a current backup from the existing installation.
2. Record the version you are running and the local URL/browser profile used.
3. Obtain the updated project only from an authorized source.

To update a local static deployment:

1. Keep a copy of the existing project folder and its backup export.
2. Replace application files with the authorized release while preserving the required folder structure.
3. Start or refresh the local web server from the updated project root.
4. Open the application and confirm the version label is **v3.5 Stable**.
5. Verify a small sample of records and settings.
6. If records are unavailable because the origin or browser profile changed, use Backup & Restore to import the pre-update backup.

Do not delete browser storage until the update has been verified. Roll back by returning to the prior project copy and restoring a known-good backup if necessary.

## Operational Checklist

Before using SFM PRO Enterprise in production, verify:

- The project is served from the intended local or hosted origin.
- JavaScript and local storage are enabled.
- Login and dashboard navigation work in a supported browser.
- A current backup has been exported and stored safely.
- Users understand that data is local to their browser profile unless a backup is exported and transferred deliberately.
