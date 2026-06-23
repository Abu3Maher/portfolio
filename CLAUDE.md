# Sufra — Restaurant SaaS Monorepo

Sufra is a restaurant menu + ordering SaaS. The monorepo lives at `C:\Users\nassr\Github\sufra` and holds five active sub-projects sharing a single Supabase backend.

---

## Monorepo structure

| Project | Role | Type |
|---|---|---|
| `sufra-supabase` | Postgres schema, RLS, RPCs, storage, triggers | Supabase CLI / migrations |
| `sufra-dashboard` | Owner-facing admin — menu, POS, KDS, orders, tables, customers, team | Nuxt 4 SPA + Nitro (port 3000) |
| `sufra-menu` | Public customer-facing menu + ordering + table selection + order lookup | Nuxt 4 SSR (port 3001) |
| `sufra-admin` | Internal platform admin — stores, plans, payments | Nuxt 4 SPA + Nitro (port 3333) |
| `sufra-printer` | Silent ESC/POS print bridge — tray app on restaurant PC | Tauri (Rust + Vue, port 9177) |

### Always ignore

- `sufra-dashboard-api` — Legacy Laravel API. Dead. Do not touch, reference, or plan changes here.
- `sufra-website` — Marketing only; no runtime dependency on the others.

---

## Skills — when to invoke

Invoke the matching skill **before** writing code for the relevant area.

| Task | Invoke |
|---|---|
| Nuxt pages, layouts, middleware, plugins, composables, `nuxt.config.ts` | `/nuxt` |
| Nitro server routes, H3 event handlers, `server/utils/`, `server/middleware/` | `/nuxt-server` |
| `@nuxt/ui` v4 components, theming, forms, slots | `/nuxt-ui` |
| Supabase client queries, auth, realtime, storage in app code | `/supabase` |
| SQL migrations, RLS policies, RPCs, triggers, schema changes | `/supabase-postgres-best-practices` |
| Vue 3 SFCs, Composition API, `<script setup>`, reactivity | `/vue` |
| VueUse composables (`useStorage`, `useDebounceFn`, `useEventListener`, etc.) | `/vueuse` |
| Vue component tests | `/vue-testing-best-practices` |
| Vitest unit tests | `/unit-testing` |
| i18n locale files, RTL layout, Arabic typography, `dir` attribute | `/i18n-rtl` |
| Responsive CSS, Tailwind breakpoints, mobile/tablet layout | `/responsive-design` |
| PWA manifest, install prompt, `@vite-pwa/nuxt` config, `public/sw.js` | `/pwa-development` |
| Offline-first architecture, sync queues, background sync, outbox pattern | `/web-pwa-offline-first` |
| Dexie schema, migrations, live queries, IndexedDB CRUD (`app/db/index.ts`) | `/dexiejs` |
| `sufra-printer` Tauri commands, tray, plugins, Rust ↔ Vue IPC | `/tauri` |
| Code review of a diff or PR | `/code-review` |
| Security audit | `/security-review` |

---

## Working conventions

These rules apply to every task in this project, without exception.

### 1. Ask before assuming

If a task is missing any detail that would change the implementation — which sub-project, which table, which route, which locale, edge cases — **stop and ask** before writing a single line. A wrong assumption wastes more time than a clarifying question. One focused question is better than five corrections later.

What always needs clarification if not stated:
- Which sub-project the change lives in (dashboard / menu / admin / supabase / printer)
- Whether a new feature is owner-only or staff-accessible
- Whether translated content is needed (ar + en)
- Whether the change is menu-visible (triggers cache busting requirement)

### 2. Split large code into components

Any file or function that becomes hard to scan at a glance must be broken up. Concrete thresholds:

- **Vue pages** — extract repeated UI blocks into named components under `app/components/`. A page should orchestrate, not implement.
- **Server routes** — extract shared logic into `server/utils/`. A route handler should be thin: parse → validate → call util → respond.
- **Composables** — split a composable that handles two distinct concerns into two composables. Name each after what it owns.
- **Rust (sufra-printer)** — keep each `.rs` module at one responsibility; the existing `server.rs / printer.rs / state.rs / config.rs` split is the model to follow.

