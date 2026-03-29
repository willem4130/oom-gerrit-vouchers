# Plattelandsbon (Oom Gerrit)

Dutch rural tourism voucher platform connecting businesses with consumers, featuring AI-powered recommendations and competitor analysis.

## Project Status

**Current Phase**: Week 1 - Foundation Setup ✅

**Next Steps**: Week 2 - Core Models & Auth

## What's Been Done

### Week 1 Completed Tasks

- ✅ Cloned Simplicate Automations template
- ✅ Cleaned out unnecessary Simplicate-specific code
- ✅ Updated environment variables
- ✅ Created database schema for Oom Gerrit
  - User roles (CONSUMER, BUSINESS, ADMIN)
  - Business & Category models
  - Voucher system with claims & redemptions
  - Competitor scraping infrastructure
  - AI recommendations tracking
- ✅ Created seed script with test data
- ✅ Updated package.json metadata

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth v5
- **API**: tRPC v11
- **UI**: Tailwind CSS 4 + shadcn/ui
- **Email**: Resend (optional)
- **AI**: OpenAI API (for recommendations)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database running locally or remotely

### Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Set up the database**:
   ```bash
   # Create and migrate database
   npm run db:push

   # Seed with test data
   npm run db:seed
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to http://localhost:3000

### Database Commands

```bash
npm run db:generate    # Generate Prisma Client
npm run db:push        # Push schema to database (dev)
npm run db:migrate     # Create migration (production)
npm run db:seed        # Seed database with test data
npm run db:reset       # Reset database (warning: deletes all data)
npm run db:studio      # Open Prisma Studio (database GUI)
```

### Test Accounts

After seeding the database, you can use these test accounts:

- **Admin**: `admin@oomgerrit.nl`
- **Business Users**:
  - `contact@degroeneweide.nl` (De Groene Weide - Restaurant)
  - `info@gezellighoekje.nl` ('t Gezellige Hoekje - Bar)
  - `info@wellnessretreat.nl` (Wellness Retreat Limburg - Wellness)
- **Consumer**: `test@example.nl`

_Note: NextAuth needs to be configured for password authentication_

## Project Structure

```
oomgerrit/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts            # Seed script
├── src/
│   ├── app/               # Next.js app directory
│   │   ├── (auth)/        # Auth pages
│   │   ├── admin/         # Admin dashboard
│   │   └── api/           # API routes
│   ├── components/        # React components
│   │   ├── ui/            # shadcn/ui components
│   │   └── admin/         # Admin components
│   ├── lib/               # Utilities
│   └── server/            # Server-side code
│       └── api/           # tRPC API
│           └── routers/   # API routers
├── CLAUDE.md              # Claude Code instructions
├── PROJECT_PLAN.md        # 8-9 week implementation plan
└── README.md              # This file
```

## Next Steps (Week 2)

According to `PROJECT_PLAN.md`, Week 2 focuses on:

1. **Extend User model** with role-based permissions
2. **Build tRPC routers**:
   - `auth.ts` - Registration and role management
   - `categories.ts` - List categories
   - `businesses.ts` - CRUD for business profiles
3. **Create business registration flow**:
   - `/register/business` page
   - Business profile creation
   - Email verification
4. **Admin business verification**:
   - `/admin/businesses` page
   - Verification workflow
   - Email notifications

## Development Workflow

### Code Quality (Zero Tolerance)

After editing ANY file, run:

```bash
npm run lint        # Check for linting errors
npm run typecheck   # Check TypeScript types
```

Fix ALL errors/warnings before continuing.

### Committing Changes

Use the custom slash command:

```bash
/commit
```

This will run quality checks, create a commit, and push to the repository.

## Reference Materials

- **Wireframes**: See `/Users/willemvandenberg/Dev/oomgerrit/input/`
- **Base Template**: `/Users/willemvandenberg/Dev/simplicate-automations/`
- **Implementation Plan**: `PROJECT_PLAN.md`

## Links

- **GitHub**: https://github.com/willem4130/plattelandsbon
- **Planning Docs**: See `CLAUDE.md` and `PROJECT_PLAN.md`

## License

MIT
