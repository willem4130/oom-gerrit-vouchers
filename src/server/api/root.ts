import { createTRPCRouter } from '@/server/api/trpc'
import { usersRouter } from '@/server/api/routers/users'
import { businessesRouter } from '@/server/api/routers/businesses'
import { categoriesRouter } from '@/server/api/routers/categories'
import { vouchersRouter } from '@/server/api/routers/vouchers'
import { claimsRouter } from '@/server/api/routers/claims'

export const appRouter = createTRPCRouter({
  users: usersRouter,
  businesses: businessesRouter,
  categories: categoriesRouter,
  vouchers: vouchersRouter,
  claims: claimsRouter,
})

export type AppRouter = typeof appRouter