The goal is that any file can be understood in isolation without tracing the whole call graph.

### 3. Protect orders — real clients are on this system

The orders flow (`place_order` RPC, `orders/` routes, POS, KDS, push notifications) is live in production with real restaurant owners and customers. Before finishing any task:

1. **Search for order-adjacent side effects.** If the change touches `orders`, `store_tables`, `customers`, `place_order`, `update_order`, `order_items`, or `push_subscriptions` — explicitly verify the change doesn't alter existing behaviour.
2. **Do not change the `place_order` / `update_order` RPC signature** without updating both callers: `sufra-menu` (browser) and `sufra-dashboard` (POS server route).
3. **Cache busting is mandatory** for every mutation that affects menu-visible data. Missing a bust silently serves stale data to customers for up to 1 hour.
4. **Push notification payload changes** require syncing three places simultaneously: the Postgres trigger, the dispatch route, and `public/sw.js`. Deployed service workers lag — plan for this.

When in doubt about order-touching changes, ask before proceeding (see rule 1).

### 4. Every new feature ships with tests

No feature is complete without tests. Required coverage for each type of work:

| Work type | Required tests |
|---|---|
| New server route | Unit test: input validation + auth rejection. Integration test: happy path against real Supabase (`.env.test`). |
| New composable | Unit test: state transitions, computed values, error states. |
| New Vue component | Component test with `vue-testing-best-practices` — render, user interaction, slot/prop variants. |
| New Supabase migration | Integration test: insert/select/RLS check for each affected role (anon, owner, admin). |
| Bug fix | Regression test that fails before the fix and passes after. |

Use `/unit-testing` before writing Vitest tests. Use `/vue-testing-best-practices` before writing component tests. Tests live in `sufra-dashboard/tests/` and run with `pnpm test` (unit) and `pnpm test:integration` (requires live Supabase at `.env.test`).

### 5. Suggest a git commit after every task

When a task is complete, always end with a suggested commit message in this format:

```
<type>(<scope>): <short imperative summary>

<optional body — what changed and why, not how>
```

Types: `feat` · `fix` · `refactor` · `test` · `docs` · `chore`  
Scope: the sub-project or module (`dashboard`, `menu`, `supabase`, `printer`, `orders`, `customers`, `tables`, etc.)

Example: `feat(dashboard): add table area reorder endpoint with busy-guard`

The user decides whether to commit — never run `git commit` unless explicitly asked.

---

## Tech stack

### Nuxt apps (dashboard, menu, admin)

| Concern | Tool |
|---|---|
| Framework | Nuxt 4 (`compatibilityDate: '2025-07-15'`) |
| UI | `@nuxt/ui` v4 + Tailwind CSS v4 |
| State | Pinia (`@pinia/nuxt`) |
| Utilities | VueUse (`@vueuse/nuxt`) |
| Backend | Supabase (Postgres + Auth + Storage + Realtime) |
| Validation | Zod v4 |
| i18n | `@nuxtjs/i18n` — locales `ar` (default, RTL) + `en` |
| Testing | Vitest v4 |
| Package manager | pnpm (workspace at monorepo root) |
| Offline / IDB | Dexie — dashboard only |
| Prod cache | Upstash Redis via `nitro.storage.cache` — dashboard + menu |
| PWA | `@vite-pwa/nuxt` injectManifest — dashboard only |
| Push | VAPID web push via `web-push` npm — dashboard only |

### sufra-printer

| Concern | Tool |
|---|---|
| Framework | Tauri v2 |
| UI | Vue 3 (settings + job log screen) |
| HTTP server | Axum (Rust), listens on `127.0.0.1:9177` |
| USB transport | `rusb` (libusb1-sys) — direct ESC/POS bytes |
| Config storage | JSON at `%APPDATA%\Sufra Printer\config.json` (Windows) |
| Auto-start | `tauri-plugin-autostart` |
| Auto-update | Polls `api.github.com/repos/NasrALdaya/sufra-printer/releases/latest` daily |

---

## Architecture rules

### 1. The backend is sufra-dashboard server routes — not Laravel

All API work goes into `sufra-dashboard/server/api/dashboard/...`. Do not reference the Laravel project.

