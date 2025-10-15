# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application using React 19, TypeScript, and Tailwind CSS 4. The project uses Turbopack for both development and production builds.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production with Turbopack
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Project Structure

This project uses Next.js App Router with the following structure:

- `src/app/` - App Router pages and layouts
  - `page.tsx` - Home page component
  - `layout.tsx` - Root layout with Geist fonts and global styles
  - `globals.css` - Global CSS with Tailwind imports and CSS variables

- `public/` - Static assets served from root

- Configuration files at project root:
  - `next.config.ts` - Next.js configuration
  - `tsconfig.json` - TypeScript configuration with `@/*` path alias mapping to `./src/*`
  - `eslint.config.mjs` - ESLint flat config using next/core-web-vitals and next/typescript
  - `postcss.config.mjs` - PostCSS configuration for Tailwind

## Key Architecture Details

**Path Aliases**: Import from `src/*` using the `@/*` alias (e.g., `import Foo from '@/app/components/Foo'`)

**Styling**: Tailwind CSS 4 with PostCSS. CSS variables defined in `globals.css` for theming:
- `--background` and `--foreground` for light/dark mode
- `--font-geist-sans` and `--font-geist-mono` for custom fonts
- Uses `@theme inline` directive for Tailwind theme integration

**Fonts**: Uses Next.js font optimization with Geist and Geist Mono from Google Fonts, configured in `src/app/layout.tsx`

**TypeScript**: Strict mode enabled, targeting ES2017, with module resolution set to "bundler"

**Build Tool**: Uses Turbopack (Next.js 15's default bundler) for faster builds and hot reloading

## Application Overview

This is a real estate property management application that allows users to register, edit, delete, and search for properties. The application uses Supabase for backend services including authentication, database, and file storage.

**Key Features**:
- Property CRUD operations (Create, Read, Update, Delete)
- PDF import for property data
- Search and filter functionality
- User authentication with role-based access control (Admin, Editor, Viewer)
- Image gallery and map integration
- Responsive design with animations

## Database Schema

**Table Naming Convention**: All tables use the `hn_pi_` prefix

**Core Tables**:
- `hn_pi_profiles` - User profiles with role-based access (admin/editor/viewer)
- `hn_pi_properties` - Property information (name, type, price, location, etc.)
- `hn_pi_property_images` - Property photos with display ordering
- `hn_pi_property_amenities` - Property amenities (air conditioning, parking, etc.)
- `hn_pi_favorites` - User favorite properties
- `hn_pi_saved_searches` - Saved search criteria
- `hn_pi_view_history` - Property view history

**Database Setup**:
- SQL migration files are in `docs/migrations/`
- Run `01_initial_schema.sql` first to create tables and indexes
- Run `02_rls_policies.sql` second to set up Row Level Security policies
- Complete setup guide available at `docs/DATABASE_SETUP.md`

**Row Level Security (RLS)**:
- Public: Can view published properties
- Authenticated users: Can view own properties and data
- Editors: Can create/edit/delete own properties
- Admins: Full access to all data

## Supabase Configuration

**Environment Variables** (in `.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Storage Buckets**:
- `property-images` - Public bucket for property photos (max 10MB per file)
- `property-pdfs` - Private bucket for property PDFs (max 20MB per file)

## Documentation

- `docs/PRD.md` - Product Requirements Document with detailed specifications
- `docs/DATABASE_SETUP.md` - Complete database setup guide
- `docs/migrations/` - SQL migration files for database schema

## Development Workflow

1. Set up Supabase project and run migrations
2. Configure environment variables
3. Install dependencies: `npm install`
4. Run development server: `npm run dev`
5. Access application at `http://localhost:3000`
