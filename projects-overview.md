# Portfolio Projects Overview

This document provides a detailed overview of each project in this portfolio, intended to help an AI agent (or any collaborator) understand the nature, architecture, and scope of each project when designing a portfolio website.

---

## 1. BookForMe

**Type:** SaaS Booking Platform  
**Role:** Full-Stack Developer  
**Tech Stack:** Laravel 11/PHP 8.2/8.3, Nuxt 3, Laravel Sanctum, AWS S3, Laravel Mix, Astrotomic Translatable, Yajra DataTables, Laravel Reverb (WebSockets)

### What It Is
BookForMe is a multi-tenant SaaS platform that enables service businesses (salons, clinics, spas, etc.) to manage online bookings. The platform is split across several applications, each serving a distinct role in the ecosystem.

### Architecture (Multi-Repo)

**`bookforme-admin`** — Internal Laravel 11 admin back-office  
The super-admin dashboard used by the platform operator (not the business owners). Manages tenants (partner stores), subscription plans, top-up packages, billing, locations (countries/cities), currencies, timezones, and multi-language translations (English/Arabic). Built with server-rendered Blade + jQuery, following a strict Repository pattern. Uses Yajra DataTables for listing screens and a standardized JSON response envelope for all AJAX mutations. Fully RTL-aware with separate `theme-modern-en.css` and `theme-modern-ar.css` stylesheets.

**`bookforme-agent`** — Laravel onboarding microservice  
A dedicated API that guides new partner businesses through their initial branch setup wizard. Handles setup steps: branch profile, resource rooms, service categories, services themselves, and employee/staff registration. Uses signature-based authentication to verify legitimate onboarding sessions.

**`bookforme-client-nuxt-app`** — Customer-facing booking app (Nuxt 3)  
The end-user application where customers discover stores, browse services, select employees, choose available time slots, and complete bookings. Supports multi-store routing (`/[store_identifier]/[branch_id]/...`), user authentication (login, register, OTP mobile verification, forgot password), profile management, and a full booking history view with status filtering. Deployed on AWS Amplify.

**`partners-bookforme-api`** — Partner business API (Laravel 11 + Reverb)  
The most feature-rich backend, serving the store-owner dashboard. Covers:
- **Bookings:** create new bookings, manage existing ones (cancel, reschedule, mark complete, change client, add notes), booking history, filtering, and CSV export
- **Calendar:** daily/weekly view with blocked time slots
- **Catalogue:** services, packages, memberships, products (with SKU generation, stock management, import/export), categories, and brands
- **Clients:** full CRM — client profiles, booking history, notes, documents, gift cards, block/unblock, import/export
- **Inventory:** stock orders (create, receive, cancel, export), stock takes, suppliers
- **Marketing:** deals, promotions, reminder campaigns, message history
- **Employees & Roles:** staff management with permissions
- **Reports & Analytics:** revenue, sales, performance breakdowns
- **Settings:** store profile, branch configuration, working hours, notifications, payments

**`partners-bookforme-nuxt`** — Partner dashboard frontend (Nuxt 3)  
The Vue/Nuxt 3 SPA consumed by store owners, connected to the partners API above.

**`online-profile-bookforme-api` / `online-profile-bookforme-nuxt`** — Public store profile  
A separate public-facing website for each store's online presence, allowing clients to discover the store and initiate bookings. Includes Sentry error monitoring on the frontend.

### Key Highlights
- Full Arabic/English bilingual support with RTL layout switching
- Multi-tenant architecture with isolated per-store data
- Real-time features via Laravel Reverb (WebSockets)
- Complex calendar and availability scheduling logic
- Inventory management with stock tracking and supplier orders
- Marketing tools with automated reminders and campaign history

---

## 2. UOP (University of Palestine)

**Type:** University Website & CMS  
**Role:** Full-Stack Developer  
**Tech Stack:** Laravel 12, Nuxt 4, Vue 3 + TypeScript, Inertia.js, Jetstream, Vite, Laravel Sanctum

### What It Is
A comprehensive digital platform for a university, consisting of a content management system (admin dashboard), a headless API backend, and a public-facing website. The system manages all official university content and serves it to visitors in a dynamic, multilingual format.

### Architecture (Multi-Repo)

