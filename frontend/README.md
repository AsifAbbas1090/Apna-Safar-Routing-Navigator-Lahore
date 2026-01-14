# Apna Safar - Public Transport Navigation for Lahore

A modern, map-first SaaS MVP for navigating Lahore's public transport system.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** with custom olive green theme
- **shadcn/ui** components
- **Zustand** for state management
- **Mapbox GL JS** for maps
- **React Hook Form + Zod** for form validation
- **Framer Motion** for animations

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Mapbox token (optional for development):
Create a `.env.local` file:
```
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

If no token is provided, the app will use a placeholder token (maps may not work properly).

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app
  /page.tsx            → Landing Page
  /plan/page.tsx       → Route Planner
  /live/page.tsx       → Live Navigation
  /saved/page.tsx      → Saved Routes
  /dashboard/page.tsx  → User Dashboard
  /pricing/page.tsx    → Pricing Page
  /login/page.tsx      → Login Page
/components
  Header.tsx           → Global header
  Footer.tsx           → Global footer
  MapCanvas.tsx        → Mapbox wrapper
  LocationInput.tsx    → Location input with GPS
  RouteCard.tsx        → Route display card
  RoutePreferences.tsx → Route preference toggles
  ProgressStepper.tsx  → Navigation progress
  SavedRouteCard.tsx   → Saved route card
  TransportBadge.tsx   → Transport type badge
/store
  routeStore.ts        → Zustand route state
/lib
  mockData.ts          → Mock route data
  utils.ts             → Utility functions
```

## Features

- ✅ Landing page with hero and features
- ✅ Route planning with multiple stops
- ✅ Live navigation with progress tracking
- ✅ Saved routes management
- ✅ User dashboard with statistics
- ✅ Pricing page
- ✅ Login page with form validation
- ✅ Responsive design
- ✅ Map integration (Mapbox)
- ✅ State management (Zustand)

## Design System

- **Primary Color**: Olive Green (#6B8E23)
- **Dark Olive**: #3A4F1B
- **Black**: #0B0B0B
- **White**: #FFFFFF
- **Typography**: Inter font family

## Notes

- This is a **frontend-only MVP**. All data is mocked.
- Backend integration points are marked with comments in the code.
- Mapbox token is required for full map functionality.
- All forms include validation but don't submit to a backend yet.

## Next Steps

1. Connect to backend API for route planning
2. Implement real geocoding for addresses
3. Add real-time transit data integration
4. Implement authentication
5. Add offline map support
6. Implement route saving functionality

## License

MIT

