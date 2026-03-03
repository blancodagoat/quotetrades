# Lead to Quote — Documentation

---

## Table of Contents

1. [Overview](#1-overview)
2. [Requirements](#2-requirements)
3. [Installation](#3-installation)
4. [Configuration](#4-configuration)
5. [Database Setup](#5-database-setup)
6. [Authentication](#6-authentication)
7. [Application Structure](#7-application-structure)
8. [User Flows](#8-user-flows)
9. [API Reference](#9-api-reference)
10. [Deployment](#10-deployment)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Overview

Lead to Quote is a focused tool for solo and small trade businesses. It replaces manual quoting via PDF or spreadsheet with a fast digital flow:

**Lead in → Quote out → Client accepts → PDF download**

Features:
- **Leads** — capture name, phone, email, address, job type, source, and scheduling slot; track status (new / quoted / accepted / declined / done).
- **Quotes** — build from a lead, with line items (description, quantity, unit price); optional expiry date; shareable public link; client "Accept" button.
- **Templates** — reusable sets of line items for common jobs.
- **Business profile** — company name, phone, email, address; auto-stamped onto sent quotes.
- **PDF export** — `@react-pdf/renderer` (pure JS, serverless-safe); no Puppeteer or headless browsers.

---

## 2. Requirements

- Node.js 18+
- npm
- A [Supabase](https://supabase.com) account (free tier is sufficient for development)

---

## 3. Installation

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
npm run dev
```

---

## 4. Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (Dashboard → Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous (public) key |
| `NEXT_PUBLIC_APP_URL` | No | Full public URL of the app (e.g. `https://app.example.com`). Used to generate shareable quote links. Defaults to `http://localhost:3000`. |

---

## 5. Database Setup

1. Go to [Supabase](https://supabase.com) and create a project.
2. In the Dashboard, open **SQL Editor**.
3. Copy the full contents of `supabase/schema.sql` and run it.

This creates:

- `business_profiles` — one row per user, stores company info.
- `leads` — one row per lead, with status and scheduling.
- `quote_templates` + `quote_template_items` — reusable line-item sets.
- `quotes` + `quote_items` — quotes tied to leads; include snapshot fields (`client_name`, `biz_name`, etc.) captured at send time so the public quote page is self-contained.
- RLS policies ensuring each user only sees their own data; anon-only policies for the public quote shareable-link flow.

**Note on RLS:** The two public-quote policies are `TO anon` — they only apply to unauthenticated requests. This means another authenticated user on the platform cannot read or update your quotes via the shareable link; only the anonymous public (the client) can.

---

## 6. Authentication

- **Email/password** — via `/signup` and `/login`.
- **Session handling** — `@supabase/ssr` manages server-side sessions; the middleware refreshes the session on each request.
- **Protected routes** — all `/dashboard` routes redirect to `/login` if unauthenticated (enforced in `src/app/(dashboard)/layout.tsx`).

### Supabase Auth settings

1. Dashboard → Authentication → URL Configuration.
2. Set **Site URL** to your app URL.
3. Add **Redirect URLs**: `http://localhost:3000/auth/callback` (dev) and your production URL.

---

## 7. Application Structure

```
src/
  app/
    (dashboard)/           # Authenticated area
      dashboard/           # Summary stats + recent leads
      leads/               # Lead list, new, detail/edit
      quotes/              # Quote list, new, detail
      templates/           # Template CRUD
      profile/             # Business profile
    quote/[slug]/          # Public shareable quote (no auth)
    login/ signup/         # Auth pages
    auth/callback/         # Supabase OAuth callback
    api/
      leads/               # GET (list), POST (create), PATCH, DELETE
      quotes/              # GET, POST, PATCH, DELETE; /send, /accept, /pdf
      templates/           # GET, POST, PATCH, DELETE
      profile/             # GET, PUT (upsert)
  components/              # Client components (forms, actions, nav)
  lib/
    supabase/              # client.ts, server.ts, middleware.ts
    slug.ts                # 12-char random slug generator
    pdf.tsx                # @react-pdf/renderer QuotePDF document component
  types/index.ts
  middleware.ts
supabase/schema.sql
```

---

## 8. User Flows

### 8.1 Lead flow

1. Sign in → Dashboard → **+ New lead**.
2. Fill in name, phone/email, address, job type, source, scheduling slot.
3. Lead is created with status `new`.
4. Click lead → edit details, update status, or create a quote from it.

### 8.2 Quote flow

1. **Quotes → + New quote** (or from a lead detail page).
2. Select the lead; optionally load a template to pre-fill line items.
3. Enter title, line items (description, qty, unit price), optional expiry and notes.
4. Save → quote is `draft`.
5. On the quote detail page, click **Send quote** — this:
   - Generates a 12-character public slug.
   - Snapshots client info (from lead) and business info (from profile) onto the quote.
   - Sets status to `sent`.
6. Copy the shareable link and send to the client (SMS, email, WhatsApp, etc.).
7. The client opens `/quote/[slug]` — sees the quote, line items, total — and clicks **Accept this quote**.
8. Status updates to `accepted`; the lead status also updates to `accepted`.
9. Download PDF at any time via the **Download PDF** button (calls `/api/quotes/[id]/pdf`).

### 8.3 Template flow

1. **Templates → + New template**.
2. Name the template and add preset line items with quantities and unit prices.
3. When creating a quote, select the template from the dropdown to pre-fill items (editable before saving).

### 8.4 Business profile

1. **Profile** → fill in company name, phone, email, address.
2. Save. This info is stamped onto quotes when you click **Send quote**.

---

## 9. API Reference

All routes require authentication (Supabase session cookie) unless noted.

### 9.1 Leads

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/leads` | List all leads for authenticated user. |
| POST | `/api/leads` | Create lead. Body: `{ name, phone?, email?, address?, job_type?, notes?, source?, scheduled_at? }` |
| GET | `/api/leads/[id]` | Get lead with linked quotes. |
| PATCH | `/api/leads/[id]` | Update any lead fields. |
| DELETE | `/api/leads/[id]` | Delete lead. |

### 9.2 Quotes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/quotes` | List all quotes with lead name. |
| POST | `/api/quotes` | Create quote. Body: `{ lead_id, title, valid_until?, notes?, items? }`. Items: `[{ description, quantity, unit_price_cents }]` |
| GET | `/api/quotes/[id]` | Get quote with lead and items. |
| PATCH | `/api/quotes/[id]` | Update quote fields and/or replace all items. |
| DELETE | `/api/quotes/[id]` | Delete quote. |
| POST | `/api/quotes/[id]/send` | Set status to `sent`; generate slug; snapshot client + business info. |
| POST | `/api/quotes/[id]/accept` | Set status to `accepted`. Auth OR `{ token: public_slug }` in body. Also updates lead status to `accepted`. |
| GET | `/api/quotes/[id]/pdf` | Stream PDF as `application/pdf`. Auth required. |

### 9.3 Templates

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/templates` | List all templates with items. |
| POST | `/api/templates` | Create template. Body: `{ name, items? }` |
| PATCH | `/api/templates/[id]` | Update name and/or replace items. |
| DELETE | `/api/templates/[id]` | Delete template and items. |

### 9.4 Profile

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/profile` | Get business profile for authenticated user (null if none). |
| PUT | `/api/profile` | Upsert profile. Body: `{ company_name, email?, phone?, address? }` |

---

## 10. Deployment

### 10.1 Build

```bash
npm run build
```

Fix any TypeScript errors before deploying.

### 10.2 Vercel

The app is a standard Next.js 14 application. Deploy to Vercel with the following:

1. Set all required env vars in the Vercel project settings.
2. Set Supabase **Site URL** and **Redirect URLs** to your production domain.
3. `@react-pdf/renderer` is declared in `serverComponentsExternalPackages` in `next.config.mjs` — no further config needed for PDF generation on serverless.

### 10.3 Other hosts

Any Node.js host that supports Next.js 14 works (Railway, Render, VPS). Node.js 18+ required.

---

## 11. Troubleshooting

**"Unauthorized" on API calls** — Confirm the user is logged in (session cookie set). Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct.

**Public quote page shows 404** — The quote must have a `public_slug`. Click "Send quote" in the dashboard to generate one.

**PDF download fails** — Ensure the quote belongs to the authenticated user. Check server logs for `@react-pdf/renderer` errors. The PDF route requires the Node.js runtime (default for API routes in Next.js 14).

**Client "Accept" fails** — The `token` in the request body must exactly match the quote's `public_slug`. Ensure the public quote page is sending the slug from the URL correctly.

---

End of documentation.
