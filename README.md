# MAQAM-E-JOUD Foundation — Volunteer Management System

A simple, secure, and professional web-based Volunteer Recruitment & Management System built for the **MAQAM-E-JOUD Foundation** (مقامِ جود فاؤنڈیشن).

The system centralizes volunteer recruitment across teams, generates unique public recruitment links, enables dynamic joining form customization without code changes, provides team leaders with dedicated applicant dashboards, and generates professional PDF dossiers.

---

## Brand Identity & Colors

Built in strict alignment with the official **MAQAM-E-JOUD Foundation** emblem and digital palette:

| Color | Hex | Role |
|---|---|---|
| **Deep Navy** | `#001830` | Primary brand color, sidebar, main headings |
| **Dark Navy** | `#001028` | Hover states and deep surfaces |
| **Muted Gold** | `#D0A860` | Accents, highlights, active navigation |
| **Light Gold** | `#E5C383` | Subtitles, borders, delicate emblems |
| **Warm Ivory** | `#F0E8E0` | Card accents, soft highlights |
| **Ivory Background** | `#FAF7F2` | Subtle page background |
| **Charcoal** | `#252525` | High-contrast readable body text |
| **Muted Gray** | `#777777` | Metadata, subtitles, helper hints |

**Typography:**
- English: `Inter`
- Urdu: `Noto Nastaliq Urdu`

---

## Core Features & Workflow

1. **Centralized Administration:**
   - Create and manage multiple recruitment teams (Donation, Social Media, Graphic Design, Event Management, Public Relations).
   - Assign and reassign team leaders with strict access isolation.
   - Global dashboard with real-time KPI metrics (total teams, active pipelines, applications, approved volunteers).
   - Immutable Foundation Activity & Audit Log.

2. **Unique Public Joining Links (`/join/:slug`):**
   - Automatically derived and customizable URL slugs (e.g. `/join/donation-team`).
   - Applicants apply without needing an account.
   - Clean, mobile-first responsive layout with official foundation emblem.
   - Automated team assignment verified server-side.
   - Instant reference ID generation (e.g. `MJV-2026-8912`).
   - Courteous handling of inactive/unpublished team links.

3. **Dynamic Form Builder:**
   - Visual drag-and-drop / ordering interface for each team.
   - Supported Field Types: Short Text, Long Text, Email, Phone, Number, Dropdown, Radio, Checkboxes, Multiple Choice, Date, File Upload.
   - 16 Pre-configured default fields matching foundation requirements.
   - Live interactive preview with Desktop and Mobile smartphone frame toggles.
   - Form Versioning: Publishing creates immutable snapshots (`form_versions`), ensuring historical submissions preserve their original schema and answers.

4. **Team Leader Portal:**
   - Strict team isolation enforced: Leaders only access applications belonging to their assigned team(s).
   - Quick copy and sharing of team recruitment links.
   - Convenient 1-click candidate contact actions:
     - Direct Phone Call (`tel:`)
     - WhatsApp conversation with pre-filled greeting (`wa.me`)
     - Direct Email (`mailto:`)
   - Status pipeline management: `New` &rarr; `Under Review` &rarr; `Contacted` &rarr; `Approved` / `Rejected` / `On Hold`.
   - Private internal follow-up notes with author name and timestamp.
   - Full status modification audit history.

5. **Applicant Profile Downloads & Exports:**
   - **Official PDF Dossier:** Generates a professional A4 PDF dossier featuring the MAQAM-E-JOUD Foundation emblem, reference code, status badge, candidate profile, and dynamic form answers.
   - **Bulk Exports:** 1-click export of applications to Excel (`.xlsx`) and CSV formats.

---

## Demo Accounts & Evaluation Credentials

You can use the built-in **Quick Demo Switcher** button inside the sidebar or login screen, or sign in manually with:

| Role | Email | Password | Assigned Team |
|---|---|---|---|
| **Foundation Admin** | `admin@maqamejoud.org` | `admin123` | All Teams |
| **Team Leader** | `usman.leader@maqamejoud.org` | `leader123` | Donation & Welfare Team |
| **Team Leader** | `ayesha.leader@maqamejoud.org` | `leader123` | Social Media & Communications |
| **Team Leader** | `bilal.leader@maqamejoud.org` | `leader123` | Graphic Design & Media Team |

---

## Running the Application Locally

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Build for production
npm run build
```

The application runs at `http://localhost:3000`.

---

## Supabase Database Integration (Optional)

The application includes a zero-config local storage engine pre-populated with realistic teams, applications, and activity logs.

To connect your live Supabase cloud database:
1. Run `supabase/migrations/01_initial_schema.sql` in your Supabase SQL Editor.
2. Rename `.env.example` to `.env` and configure:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
