# Fuellio – Architecture Guide

## Overview

Fuellio is a personal fuel tracking application built with TanStack Start (React SSR) and deployed on Netlify. Authentication is handled by Netlify Identity and data is stored in a Netlify managed Postgres database via Drizzle ORM.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| Charts | Chart.js + react-chartjs-2 |
| Auth | Netlify Identity (`@netlify/identity`) |
| Database | Netlify Database (Postgres) via Drizzle ORM beta |
| Language | TypeScript 5.9 (strict mode) |
| Deployment | Netlify |

## Key Directories

```
src/
├── routes/
│   ├── __root.tsx          # App shell: IdentityProvider + CallbackHandler
│   ├── index.tsx           # Main app: Add Fill-up, History, Statistics tabs
│   ├── login.tsx           # Login/signup page
│   └── api/
│       ├── vehicles.ts     # GET (list) / POST (create) vehicles
│       ├── vehicles.$id.ts # PUT / DELETE a vehicle
│       ├── fillups.ts      # GET (list with filters + enrichment) / POST (create)
│       └── fillups.$id.ts  # PUT / DELETE a fill-up
├── lib/
│   ├── auth.ts             # getServerUser server function (reads nf_jwt cookie)
│   └── identity-context.tsx# React context for client-side auth state
├── middleware/
│   └── identity.ts         # identityMiddleware and requireAuthMiddleware
└── components/
    └── CallbackHandler.tsx # Processes OAuth/email confirmation URL hashes on page load

db/
├── schema.ts               # Drizzle schema: vehicles + fillups tables
└── index.ts                # Drizzle client (netlify-db adapter)

netlify/database/migrations/ # Auto-generated SQL migrations (applied at deploy time)
```

## Data Model

### `vehicles`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| user_id | text | Netlify Identity user UUID |
| name | text | e.g. "Honda City" |
| vehicle_type | text | 'car' or 'bike' |
| fuel_type | text | 'petrol', 'diesel', 'cng', 'electric' |
| created_at | timestamp | |

### `fillups`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| vehicle_id | integer FK → vehicles.id | CASCADE delete |
| user_id | text | Netlify Identity user UUID |
| fillup_date | date | |
| fillup_time | text | HH:MM |
| fuel_price | numeric(10,2) | Price per unit (₹/L, ₹/kg, ₹/kWh) |
| amount_paid | numeric(10,2) | Total ₹ paid |
| fuel_quantity | numeric(10,3) | = amount_paid / fuel_price |
| odometer_reading | numeric(10,1) | km |
| notes | text | nullable |
| created_at | timestamp | |

## Key Design Decisions

- **Distance/mileage computed at query time**: The `/api/fillups` route queries the previous fill-up for the same vehicle to compute `distance` (odometer diff) and `mileage` (distance / fuel_quantity). Derived data is not stored.
- **Fuel quantity auto-calculated**: `amount_paid / fuel_price` determines the fuel quantity displayed before saving. No separate litre entry required.
- **All API routes protected by `getUser()`**: Every handler calls `@netlify/identity`'s `getUser()` which validates the `nf_jwt` cookie. No JWT parsing or secrets required.
- **Auth does not work on localhost**: Netlify Identity requires a real Netlify deployment. Test auth on a branch preview.
- **`drizzle-orm@beta` and `drizzle-kit@beta` required**: The Netlify Database adapter only exists on the beta release line. Never install without the `@beta` tag.

## Adding Schema Changes

1. Edit `db/schema.ts`
2. Run `npx drizzle-kit generate`
3. Commit the generated migration in `netlify/database/migrations/` — it is applied automatically on next deploy.

## File-Based Routing (TanStack Router)

Routes are defined by files in `src/routes/`:
- `__root.tsx` — Root layout wrapping all pages
- `index.tsx` — Main app route `/`
- `login.tsx` — `/login`
- `api/vehicles.ts` — `/api/vehicles`
- `api/vehicles.$id.ts` — `/api/vehicles/:id`
- `api/fillups.ts` — `/api/fillups`
- `api/fillups.$id.ts` — `/api/fillups/:id`

## Development Commands

```bash
npm run dev      # Start Vite dev server (no Identity)
netlify dev      # Start Netlify dev proxy (needed for Identity testing)
npm run build    # Production build
```
