import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { db } from '@/infrastructure/db/prisma'
import type { UserRole } from '@/domain/value-objects/UserRole'

/**
 * Session shape — will be populated by NextAuth when configured.
 * For now, extracted from a custom header or cookie for development.
 */
interface Session {
  user: {
    id: string
    email: string
    name: string | null
    role: UserRole
  }
}

/**
 * Creates the context for incoming requests
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  // TODO: Replace with NextAuth session lookup
  // const session = await auth()
  const session = process.env.NODE_ENV === 'development'
    ? await getDevSession(opts.headers)
    : null

  return {
    db,
    session,
    ...opts,
  }
}

/**
 * Temporary dev session resolver — reads user ID from x-user-id header
 * and looks up the user in the database. Falls back to admin user
 * when no header is present (dev convenience). Replace with NextAuth.
 */
async function getDevSession(headers: Headers): Promise<Session | null> {
  const userId = headers.get('x-user-id')

  // Look up by header, or fall back to first business user for dev convenience
  const user = userId
    ? await db.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true },
      })
    : await db.user.findFirst({
        where: { role: 'BUSINESS' },
        select: { id: true, email: true, name: true, role: true },
      })

  if (!user) return null

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
    },
  }
}

/**
 * Initialize tRPC
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory

/**
 * Rate limiting middleware — applied to mutation procedures
 */
const rateLimitMiddleware = t.middleware(async ({ ctx, next }) => {
  // Dynamic import to avoid breaking if Redis not configured
  const { strictRatelimit } = await import('@/lib/rate-limit')
  if (strictRatelimit) {
    const identifier = ctx.session?.user?.id ?? ctx.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await strictRatelimit.limit(identifier)
    if (!success) {
      throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded. Try again later.' })
    }
  }
  return next()
})

/**
 * Public procedure — no auth required
 */
export const publicProcedure = t.procedure

/**
 * Protected procedure — requires authenticated session
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' })
  }
  return next({
    ctx: {
      session: ctx.session,
    },
  })
})

/**
 * Admin procedure — requires ADMIN role
 */
export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' })
  }
  if (ctx.session.user.role !== 'ADMIN' && process.env.NODE_ENV !== 'development') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' })
  }
  return next({
    ctx: {
      session: ctx.session,
    },
  })
})

/**
 * Business procedure — requires BUSINESS role
 */
export const businessProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' })
  }
  if (ctx.session.user.role !== 'BUSINESS' && process.env.NODE_ENV !== 'development') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Business access required' })
  }
  return next({
    ctx: {
      session: ctx.session,
    },
  })
})

/**
 * Rate-limited business procedure — for mutations (create, submit)
 */
export const rateLimitedBusinessProcedure = businessProcedure.use(rateLimitMiddleware)

/**
 * Rate-limited protected procedure — for sensitive mutations
 */
export const rateLimitedProtectedProcedure = protectedProcedure.use(rateLimitMiddleware)