**`UOP-dashboard`** — Admin CMS (Laravel 12 + Vue 3 + Inertia.js)  
An internal admin panel built on Laravel 12 with the Vuero 3 premium admin template, integrated via Inertia.js. Provides content editors with tools to manage all university content. Follows a Repository + Service + Transformer architecture. Includes full-text OpenAPI 3.0 documentation. Supports multi-language content management.

**`UOP-endpoints`** — Headless API backend (Laravel)  
A pure JSON API that serves all content to the frontend. Data models include: Pages, Posts, Events, Exams, Galleries, Success Stories, Ads, Brochures, Sliders, Menus, Groups, Folders, Files, YouTube content, Analytics, and more. Supports page cloning, multi-language, and session management.

**`UOP-frontend`** — Public university website (Nuxt 4)  
The student/visitor-facing website. Pages include:
- Home (landing with slider)
- Events listing
- Exam schedules & course details
- Photo galleries
- News & posts
- High school results lookup
- Partnerships
- Publications & research
- Success stories
- Dynamic content pages (`[...slug].vue` for any CMS-managed page)
- Colleges and specialization cards
- Contact section with WhatsApp integration

### Key Highlights
- Dynamic CMS-driven page system (any page can be created from the dashboard and served automatically)
- Complete academic content management: exams, events, galleries, stories
- Multi-language support (Arabic/English) with locale switcher
- OpenAPI documentation for the full API surface
- 100+ Vuero UI components available in the dashboard

---

## 3. Taskat

**Type:** Project Management Tool (Jira-like)  
**Role:** Full-Stack Developer  
**Tech Stack:** Laravel (API), Nuxt 3, Laravel Sanctum, WebSockets/broadcasting

### What It Is
Taskat is a full-featured agile project management platform for software teams. It provides everything teams need to plan, track, and ship work — from project creation to sprint completion.

### Architecture (Multi-Repo)

**`taskat-api` / `taskat-backend`** — Laravel REST APIs  
Two complementary API layers powering the platform. Together they provide:
- **Projects:** create, update, archive, favorite, key-project pinning, project history
- **Issues (Tasks):** full CRUD, attachments, labels, types (bug/feature/task/etc.), priority management, copy issue, bulk operations, move between projects, file uploads, global search, "Your Work" personal view
- **Boards:** kanban board view with drag-and-drop issue movement between status columns
- **Sprints:** create, start, complete sprints; bulk-create issues in a sprint
- **Statuses:** customizable per-project statuses with sort ordering
- **Teams:** member management, invitation system (send, check, accept/reject)
- **Roles & Permissions:** role-based access control per project
- **Chat:** real-time channels (create, leave, read), messages (send, pin, save), reactions, attachments, member management
- **Notifications:** push notification support via player IDs
- **Comments:** threaded comments on issues
- **History:** full audit trail for issues and projects
- **Profile:** user profiles with password management

**`taskat-frontend` / `taskat-nuxt`** — Nuxt 3 SPA  
The web application frontend. Key screens:
- Dashboard / welcome screen
- Projects list and individual project views
- Kanban board
- Backlog management
- Sprint settings
- Team management with invitation flow
- Issue settings (types, roles, sprints, files, history)
- "Your Work" cross-project personal view
- User profiles
- Real-time chat interface

### Key Highlights
- Full agile workflow: backlog → sprint planning → active sprint → completion
- Kanban board with drag-and-drop issue management
- Built-in team chat with channels, reactions, pinned messages
- Role-based permissions per project
- Complete audit history for every change
- Team invitation system with email-based onboarding

---

## 4. Jamme3ha (NetSpeed)

**Type:** ISP / Internet Service Management System  
**Role:** Full-Stack Developer  
**Tech Stack:** Laravel, AdminLTE, jQuery, DataTables, SMS integration

### What It Is
Jamme3ha is a full-stack management platform for an internet service provider. It handles the complete lifecycle of internet cards (prepaid scratch cards), user accounts, technical support ticketing, field operations (installations and repairs), and a loyalty/gifting system. The system is named "Jamme3ha" (meaning "collect them all" in Arabic) and operates at the domain `jamme3ha.com`.

### Core Features

**Internet Card Management**  
The heart of the platform. Admins create and manage prepaid internet cards organized by category (speed tiers, duration packages). Cards have statuses (active, used, expired), and users redeem them to access the internet. Includes a public hotspot API endpoint (`POST /api/hotspot/redeem`) that integrates with external hotspot hardware/routers — when a user connects to a hotspot, the hardware calls this API with the card number, password, and user phone to authenticate and activate the session.

