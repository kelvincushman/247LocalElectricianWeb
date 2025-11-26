# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

247LocalElectrician is a local electrician business website for the West Midlands (UK). Built with React, TypeScript, Vite, and Tailwind CSS using shadcn/ui components. The site emphasizes 24/7 emergency services with prominent call-to-action elements.

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
```

### Routing
Routes defined in `src/App.tsx`:
- `/` - Index (home page)
- `/emergency` - Emergency services
- `/service-areas` - Coverage map
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
