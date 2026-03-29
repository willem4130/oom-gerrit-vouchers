# Oom Gerrit Voucher System

Dutch rural tourism voucher platform connecting businesses with consumers, featuring AI-powered recommendations and competitor analysis.

## Architecture: Onion Architecture (Strict)

ALL code follows onion architecture with strict modularity. Dependencies ALWAYS point inward.

```
Presentation (app/, components/) → Server (tRPC routers) → Application (use cases) → Domain (entities)
                                                                    ↑
                                          Infrastructure (Prisma repos, AI, email, scraping)
```

### Layers

**Domain** (`src/domain/`) — ZERO external dependencies
- `entities/` — Business objects with protected constructors + `static create()`/`fromProps()` factories
- `value-objects/` — Immutable typed values (ClaimCode, VoucherStatus, DiscountType)
- `repositories/` — INTERFACES only (IVoucherRepository, IClaimRepository) — all methods accept optional `tx?: TransactionContext`
- `types/` — TransactionContext (opaque), PaginationOptions, ITransactionManager
- `services/` — Pure domain logic (VoucherValidationService, FraudDetectionService)
- `errors/` — Domain-specific errors

**Application** (`src/application/`) — Orchestrates domain, no framework deps
- `interfaces/` — `IUseCase<TInput, TOutput>` generic interface
- `use-cases/` — One class per operation, all implement `IUseCase`
- `dtos/` — Data transfer objects for layer boundaries
- `mappers/` — Entity <-> DTO conversions

**Infrastructure** (`src/infrastructure/`) — Framework/external deps live here
- `repositories/` — Prisma implementations extending `BaseRepository<TEntity, TPrismaRecord>`
- `services/PrismaTransactionManager.ts` — implements `ITransactionManager` for cross-repo transactions
- `services/ai/` — Anthropic API integration
- `services/email/` — Resend + react-email templates
- `services/scraping/` — Competitor scrapers (Groupon, SocialDeal, WeekendjeWeg)
- `services/storage/` — Vercel Blob
- `services/cache/` — Upstash Redis
- `config/container.ts` — Dependency wiring (manual factory functions)

**Server** (`src/server/api/`) — Thin tRPC layer
- Routers call use cases, nothing else
- One router per domain (vouchers, claims, businesses, browse, recommendations, admin)

**Presentation** (`src/app/`, `src/components/`)
- Next.js App Router pages — render only
- React components — no business logic

### Key Patterns

**Entity creation:**
```typescript
// New entity (use cases/domain services):
const business = Business.create(props)
// Reconstitution from DB (infrastructure repos):
const business = Business.fromProps(props)
// Direct `new Entity()` is forbidden (protected constructor)
```

**Use case signature:**
```typescript
class RegisterBusinessUseCase implements IUseCase<BusinessRegistrationDTO, BusinessResponseDTO> {
  constructor(private businessRepo: IBusinessRepository) {}
  async execute(input: BusinessRegistrationDTO): Promise<BusinessResponseDTO> { ... }
}
```

**Repository with transactions:**
```typescript
// All repo methods accept optional tx:
findById(id: string, tx?: TransactionContext): Promise<Entity | null>
// Transaction usage:
await transactionManager.run(async (tx) => {
  await voucherRepo.incrementClaimCount(voucherId, tx)
  await claimRepo.create(claimData, tx)
})
```

**BaseRepository (infrastructure):**
```typescript
class PrismaBusinessRepo extends BaseRepository<Business, PrismaRecord> implements IBusinessRepository {
  protected toDomain(record: PrismaRecord): Business { return Business.fromProps(...) }
  // Uses this.getClient(tx), this.mapOrNull(), this.mapMany()
}
```

### Rules
- Domain layer imports NOTHING from other layers
- Entities have protected constructors — use `create()` or `fromProps()`
- All use cases implement `IUseCase<TInput, TOutput>`
- All Prisma repos extend `BaseRepository` and accept `tx?: TransactionContext`
- tRPC routers are thin: validate input, call use case, return result
- Prisma is NEVER imported outside `src/infrastructure/`
- Use cases depend on repository interfaces, not implementations
- Components never call Prisma or use cases directly