**User System & Points**  
Users register with mobile phone verification (SMS). Each user accumulates points through card usage. Admins can manually adjust user point balances and run point repair operations. Tracks unregistered/anonymous connections separately.

**Gifting & Rewards**  
Two gift types: in-kind gifts (physical items users can redeem with points) and card gifts (free internet cards). Users can earn gifts based on activity. Gift statuses track fulfillment.

**Support Ticketing**  
Full helpdesk system for customer issues. Tickets are categorized by type and assigned support statuses. Linked to customer accounts for full history.

**Field Operations**  
Tracks both network-side and client-side work orders:
- *Repairs:* network repairs and client device repairs
- *Installations:* new network installations and client setups
Includes area management and router type tracking for equipment inventory.

**Admin Dashboard**  
Built on AdminLTE with role-based access control. Admins have customizable role abilities (granular permissions). The dashboard includes: charts (user growth, card usage, gift statistics), a visitor tracking system, login history, activity logging, and a messaging/announcements system. Supports multilingual content and custom CMS pages.

**Custody Management**  
Tracks physical equipment/assets (custodies) assigned to departments and clients.

### Key Highlights
- Hardware-integrated hotspot API for real-time internet access authentication
- SMS-based user verification
- Points-based loyalty and gifting system
- Complete ISP operations suite: cards, support, installations, repairs
- Detailed activity and login audit logging
- Role-based admin access with granular permissions

---

## 5. Sufra

**Type:** Restaurant SaaS (Menu, Ordering & POS Platform)  
**Role:** Full-Stack Developer  
**Tech Stack:** Nuxt 4, @nuxt/ui v4, Tailwind CSS v4, Pinia, VueUse, Supabase (Postgres + Auth + Storage + Realtime), Zod v4, Upstash Redis, Dexie (IndexedDB), @vite-pwa/nuxt, VAPID Web Push, Tauri v2 (Rust + Vue), Axum (Rust HTTP server), rusb (USB ESC/POS), pnpm workspaces

### What It Is
Sufra ("سفرة" — Arabic for dining table / meal spread) is a multi-tenant SaaS platform for restaurants. It allows restaurant owners to publish a digital menu, accept customer orders, manage tables, run a point-of-sale terminal, and print receipts — all from a unified system. The platform is production-live with real restaurant owners and customers.

### Architecture (Monorepo — 5 Active Projects)

**`sufra-supabase`** — Database & backend layer  
The single shared Supabase backend powering all other apps. Contains the full Postgres schema with Row-Level Security (RLS) policies for all three roles (anon, owner, admin), stored procedures/RPCs (`place_order`, `update_order`, `get_occupied_table_ids`, `request_phone_verification`), storage buckets, and Postgres triggers. The `place_order` trigger also fires a web push fan-out to notify the restaurant in real time. Migrations follow a strict one-concern-per-file convention and are deployed via `supabase db push` to both staging and production environments.

**`sufra-dashboard`** (Nuxt 4 SPA + Nitro, port 3000) — Owner-facing admin panel  
The primary restaurant management application used by store owners and staff. Features include:
- **Menu management:** categories, meals, offers — with full Arabic/English translations, drag-and-drop reorder, visibility toggling, and image uploads via Supabase Storage
- **POS (Point of Sale):** a full offline-capable POS terminal with cart management, shift tracking, and an outbox queue for mutations made during WAN outage
- **KDS (Kitchen Display System):** real-time order display for kitchen staff
- **Orders:** full order lifecycle management — create, update status, add payments, mark paid, refund, export; real-time order push notifications via VAPID web push
- **Tables & Areas:** area and table CRUD with busy-guard preventing deletion of occupied tables; drag-and-drop reorder
- **Customers:** CRM with soft-delete, block/unblock, notes, saved locations, wallet ledger, order history, and search
- **Team management:** staff accounts with granular role-based permissions (`can_manage_menu`, `can_manage_orders`, `can_use_pos`, `can_use_kds`, `can_view_reports`, `can_manage_store`, `can_manage_staff`)
- **Reports & Analytics:** sales reports, top items, revenue charts
- **PWA:** installable as a desktop/mobile app with a Workbox service worker (injectManifest), offline support via Dexie (IndexedDB), and background sync
- **Caching:** Upstash Redis shared with the menu app; every mutation busts both the dashboard cache and the customer-facing menu cache

