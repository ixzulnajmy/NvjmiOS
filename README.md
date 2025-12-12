# NvjmiOS 2.0

A personal Life Operating System designed to unify and simplify the management of money, life events, work, and documents. Built with a beautiful, opinionated UX inspired by Apple Notes, Linear, and Obsidian.

## Overview

NvjmiOS 2.0 is a full-stack application with a **"Sidebar OS"** layout pattern, providing a clean, desktop-first experience that works beautifully on all devices. The current implementation is **frontend-only** with typed mock data and clear extension points for backend integration.

### Core Philosophy

- **Opinionated UX**: Clean, minimal, "system UI" feeling with dark mode first
- **High-signal tracking**: Focus on important life events, not endless logging
- **Interconnected data**: Link transactions, events, tasks, and documents together
- **AI-ready**: Built with future AI insights and journaling assistance in mind

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for full type safety
- **Tailwind CSS** for styling
- **shadcn/ui** (Radix UI primitives) for components
- **Inter** font family
- **next-themes** for dark/light mode

## Project Structure

```
nvjmios2/
├── app/
│   ├── layout.tsx                 # Root layout with theme provider
│   ├── page.tsx                   # Dashboard page
│   ├── money/
│   │   └── transactions/
│   │       └── page.tsx           # Transactions list + detail
│   └── life/
│       └── events/
│           └── page.tsx           # LifeEvents timeline + detail
├── components/
│   ├── layout/
│   │   ├── app-shell.tsx          # 3-column responsive layout
│   │   ├── sidebar.tsx            # Module tree navigation
│   │   └── top-nav.tsx            # Top bar with theme toggle
│   ├── providers/
│   │   └── theme-provider.tsx     # next-themes wrapper
│   └── ui/
│       ├── page-header.tsx        # Reusable page header
│       ├── empty-state.tsx        # Empty state component
│       └── [shadcn components]    # Generated shadcn/ui components
└── lib/
    ├── types.ts                   # TypeScript type definitions
    ├── mock-data.ts               # Mock data for development
    └── utils.ts                   # Utility functions (cn, etc.)
```

## Module Structure

The application is organized into a hierarchical module tree:

### Money
- Transactions
- Expenses
- Wishlist
- Purchases
- BNPL (Buy Now Pay Later)
- Savings
- Debts

### Life
- LifeEvents (high-signal life moments)
- Health
- Food Log
- Habits
- Time Tracking

### Work
- Tasks
- Projects
- Knowledge
- Meetings

### Documents
- Salary Slips
- Bank Statements
- Agreements
- Receipts

### Other
- Dashboard (overview of all modules)
- Settings

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Key Features

### Responsive Layout

- **Desktop (≥1024px)**: 3-column layout with fixed sidebar, flexible middle content, and detail pane
- **Tablet**: Collapsible sidebar with horizontal split for middle/detail
- **Mobile**: Full-screen list view with sidebar drawer and detail slide-over

### Implemented Pages

#### 1. Dashboard (`/`)
- Overview cards for Money, Life, Work, and Documents
- Weekly spending/income summary
- Recent life events and active tasks
- "Today" panel in the right detail pane

#### 2. Money → Transactions (`/money/transactions`)
- Filterable transaction table (This Week, This Month, All)
- Search functionality
- Click-to-select transaction detail view
- Color-coded amounts (red for expenses, green for income)
- Linked items section (connects to LifeEvents, Documents, etc.)
- Insights placeholder for future AI features

#### 3. Life → LifeEvents (`/life/events`)
- Vertical timeline view of life events
- Filter by event type (Work, Health, Money, Relationship, Travel, etc.)
- Importance rating (1-5 stars)
- Event detail form with description, notes, and reflection
- Linked transactions and tasks
- Reflection area for journaling (AI-ready)

### Dark Mode

- Default: Dark mode
- Toggle available in top navigation bar
- Persists across sessions
- Smooth transitions between themes

## Data Layer (TODO)

Currently using mock data from `lib/mock-data.ts`. Future backend integration should:

1. **Replace mock data with API calls**
   - `mockTransactions` → `GET /api/transactions`
   - `mockLifeEvents` → `GET /api/life-events`
   - `mockTasks` → `GET /api/tasks`

2. **Implement CRUD operations**
   - Create, update, delete for all entity types
   - Optimistic UI updates with React Query or SWR

3. **Add authentication**
   - User login/logout
   - Protected routes
   - User-scoped data

4. **Implement linking system**
   - Cross-reference transactions, events, tasks, documents
   - Bi-directional linking
   - Link suggestions based on date/content

5. **AI Features**
   - Transaction categorization
   - Spending insights
   - LifeEvent reflection prompts
   - Automatic event importance scoring

## Architecture Decisions

### Why Client Components?

Pages like Transactions and LifeEvents use `"use client"` because they:
- Manage local UI state (selected item, filters)
- Respond to user interactions (clicks, selections)
- Will integrate with real-time features later

### Why shadcn/ui?

- Accessible, high-quality Radix primitives
- Full code ownership (no package dependency)
- Easy to customize and extend
- Great TypeScript support

### Why Mock Data?

The mock data approach allows:
- Rapid frontend development
- Type-safe contracts for future APIs
- Easy testing and demos
- Clear TODOs for backend integration

## Styling Guidelines

- **Colors**: Semantic color usage (red for expenses, green for income)
- **Typography**: Inter font for clean, modern feel
- **Spacing**: Generous padding and consistent gaps
- **Borders**: Subtle borders with soft shadows
- **States**: Clear hover, active, and selected states
- **Animations**: Minimal, purposeful transitions

## Future Enhancements

### Phase 2: Backend Integration
- [ ] Set up API routes (Next.js API or separate backend)
- [ ] Database schema (PostgreSQL recommended)
- [ ] Authentication (NextAuth.js or Clerk)
- [ ] Real-time updates (WebSockets or Server-Sent Events)

### Phase 3: Advanced Features
- [ ] AI-powered insights and categorization
- [ ] Document OCR and parsing
- [ ] Budget tracking and forecasting
- [ ] Habit tracking with streak visualization
- [ ] Time tracking integration
- [ ] Mobile app (React Native or PWA)

### Phase 4: Collaboration
- [ ] Shared budgets (for households)
- [ ] Multi-user support
- [ ] Export/import data
- [ ] Third-party integrations (banks, calendars)

## Contributing

This is a personal project, but feedback and suggestions are welcome!

## License

Private project - All rights reserved.
