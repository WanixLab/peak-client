# Wanix Client Template

Next.js 16 (App Router) + React 19 + MUI 9 + Redux Toolkit starter with a login → home flow, a configurable app shell (header + sidebar), a theme system, and a Dockerised end-to-end test stack.

## Stack

- **Next.js 16** (App Router, standalone output)
- **React 19**
- **MUI 9** with the CSS-variables theme engine (`@emotion` SSR registry)
- **Redux Toolkit** for auth + UI state
- **react-hook-form + zod** for forms/validation
- **Tailwind 4** available for utility classes
- **Vitest** (unit) + **Playwright** (e2e)

## Getting started

```bash
npm install
npm run dev            # http://localhost:3000  → redirects to /login
```

Demo login: **admin@wanix.dev / password** (or use "Continue with Google" / the Sign up page — both do a demo sign-in)

## Project structure

Three top-level buckets: `app/` (routing), `config/` (configuration), `shared/` (reusable code).

```
src/
├── app/                         # ← Next.js App Router (routing only)
│   ├── layout.tsx               #   root layout + color-scheme init script
│   ├── page.tsx                 #   → redirects to /login
│   ├── globals.css
│   ├── (auth)/                  #   route group: public (unauthenticated) screens
│   │   ├── layout.tsx           #   gradient background shared by login/register
│   │   ├── login/page.tsx       #   login (email/password, Google, remember me)
│   │   └── register/page.tsx    #   sign-up screen
│   └── (protected)/             #   route group: auth-guarded screens
│       ├── layout.tsx           #   AuthGuard + AppLayout
│       └── home/page.tsx        #   home screen
├── config/                      # ← App-wide configuration (edit the JSON)
│   ├── app.config.json          #   app name, version, API url, auth/demo creds, routes
│   ├── layout.config.json       #   drawer width, header height, sidebar defaults
│   ├── menu.config.json         #   sidebar menu items (single source of truth)
│   └── index.ts                 #   typed loader — import everything from `@/config`
└── shared/                      # ← Reusable, cross-cutting code
    ├── components/
    │   ├── providers/           #   Providers (store → theme → session restore)
    │   ├── auth/AuthGuard.tsx   #   client-side route protection
    │   └── layout/              #   app shell
    │       ├── Header.tsx       #   header bar: menu toggle, title, theme switch, user menu
    │       ├── Sidebar.tsx      #   collapsible side navigation (reads menu.config)
    │       ├── AppLayout.tsx    #   header + sidebar + content composition
    │       └── ThemeToggle.tsx  #   light/dark switch
    ├── store/                   #   Redux Toolkit
    │   ├── store.ts, hooks.ts, StoreProvider.tsx
    │   └── slices/              #   authSlice (session), uiSlice (sidebar)
    ├── theme/                   #   theme system
    │   ├── theme.ts             #   light/dark color schemes, typography, defaults
    │   └── ThemeRegistry.tsx    #   MUI + emotion SSR registry (no FOUC)
    ├── lib/authStorage.ts       #   localStorage session persistence
    ├── hooks/                   #   (placeholder) shared React hooks
    ├── utils/                   #   (placeholder) framework-agnostic helpers
    ├── types/                   #   (placeholder) shared TypeScript types
    └── constants/               #   (placeholder) shared constants
```

Import aliases: `@/config`, `@/shared/...` (e.g. `@/shared/store/hooks`, `@/shared/components/layout/Header`).

### Where to customise

| Want to change…            | Edit                              |
| -------------------------- | --------------------------------- |
| App name / API / routes    | `src/config/app.config.json`      |
| Sidebar menu items         | `src/config/menu.config.json`     |
| Header / sidebar sizing    | `src/config/layout.config.json`   |
| Colors / typography        | `src/shared/theme/theme.ts`       |

> Menu icons in `menu.config.json` are names (e.g. `"Home"`, `"Settings"`) mapped to MUI icons in `src/config/index.ts` — add new ones to the `iconMap` there.

## Scripts

```bash
npm run dev          # dev server
npm run build        # production build (standalone)
npm run start        # run the production build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm test             # vitest unit tests
npm run test:e2e     # playwright (auto-starts a dev server)
npm run test:docker  # build + run e2e in Docker (see below)
```

## Docker

| File                       | Purpose                                             |
| -------------------------- | --------------------------------------------------- |
| `Dockerfile`               | multi-stage build → minimal standalone runtime      |
| `docker-compose.yml`       | production image on `:3000`                          |
| `docker-compose.dev.yml`   | dev server with hot reload                           |
| `docker-compose.uat.yml`   | UAT/staging on `:3001`                               |
| `docker-compose.prod.yml`  | production deploy                                    |
| `docker-compose.test.yml`  | builds the app + runs Playwright against it         |

### Run the e2e suite in Docker

```bash
npm run test:docker
# = docker compose -f docker-compose.test.yml up --build \
#     --abort-on-container-exit --exit-code-from e2e
```

The `app` service is built and health-checked, then the `e2e` service runs
Playwright against it (`BASE_URL=http://app:3000`) and exits with the test
status code — suitable for CI gating.
