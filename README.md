# SparkIRL — UI Prototype

Interactive mobile-first prototype of the SparkIRL app built with Next.js 15, React 19, TypeScript, Tailwind CSS, and shadcn/ui.

## Screens Implemented

| Screen | Route | Description |
|---|---|---|
| **Discover** | `/` | Event feed with filter chips, event cards with attendee avatars and verified counts |
| **Event Detail** | `/event/[id]` | Hero image, host card, "Who's going", about, location map, sticky CTA |
| **Connections** | `/connections` | Post-event "Missed Connections" pools with expiry countdown |
| **Attendee Grid** | `/connections` (tap pool) | Grid of event attendees with Connect/Skip actions + mutual match modal |
| **Going** | `/going` | Upcoming & past events with QR tickets |
| **Profile** | `/profile` | User profile, stats, interests, preferences, verification badge |

## Design System

- **Palette:** Ember `#FF5A3C`, Ink `#0E0F12`, Cream `#FAF6F0`, Mint `#7DD3B7`, Plum `#3F2A56`
- **Typography:** Inter (Google Fonts)
- **Components:** shadcn/ui (Button, Badge, Avatar, Card, Switch, Sheet, Dialog)
- **Animations:** Framer Motion (page transitions, card animations, mutual match modal)
- **Layout:** Mobile-first, max-width 448px centered, bottom navigation

## Run Locally

```bash
cd sparkirl-prototype
npm install
npm run dev
# Open http://localhost:3000
```

## Screenshots

See `screenshots/` folder for full-page captures of all screens.
