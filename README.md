# NvjmiOS - Personal Life Command Center

> Personal JARVIS but I'm the Iron Man.

A comprehensive Progressive Web App (PWA) designed to help Muhammad Izzul Najmi achieve his life goals: clear debt by Dec 2026, save RM 30,000 for his wedding, and strengthen his spiritual discipline.

## Mission

1. Clear RM 7,361.88 debt by Dec 2026
2. Save RM 30,000 for wedding by Dec 2026
3. Strengthen ibadah (prayers, Quran, jemaah)
4. Marry at Elza Manor, Sabah + KL ballroom reception
5. Honor my father's sacrifices

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL + Auth)
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **UI**: Tailwind CSS + shadcn/ui
- **PWA**: next-pwa
- **Deployment**: Vercel

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
3. Add your Supabase credentials to `.env.local`
4. Run the database schema:
   - Go to Supabase Dashboard > SQL Editor
   - Copy and paste contents of `supabase/schema.sql`
   - Click "Run"

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
npm run build
npm start
```

## Features

### Dashboard
- Wedding countdown (engagement & nikah dates)
- Wedding fund progress tracker
- Debt summary with upcoming payments
- Today's prayer status (5 daily prayers)
- Today's spending vs budget
- Quick action buttons

### Finance Brain
- Debt management (track all debts with payoff calculator)
- Expense tracking with categories
- Budget monitoring
- Payment history
- Debt-free date projections

### Ibadah Brain
- 5 daily prayer tracker (on time / late / missed)
- Jemaah frequency tracking
- Quran daily pages log
- Sedekah (charity) tracking
- Weekly spiritual stats

### Time Brain
- Continuous time tracking by category
- 24-hour activity ring visualization
- Weekly patterns and insights
- Productivity score

### Task Brain
- Bullet Journal (BUJO) style task management
- Daily, Someday, Work, Personal lists
- Priority levels
- Completion tracking

### Marriage Readiness Score
- Holistic score (0-100) based on:
  - Financial health (40%)
  - Spiritual health (40%)
  - Discipline & habits (20%)
- Actionable insights to improve score

## Project Structure

```
/app
  /(auth)           - Login & signup pages
  /(dashboard)      - Main dashboard & mini apps
    /finance        - Debts, expenses, budget
    /time           - Time tracking
    /tasks          - BUJO task management
    /ibadah         - Prayers, Quran, sedekah
/components
  /ui               - shadcn/ui components
  /dashboard        - Dashboard widgets
/lib                - Utilities & Supabase clients
/store              - Zustand state stores
/schemas            - Zod validation schemas
/types              - TypeScript types
/supabase           - Database schema
```

## Deployment

### Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

The app will be available as a PWA that can be installed on iOS/Android home screens.

## Development Roadmap

### Phase 1 (Week 1-4) - MVP ✅
- [x] Project setup & authentication
- [x] Database schema & Supabase integration
- [x] Dashboard with core widgets
- [x] Navigation structure
- [ ] Finance: Debts & Expenses (in progress)
- [ ] Ibadah: Prayer tracker
- [ ] Basic functionality for all mini apps

### Phase 2 (Week 5-8) - Full Features
- [ ] Time tracker with continuous tracking
- [ ] Task manager (BUJO style)
- [ ] Marriage Readiness Score
- [ ] Charts & visualizations
- [ ] Weekly PDF reports
- [ ] PWA optimization

### Phase 3 (Month 3+) - Polish
- [ ] Animations (Framer Motion)
- [ ] Advanced insights & AI analysis
- [ ] Notifications
- [ ] iOS-like polish

## License

Personal project - All rights reserved.

---

Built with discipline, for a purpose.

جَزَاكَ ٱللَّٰهُ خَيْرًا
