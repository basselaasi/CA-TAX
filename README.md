# Canadian Tax Prep Organizer (Ontario-focused)

A production-oriented Next.js app to help Canadians organize information for personal tax return preparation.

> **Not tax advice. Not a substitute for a professional. Tax rules can change. You are responsible for your return.**

This app **does not** file with CRA, does not claim CRA endorsement, and avoids collection of SIN/full DOB.

## Features

- Consent gate before any data entry
- Multi-step wizard with progress, save/resume, and final review
- Rules engine (`/rules/v1.json`) maps user profile answers to sections + personalized checklist
- Ontario-specific rent/property tax info collection prompt (collection only)
- JSON export and multi-page PDF Tax Prep Package download
- Optional authentication via NextAuth email magic link
- Guest mode with local storage + authenticated save/load endpoints
- Delete-my-data flow (local + server-side)
- Encryption utility for sensitive persisted payload fields

## Tech stack

- Next.js (App Router), TypeScript, Tailwind
- Prisma ORM (`SQLite` for local dev; swap datasource for PostgreSQL in deployment)
- NextAuth email provider (magic link)
- PDF generation with `pdf-lib`
- Unit tests with Vitest + smoke tests with Playwright

## Data model

Prisma models include:

- `User`
- `TaxYearReturn`
- `Profile`
- `IncomeSlip`
- `RRSP`
- `Tuition`
- `MedicalExpense`
- `RentHousing`
- `Donation`
- `SelfEmployment`
- `Document`

## Security and compliance notes

- No SIN collection.
- Birth year only (no full DOB field).
- Persisted return payloads are encrypted (AES-256-GCM helper).
- HTTPS is required in deployed environments.
- Users can clear browser data and trigger server-side deletion via “Delete my data”.

## How to run locally

1. Copy env:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate Prisma client and migrate:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```
4. (Optional) seed sample data:
   ```bash
   npm run seed
   ```
5. Run app:
   ```bash
   npm run dev
   ```

## Testing

```bash
npm run test
npm run test:e2e
```

## How to deploy

- Deploy to Vercel, Fly.io, Render, or similar.
- Use managed PostgreSQL in production and update `DATABASE_URL`.
- Configure HTTPS (required), NextAuth variables, SMTP variables, and `FIELD_ENCRYPTION_KEY`.
- Run migrations during deploy (`prisma migrate deploy`).
- Point users to CRA-certified tax software or a professional for filing.

## Non-goals

- CRA netfile/e-file submission
- Detailed tax calculations or refund guarantees
- Corporate tax handling