### 2. Service role key — server-only, never in sufra-menu

`SUPABASE_SERVICE_ROLE_KEY` must never appear in `sufra-menu`'s env or client bundle. The menu uses the anon key only — RLS is its sole protection. Dashboard and admin use the service role from Nitro server code only; it is never sent to the browser.

### 3. Ownership and permissions in dashboard server routes

- **Owner-only routes**: use `getOwnerStore(event)` from `server/utils/ownership.ts`.
- **Staff-accessible routes** (categories/meals GET, orders, tables): use `getStoreContext(event)`.
- **Permission enforcement**: call `requirePermission(context, 'can_manage_menu')` etc. for actions that should be role-gated. Permission keys: `can_manage_menu`, `can_manage_orders`, `can_use_pos`, `can_use_kds`, `can_view_reports`, `can_manage_store`, `can_manage_staff`.
- Never skip the ownership check — any route without it is effectively unauthenticated.

### 4. Cache busting — required after every mutation

Every server route that mutates menu-visible data must call both busters after the successful DB write:

```ts
await Promise.all([
  bustMenuCache(event, store.identifier),   // server/utils/menuCache.ts
  bustDashboardCache(store.id)              // server/utils/dashboardCache.ts
])
```

Missing a bust means edits stay invisible to customers for up to 1 hour (menu TTL). The busters write to the shared Upstash Redis instance that both apps mount in production.

### 5. Multilingual content — translations JSONB shape

Every translatable entity (`stores`, `categories`, `meals`, `offers`) stores:

- **Canonical column** (`name`, `short_description`, `description`) — the primary-language value.
- **`translations jsonb`** — shape: `{ "en": { "name": "...", ... } }`. Only non-empty fields are kept.

**Server routes:** use `cleanTranslations()` and `pickSlugSource()` from `server/utils/translations.ts`.

**Dashboard client:** use `useLocalized()` from `app/composables/useLocalized.ts` to resolve display values.

**Menu client:** use `localizedField()` from `app/utils/` for the same purpose.

Never read `name_en` / `name_ar` — those columns were dropped in Phase 2. They appear only in historical migration files.

### 6. i18n locale files — dashboard and menu are separate

- Dashboard: `sufra-dashboard/i18n/locales/ar.json` + `en.json`
- Menu: `sufra-menu/locales/ar-EG.json` + `en-US.json` (different locale codes — `ar-EG` / `en-US`)

When adding a key, add it to both `ar` and `en` files in the same project. Only mirror to the other app if the string actually appears there.

### 7. Supabase migrations discipline

- One concern per file.
- Filename format: `YYYYMMDDHHMMSS_name.sql`.
- **Never edit a committed migration.** Always add a new one.
- Apply with `supabase db push` against the linked project.
- Two environments: `sufra-staging` and `sufra-prod`.
- When adding a column: update server mappers in `sufra-dashboard/server/utils/` and client types in `app/types/index.ts`. The menu and admin each have their own mappers.
- When adding a table: define RLS policies for **all three roles** (anon, owner, admin). Default-deny means a forgotten policy silently breaks an app.

### 8. Tables ownership pattern

All dashboard routes that operate on `store_tables` must call two guards from `server/utils/tables.ts`:

```ts
const table = await getTableForStore(supabase, store.id, tableId)   // 404 if wrong store
await assertTableNotBusy(supabase, tableId)                          // 422 if active order on table
```

The service role bypasses RLS so `getTableForStore` is the actual ownership boundary. `assertTableNotBusy` prevents deleting a table with a sitting party. The public menu endpoint uses the `get_occupied_table_ids()` SECURITY DEFINER RPC instead — it returns occupied table UUIDs without exposing order PII to the anon role.

### 9. Customer soft-delete and block pattern

Customers use soft-delete (`deleted_at` column). Routes must filter `is('deleted_at', null)` for active customers. The block system is separate: `is_blocked` + `block_reason` — a blocked customer can still have their history queried.

Server mappers live in `server/utils/customer.ts`: `mapCustomerResource`, `mapLedgerResource`, `mapNoteResource`, `mapLocationResource`.

### 10. sufra-printer — CORS is the trust boundary