## Tech Stack

Next.js 16, React 19, TypeScript 5.9, PostgreSQL, Prisma 6, NextAuth v5, tRPC v11, Tailwind CSS 4, shadcn/ui, GSAP + @gsap/react (scroll animations), Anthropic AI SDK, Resend, Vercel Blob, Upstash Redis

See `RESEARCH.md` for validated versions and configuration details.

## File Organization

- tRPC routers → `src/server/api/routers/`, one per domain
- Use cases → `src/application/use-cases/`, grouped by domain
- Use case interface → `src/application/interfaces/IUseCase.ts`
- Domain entities → `src/domain/entities/`
- Domain types → `src/domain/types/` (TransactionContext, PaginationOptions)
- Repository interfaces → `src/domain/repositories/`
- Repository implementations → `src/infrastructure/repositories/`
- Base repository → `src/infrastructure/repositories/BaseRepository.ts`
- Components → `src/components/`, organized by feature
- UI components → `src/components/ui/` (shadcn)
- Shared utilities → `src/lib/`
- Static images → `public/images/`
- Database schema → `prisma/schema.prisma`

### Modularity Principles
- Single responsibility per file
- Clear, descriptive file names
- Group related functionality by domain
- No monolithic files
- Every new feature must respect layer boundaries

## Code Quality — Zero Tolerance

After editing ANY file, run:

```bash
npm run lint
npm run typecheck
```

Fix ALL errors/warnings before continuing.

If changes require server restart:
1. Restart: `npm run dev`
2. Read server output/logs
3. Fix ALL warnings/errors

## Design System

**Brand colors** (globals.css CSS variables):
- Primary: Meadow green `HSL(142, 45%, 32%)` — nature/rural
- Accent: Harvest amber `HSL(36, 80%, 94%)` — warmth/gezellig

**CSS utilities** (globals.css `@layer utilities`):
- `.glass` — Glassmorphism: `bg-white/70 backdrop-blur-md border-white/30 shadow-xl`
- `.glass-subtle` — Lighter glass variant
- `.glossy-card` — Glass card with hover shadow transition
- `.glossy-btn` — Gradient white button with shadow

**Animations** (GSAP + ScrollTrigger):
- Landing page uses `useGSAP` hook with `gsap.fromTo()` + `autoAlpha` for scroll reveals
- Hero image reveal triggered via `onLoad` callback (waits for image to load)
- Guard `gsap.registerPlugin()` with `typeof window !== 'undefined'` for SSR
- Use `data-*` attributes for animation targets (not CSS classes — avoids conflicts)
- Use `autoAlpha` instead of `opacity` (handles `visibility` too)
- Avoid `transition-all` on animated elements — use specific properties (`transition-shadow`, `transition-transform`)

**Images**: Unsplash (free commercial license), stored in `public/images/`

## Seed Data

Realistic Achterhoek businesses in `prisma/seed-data/achterhoek.ts`:
- 16 real businesses (restaurants, bars, wellness, accommodations, activities)
- 47 vouchers with researched pricing from actual menus/websites
- Cities: Winterswijk, Doetinchem, Zutphen, Groenlo, Ruurlo, Haarlo, Braamt, Laren
- Re-seed: `npx tsx prisma/seed.ts` (clears and re-creates all data)

## Dev Auth

NextAuth is NOT wired yet. Dev auth bypass in `src/server/api/trpc.ts`:
- Auto-logs in as first BUSINESS user (no header needed)
- Override with `x-user-id` header to log in as specific user
- Role checks (admin/business) are bypassed in `NODE_ENV=development`
- All pages accessible without auth in dev mode

## Branding

- **Tagline**: "De beste tips van 't platteland"
- **Region**: Achterhoek (Gelderland), not generic "platteland"
- **Tone**: Warm, gezellig, "je/jij" — never corporate

## Project Status

**Current Phase**: Week 3 complete, landing page done (March 2026)
**References**: `PROJECT_PLAN.md` (implementation roadmap), `RESEARCH.md` (validated stack)
