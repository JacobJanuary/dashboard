# Project Evolution

## dashboard (SparkIRL / Swyby UI)

### Overview

The dashboard repository contains the Next.js 15 mobile-first prototype for Swyby's
admin and consumer interfaces. Originally developed as "SparkIRL," it serves as the
primary UI layer for the Swyby ecosystem.

### Architecture

- **Framework:** Next.js 15 with React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom design system
- **Design Tokens:** Ember (accent), Ink (background), Cream (surfaces)
- **Animation:** Framer Motion
- **Components:** shadcn/ui

### Development Timeline

#### May 2026 — Admin Route Optimization Sprint

A focused two-week effort to simplify and optimize the admin dashboard:

**Week 1 (May 17–18):**
- Simplified owner-facing screens (calendar, requests, places, today)
- Simplified organizer money screen
- Cleaned up mixed copy issues

**Week 2 (May 19–20):**
- Added comprehensive admin route QA automation
- Implemented canonical routing for organizer sections
- Added legacy route redirects to prevent 404s
- Localized all public-facing copy (tickets, checkout, events)
- Simplified moderator screens (events, claims, reports, chat, queue)

**Key principle:** Every screen simplification reduced cognitive load for admins
while maintaining full functionality.

### Screen Inventory

The prototype includes 6+ core screens:
1. **Discover** — Activity discovery and browsing
2. **Event Detail** — Individual event view with booking
3. **Connections** — Social features and networking
4. **Attendee Grid** — Who's going to events
5. **Going** — User's planned activities
6. **Profile** — User settings and preferences

Plus admin screens for organizers, moderators, and venue owners.

---

*This project represents the UI evolution from early prototypes to a production-ready*
*design system. The commit history reflects a methodical approach to UI simplification.*