The bridge listens on `127.0.0.1:9177` only (loopback). CORS allows:
- `https://dashboard.sufra.app` (production)
- `http(s)://tauri.localhost` (Tauri webview)
- Any `localhost:*` or `127.0.0.1:*` origin (dev)

Chrome's Private Network Access header (`allow_private_network: true`) is required or POST print jobs are blocked from HTTPS origins to loopback. This is already set in `server.rs`. Do not remove it.

The dashboard facade is `app/composables/usePrinter.ts` → `usePrinterTransport.ts` → `useSufraBridge.ts`. Always route print calls through `usePrinter` — it handles the WebUSB fallback when the bridge is unavailable.

### 11. WhatsApp OTP — currently console-only

The order-lookup flow (`sufra-menu/server/api/menu/[store_identifier]/order-lookup/`) sends a 6-digit OTP via WhatsApp. The Meta Cloud API integration is **intentionally removed** until Meta Business onboarding completes. During this period codes print to the dev-server console. When onboarding completes, restore the delivery code following `WHATSAPP_OTP_SETUP.md` at the repo root. Do not add a fake or third-party SMS fallback.

### 12. Cross-project change risks

| Change | Risk |
|---|---|
| Add a column | Regenerate types; update server mappers in all 3 Nuxt apps |
| Rename `place_order` RPC | Called by both `sufra-menu` (browser) and `sufra-dashboard` (server). Update both. |
| Change `place_order` payload shape | Same — both call it |
| Change push notification payload | Trigger (supabase), dispatch route (dashboard), SW `public/sw.js` (dashboard) — 3 places must stay in sync; deployed SWs lag for days |
| Add a dashboard mutation on menu-visible data | Add both cache busters (see rule 4) |
| Move dashboard domain | Update the URL in the Postgres trigger that calls `/api/internal/push/dispatch`. Also update the CORS allowlist in `sufra-printer/src-tauri/src/server.rs`. |
| Rotate `INTERNAL_PUSH_SECRET` | Update in both dashboard env and Supabase trigger config simultaneously |
| Re-provision Upstash Redis | Update `KV_REST_API_URL` + `KV_REST_API_TOKEN` in both dashboard and menu Vercel projects; redeploy both |
| Change `get_occupied_table_ids` RPC signature | Breaks `sufra-menu/server/api/menu/[store_identifier]/tables.get.ts` — test with anon role before pushing |
| Change `place_order` / `update_order` table_id handling | Both RPCs clear `is_cleaning` on the assigned table in SQL. If you move this logic, keep it atomic with the order write or cleaning flags persist after a new seating. |
| Change `request_phone_verification` RPC | Called by menu's order-lookup request-code route. Rate-limit error codes are matched by regex in the route — keep the `rate_limited` string in the Postgres RAISE message. |
| Release a new `sufra-printer` build | Bump version in `src-tauri/Cargo.toml` + `src-tauri/tauri.conf.json`. The updater polls GitHub releases; the tag must be `v<semver>`. |

### 13. sufra-admin auth isolation

`sufra-admin` uses `cookiePrefix: 'sb-sufra-admin'` so its session cookie never collides with the dashboard's on the same origin in dev. Do not remove or rename this prefix.

### 14. Image transforms

Images go through `app/utils/supabaseImage.ts` + `app/composables/useSupabaseImage.ts` in both dashboard and menu. For square containers pass `width = height` and `resize: 'cover'` so Supabase image transform crops server-side. The rollback flag is `CDN_IMAGES_ENABLED=false` in env.

---

## Key file locations

### sufra-dashboard