**`sufra-menu`** (Nuxt 4 SSR, port 3001) — Public customer-facing app  
The customer-side experience, served to diners at the restaurant or remotely. Features:
- **Menu display:** SSR-rendered menu with 1-hour Redis cache for performance; anon-role Supabase access (RLS is the only protection — no service key)
- **Table selection:** customers pick their table; occupied tables are detected via the `get_occupied_table_ids` SECURITY DEFINER RPC without exposing order PII
- **Ordering:** customers browse the menu, add items, and place orders directly (calls `place_order` RPC from the browser)
- **Order lookup:** customers can track their order using their phone number; a 6-digit OTP is sent via WhatsApp (Meta Cloud API integration — currently console-only pending Meta Business onboarding)
- **Multilingual:** Arabic (`ar-EG`) default with English (`en-US`) toggle

**`sufra-admin`** (Nuxt 4 SPA + Nitro, port 3333) — Platform super-admin  
An internal back-office for the SaaS operator to manage all restaurant tenants, subscription plans, and payments. Uses an isolated session cookie prefix (`sb-sufra-admin`) to avoid collisions with the dashboard session.

**`sufra-printer`** (Tauri v2 — Windows desktop tray app, port 9177) — ESC/POS print bridge  
A silent tray application that runs on the restaurant's PC and enables thermal receipt printing. Architecture:
- **Rust (Tauri v2):** Axum HTTP server listening on `127.0.0.1:9177` with routes for `/health`, `/print`, `/devices`, `/config`, and `/jobs`
- **USB printing:** uses `rusb` (libusb1-sys) to write raw ESC/POS bytes directly to USB thermal printers
- **Vue 3 UI:** settings screen for printer configuration and job log viewer
- **CORS trust boundary:** only accepts requests from the production dashboard domain, Tauri webview origin, and localhost — Chrome's Private Network Access header is set to allow HTTPS → loopback calls
- **Auto-update:** polls the GitHub Releases API daily and notifies via tray tooltip + desktop notification when a new version is available
- **Auto-start:** launches on Windows startup via `tauri-plugin-autostart`
- The dashboard uses a facade composable chain (`usePrinter` → `usePrinterTransport` → `useSufraBridge`) with automatic fallback to WebUSB if the bridge is unreachable

### Key Highlights
- Production-live SaaS with real restaurant clients
- Offline-first POS with IndexedDB outbox and background sync — continues operating during internet outages
- Real-time order notifications via VAPID web push (no third-party push service)
- Full PWA: installable, service worker, offline support
- Native desktop print bridge in Rust (Tauri) for thermal receipt printing
- WhatsApp OTP for order lookup (implemented, pending Meta Business activation)
- Strict multi-role security: anon, owner, and admin roles with RLS on every table
- Bilingual (Arabic RTL default + English) across all apps
- Shared Upstash Redis cache between dashboard and menu with coordinated cache busting

---

## Summary Table

| Project | Category | Frontend | Backend | Complexity |
|---|---|---|---|---|
| BookForMe | SaaS / Booking Platform | Nuxt 3 | Laravel 11 | ⭐⭐⭐⭐⭐ |
| UOP | University CMS & Website | Nuxt 4 + Vue 3 | Laravel 12 | ⭐⭐⭐⭐ |
| Taskat | Project Management Tool | Nuxt 3 | Laravel | ⭐⭐⭐⭐⭐ |
| Jamme3ha | ISP Management System | Blade + jQuery | Laravel | ⭐⭐⭐⭐ |
| Sufra | Restaurant SaaS / POS | Nuxt 4 + Tauri (Vue) | Supabase + Nitro (Rust) | ⭐⭐⭐⭐⭐ |

---

## Common Tech Patterns Across Projects

- **Backend:** Laravel (versions 11–12) with Repository pattern, Service layer, Form Request validation
- **Frontend:** Nuxt 3/4 (Vue 3) as the primary SPA framework across all modern projects
- **Auth:** Laravel Sanctum for SPA authentication across all projects
- **API Design:** RESTful JSON APIs with consistent response envelope patterns
- **Bilingual:** Arabic + English support is a recurring requirement (RTL/LTR)
- **Real-time:** WebSockets/broadcasting in BookForMe (Reverb) and Taskat
- **File handling:** AWS S3 integration in BookForMe; local storage patterns elsewhere
- **Database:** MySQL in production across all projects
