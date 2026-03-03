# Lead to Quote — Trades

Simple lead-to-quote software for local service trades (plumbers, landscapers, electricians, etc.). Capture a lead, build a quote with line items, send a shareable link, let the client accept, and download a PDF—no CRM bloat.

## Quick start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env.local
   ```

   Set at least:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Set up the database**

   In the [Supabase](https://supabase.com) SQL Editor, run the contents of `supabase/schema.sql`.

4. **Run the app**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Sign up, fill in your business profile, add a lead, create a quote, and send it.

## Documentation

Full setup and API reference in **[docs/DOCUMENTATION.md](docs/DOCUMENTATION.md)**.

## Stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Supabase (PostgreSQL, Auth)
- @react-pdf/renderer (pure JS PDF — serverless-safe, no Puppeteer)

## License

Private. All rights reserved.