```
server/
  utils/
    supabase.ts          — serverSupabaseServiceRole helper
    ownership.ts         — getOwnerStore(), getStoreContext(), requirePermission()
    permissions.ts       — permission key constants
    translations.ts      — cleanTranslations(), pickSlugSource(), transliterateArabic()
    store.ts             — DB-to-client store mapper
    category.ts          — DB-to-client category mapper
    meal.ts              — DB-to-client meal mapper
    offer.ts             — DB-to-client offer mapper
    order.ts             — DB-to-client order mapper, ORDER_LIST_FIELDS, ACTIVE_ORDER_STATUSES
    order.helpers.ts     — shared order helpers
    tables.ts            — getTableForStore(), assertTableNotBusy(), clearCleaningOnAssign()
    customer.ts          — mapCustomerResource(), mapLedgerResource(), mapNoteResource(), mapLocationResource()
    menuCache.ts         — bustMenuCache()
    dashboardCache.ts    — bustDashboardCache(), withDashboardCache()
    visibility.ts        — visibility helpers
    i18n.ts              — server-side i18n helpers
    serverT.ts           — server translation helper
    user.ts              — loadUserResource()
    body.ts              — readBody helpers
    files.ts             — image upload / storage helpers
    idempotency.ts       — idempotency key helpers
    validation.ts        — Zod validation helpers
  api/
    dashboard/
      categories/        — CRUD + reorder + visibility + translate
      meals/             — CRUD + reorder + reorder-pos + visibility + availability + translate
      offers/            — CRUD + reorder + visibility
      orders/            — index, show, create, update, status, add-payment, mark-paid, refund,
                           customer, unlink-table, export, detail-export, stats
      pos/shifts/        — shift management
      tables/            — CRUD areas + tables, reorder
      customers/         — index, show, create, update, delete (soft), restore, block, unblock,
                           notes CRUD, locations CRUD, ledger, orders history, search
      reports/           — sales.get, items.get
      team/members/      — CRUD
      team/roles/        — CRUD
      analytics/         — chart, summary, top-items
      store/             — show, update, store.post, identifier/check, pos-counters
      subscription/      — index
      plans/             — index
      push/              — subscribe, unsubscribe
      sync/              — categories, meals, offers, areas, tables, customers, orders (POS offline outbox)
    internal/
      push/dispatch.post.ts  — web push fan-out (called by Postgres trigger)

app/
  types/
    index.ts             — shared client-side TypeScript types
    database.types.ts    — generated Supabase types (regenerate after schema changes)
  composables/
    useAuth.ts
    useLocalized.ts      — resolves canonical + translations to display value
    useStoreLanguages.ts — hasMulti, primary language helpers
    useStorePermissions.ts  — can(key), isOwner
    useStore.ts / useCategories.ts / useMeals.ts / useOrders.ts / useOffers.ts
    useTables.ts         — table + area state
    useCustomers.ts      — customer list, search, CRUD
    useSalesReport.ts + useSalesReport.helpers.ts
    usePosCounters.ts + usePosCounters.helpers.ts
    useCostCalculator.ts
    useDashboard.ts
    usePlanFeatures.ts
    usePrinter.ts        — print facade (bridge → WebUSB fallback)
    usePrinterTransport.ts
    useSufraBridge.ts    — low-level bridge HTTP client wrapper
    useBridgeReleases.ts — GitHub release polling for update badge
    useThermalPrinter.ts — WebUSB transport
    useAutoPrintPrefs.ts
    useOrderReceipt.ts   — ESC/POS receipt builder
    useOutbox.ts         — POS offline mutation outbox
    usePosCart.ts
    usePosSlots.ts
    useOrderNotifications.ts
    useOrderPush.ts
    useOrderDetailSlideover.ts
    useOrderSound.ts
    useInstallPrompt.ts
    useOfflineStatus.ts
    useThemePreference.ts
    useLogoCache.ts
    useSupabaseImage.ts
    useCurrencySymbol.ts
    useStorage.ts
  db/index.ts            — Dexie (IndexedDB) schema
  pages/
    tables/index.vue     — table + area management
    customers/index.vue  — customer list
    customers/[id].vue   — customer detail
    reports/index.vue    — sales + item reports
    recipes/cost-calculator.vue

i18n/locales/ar.json + en.json
public/sw.js             — service worker (Workbox injectManifest + push handler)
```

### sufra-menu

