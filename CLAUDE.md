# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

247Electrician is a local electrician business website serving the Black Country, Birmingham Central & North, Walsall, and Cannock areas (UK). Built with React, TypeScript, Vite, and Tailwind CSS using shadcn/ui components. The site emphasizes 24/7 emergency services with prominent call-to-action elements.

## Important Business Details

- **Brand Name**: 247Electrician (displayed as "247" in emergency red + "Electrician" in primary blue)
- **Service Areas**: Black Country, Birmingham Central & North, Walsall, Cannock, Dudley, West Bromwich, Wolverhampton
- **Accreditation**: NAPIT Approved (NOT NICEIC - always use NAPIT)
- **Operated by**: ANP Electrical Ltd
- **Domain**: www.247electrician.uk

## PM2 Deployment

- **Production PM2 process**: `247electrician` (ID: 8)
- **Port**: 8084
- **Serves**: Static files from `dist/` directory
- **CRITICAL**: Only restart `247electrician` PM2 process. Do NOT touch kelvinlee or aigentis processes!

```bash
# Rebuild and restart production
npm run build && pm2 restart 247electrician
```

## Commands

```bash
npm install        # Install dependencies (or use bun)
npm run dev        # Start dev server on port 8080
npm run build      # Production build
npm run build:dev  # Development build
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

## Architecture

### Tech Stack
- **Vite** with SWC for React
- **React Router DOM** for client-side routing
- **TanStack Query** for data fetching
- **shadcn/ui** (Radix primitives) for UI components
- **Tailwind CSS** with CSS variables for theming

### Path Aliases
- `@/*` maps to `./src/*` (configured in tsconfig.json and vite.config.ts)

### Project Structure
```
src/
├── App.tsx           # Root component with React Router setup
├── main.tsx          # Entry point
├── index.css         # Tailwind + CSS custom properties (design tokens)
├── pages/            # Route page components
├── components/       # Shared components
│   └── ui/           # shadcn/ui primitives
├── hooks/            # Custom React hooks
└── lib/              # Utilities (cn helper)

public/
└── images/           # Service images (16:9 aspect ratio)
```

### Services Offered
1. Emergency Callouts
2. Fault Finding & Repairs
3. Fuse Board Upgrades
4. Full & Partial Rewiring
5. Lighting Installation
6. Socket Installation
7. EV Charger Installation
8. EICR Certificates
9. Solar Installation
10. Heat Source Installation

### Routing
Routes defined in `src/App.tsx`:
- `/` - Index (home page)
- `/about` - About Us
- `/services` - Services
- `/emergency` - Emergency services
- `/service-areas` - Coverage map
- `/gallery` - Gallery
- `/blog` - Blog
- `/contact` - Contact form
- `*` - NotFound (404)

### Design System
All color tokens defined as HSL CSS variables in `src/index.css`:
- `--primary` - Navy blue (brand color)
- `--emergency` - Red (emergency CTAs)
- `--secondary` - Lighter blue (hovers)

Custom Tailwind colors `emergency`, `navy`, `red` extend the default palette in `tailwind.config.ts`.

### Adding shadcn/ui Components
The project uses shadcn/ui with configuration in `components.json`. New components install to `src/components/ui/`.

### Service Card Images
Service images should be placed in `public/images/` with 16:9 aspect ratio:
- emergency-callouts.jpg
- fault-finding.jpg
- fuse-board.jpg
- rewiring.jpg
- lighting.jpg
- sockets.jpg
- ev-charger.jpg
- eicr.jpg
- solar.jpg
- heat-source.jpg

If images are missing or fail to load, a fallback icon overlay is displayed.
