# Vue Dashboard Template

[![Bitrix24 UI](https://img.shields.io/badge/Made%20with-Bitrix24%20UI-2fc6f6?logo=bitrix24&labelColor=020420)](https://bitrix24.github.io/b24ui/)

Kickstart your project with the Vite + Vue application template — packed with multi‑page support, a collapsible sidebar, keyboard shortcuts, light/dark themes, a command palette, and more, all powered by [Bitrix24 UI](https://bitrix24.github.io/b24ui/).

- [Live demo](https://bitrix24.github.io/templates-dashboard-vue/)
- [@bitrix24/b24ui](https://bitrix24.github.io/b24ui/docs/getting-started/installation/vue/)
- [@bitrix24/b24icons](https://bitrix24.github.io/b24icons/)
- [@bitrix24/b24jssdk](https://bitrix24.github.io/b24jssdk/)

> The dashboard template for Nuxt is on https://github.com/bitrix24/templates-dashboard.

## Quick Start

```bash [Terminal]
git clone https://github.com/bitrix24/templates-dashboard-vue.git <project-name>
cd <project-name>
```

## Prerequisites

- **Node.js** `>= 22`
- **pnpm** `>= 10` (the repo pins `pnpm@10.33.0` via the `packageManager` field; run `corepack enable` to pick it up automatically)

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

Quality checks:

```bash
pnpm lint        # ESLint
pnpm typecheck   # vue-tsc
pnpm test        # Vitest unit tests
```

Run the full gate (install + lint + test + typecheck + build) with one command:

```bash
bash scripts/check.sh                                   # Linux / macOS
powershell -ExecutionPolicy Bypass -File scripts/check.ps1   # Windows
```

## Development Server

Start the development server on `http://localhost:5173`:

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

> [!NOTE]
> This template works both ways:
> - **Standalone** — opened outside Bitrix24 it renders generated test data, so you can develop the UI without a portal.
> - **As a Bitrix24 app** — embedded in a portal it talks to the REST API via [@bitrix24/b24jssdk](https://bitrix24.github.io/b24jssdk/). See [As B24 App](#as-b24-app) below.

## Project Structure

```
src/
├── App.vue              # Root component: B24 init, locale, global toaster
├── main.ts              # App bootstrap (router, i18n, unhead)
├── i18n.ts              # vue-i18n setup and locale loading
├── assets/              # Global CSS and background images
├── components/          # UI components (home, customers, inbox, settings, icons, ...)
├── composables/
│   ├── useB24.ts        # Bitrix24 frame lifecycle (init / get / getFrame / helper)
│   ├── useDashboard.ts  # Shared dashboard state & keyboard shortcuts
│   └── useDealStats/    # CRM deal statistics: api, helpers, formatters, mocks
├── layouts/             # Page layouts (default, clear)
├── locales/             # i18n messages (19 locales)
├── pages/               # File-based routes; settings/ holds nested settings pages
├── types/               # Shared TypeScript types
├── utils/               # Small helpers
└── route-map.d.ts       # Auto-generated route types (do not edit)
scripts/                 # check.sh / check.ps1 — full local verification
```

# As B24 App

A browser-based application for Bitrix24.

## Required Scopes

The following permissions must be enabled in the application settings:
* `crm` — access to CRM entities.
* `user_brief` — access to basic user profile data.

## Configuration

When registering the application in the Bitrix24 Partner Portal or as a local app, use the following endpoints:

| Parameter | URL |
| :--- | :--- |
| **Application URL** | `https://your-app.example.com` |
| **Installation URL** | `https://your-app.example.com/install` |

## Getting Started

1. Open your **Bitrix24**.
2. Go to **Applications** -> **Add Application**
3. Select **Local Application**
4. Fill in the URLs provided above and check the required **Scopes**.
5. Click **Save** and open the app.

# Localization

UI strings live in `src/locales/*.json` (19 locales), wired up through `vue-i18n` in `src/i18n.ts`.
To add a language, create a new `<lang>.json` next to the existing ones and register it in `src/i18n.ts`.