```
server/
  utils/
    supabase.ts              — anon Supabase client helper
    whatsapp.ts              — OTP delivery (currently console-only; restore from WHATSAPP_OTP_SETUP.md)
  middleware/
    default-locale.ts
  api/
    menu/[store_identifier].get.ts      — 1-hour SSR cache endpoint
    menu/[store_identifier]/
      tables.get.ts                     — public table list + occupancy via get_occupied_table_ids RPC
      order-lookup/request-code.post.ts — WhatsApp OTP request (6-digit, hashed with pepper)
      order-lookup/verify.post.ts       — OTP verify → returns order summary
    phone-codes.get.ts                  — phone country codes
    internal/bust-cache.post.ts

app/utils/buildResources.ts            — menu payload builder
app/providers/supabaseImage.ts         — @nuxt/image custom provider (must export a callable, not a plain object)
locales/ar-EG.json + en-US.json
```

### sufra-printer

```
src-tauri/src/
  lib.rs          — Tauri app entry, tray setup, autostart, bridge thread spawn
  server.rs       — Axum HTTP on 127.0.0.1:9177 (routes: /health, /print, /devices, /config, /jobs)
  printer.rs      — USB ESC/POS write via rusb
  escpos_text.rs  — ESC/POS text helpers
  config.rs       — JSON config persistence (%APPDATA%\Sufra Printer\config.json)
  state.rs        — AppState: printers, job log, connected store, latest version
  updater.rs      — Daily GitHub release check, tray tooltip + desktop notification

src/
  bridge.ts       — Typed HTTP client for the local Axum server
  receiptHtml.ts  — Sample receipt HTML for job preview
  App.vue         — Settings UI (printer config, job log, device scan)
  i18n.ts         — UI strings (ar/en)
```

### sufra-supabase

```
supabase/migrations/   — YYYYMMDDHHMMSS_name.sql files (never edit committed ones)
supabase/functions/    — edge functions
```

Notable RPCs (called across multiple projects):
- `place_order` — called by sufra-menu (browser) + sufra-dashboard (POS server route)
- `update_order` — dashboard POS only
- `get_occupied_table_ids(p_store_id)` — SECURITY DEFINER; menu tables endpoint uses this
- `request_phone_verification` — menu order-lookup; rate-limiting enforced in Postgres

---

## Active initiatives (decisions are locked — do not re-ask scope)

- **Theme marketplace + AI themes** — full design-token theme system, paid catalog (manual payment recording), AI generator via Claude API. See `memory/theme_marketplace_plan.md`. Not yet implemented.
- **LAN multi-device sync** — hub mini-PC + WebSocket relay for offline POS/KDS sync during WAN outage. Plan in `LAN_MULTIDEVICE_PLAN.md`. Not yet implemented.
- **Printer bridge** — `sufra-printer` is code-complete (debug + release builds compiling). Pending: end-to-end test with real printer, then auto-launch hardening (#14) and Linux build (#15). Plan in `PRINTER_BRIDGE_PLAN.md`.
- **WhatsApp OTP** — order-lookup flow is implemented but delivery is console-only. Restore Meta Cloud API delivery when Meta Business onboarding completes. See `WHATSAPP_OTP_SETUP.md`.

---

## Writing tests

- Unit tests live in `sufra-dashboard/tests/` and run with `pnpm test`.
- Integration tests use `vitest.integration.config.ts` and run with `pnpm test:integration` (requires a live Supabase instance pointed at `.env.test`).
- When adding a new server route, add a unit test for input validation and a happy-path integration test.
- Use the `/unit-testing` skill before writing new Vitest tests.
- Use the `/vue-testing-best-practices` skill before writing component tests.

---

## Documentation

- High-level architecture: `ARCHITECTURE.md` at the monorepo root.
- Dashboard deep-dives: `sufra-dashboard/docs/` (8 docs covering auth, API conventions, caching, i18n/RTL, offline/PWA, realtime/notifications, POS, KDS).
- Environment + deployment refs: `prod-env.md`, `REF-prod.md`, `REF-staging.md` at the monorepo root.
- Egress optimization plan + progress: `EGRESS_OPTIMIZATION.md` at the monorepo root.
- Printer bridge full plan + HTTP contract: `PRINTER_BRIDGE_PLAN.md` at the monorepo root.
- LAN multi-device sync plan: `LAN_MULTIDEVICE_PLAN.md` at the monorepo root.
- WhatsApp OTP restore guide: `WHATSAPP_OTP_SETUP.md` at the monorepo root.
