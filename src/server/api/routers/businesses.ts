import { z } from 'zod'
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from '@/server/api/trpc'
import {
  createRegisterBusinessUseCase,
  createVerifyBusinessUseCase,
  createListBusinessesUseCase,
  createGetBusinessProfileUseCase,
} from '@/infrastructure/config/container'
import { mapDomainError } from '@/server/api/helpers/mapDomainError'

export const businessesRouter = createTRPCRouter({
  register: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100),
        description: z.string().max(1000).optional(),
        address: z.string().max(200).optional(),
        city: z.string().max(100).optional(),
        postalCode: z.string().max(10).optional(),
        province: z.string().max(100).optional(),
        phone: z.string().max(20).optional(),
        website: z.string().url().optional(),
        categoryIds: z.array(z.string()).min(1, 'Select at least one category'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const useCase = createRegisterBusinessUseCase()
        return await useCase.execute({
          userId: ctx.session.user.id,
          ...input,
        })
      } catch (error) {
        mapDomainError(error)
      }
    }),

  verify: adminProcedure
    .input(
      z.object({
        businessId: z.string(),
        approve: z.boolean(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const useCase = createVerifyBusinessUseCase()
        return await useCase.execute(input)
      } catch (error) {
        mapDomainError(error)
      }
    }),

  list: adminProcedure
    .input(
      z.object({
        status: z.enum(['PENDING', 'VERIFIED', 'SUSPENDED', 'REJECTED']).optional(),
      }).optional(),
    )
    .query(async ({ input }) => {
      const useCase = createListBusinessesUseCase()
      return await useCase.execute(input?.status)
    }),

  getMyBusiness: protectedProcedure.query(async ({ ctx }) => {
    const useCase = createGetBusinessProfileUseCase()
    return await useCase.execute({ by: 'userId', userId: ctx.session.user.id })
  }),

  // Public: list all verified businesses with categories
  listVerified: publicProcedure.query(async ({ ctx }) => {
    const businesses = await ctx.db.business.findMany({
      where: { status: 'VERIFIED' },
      include: {
        businessCategories: { include: { category: true } },
        _count: { select: { vouchers: { where: { status: 'ACTIVE' } } } },
      },
      orderBy: { name: 'asc' },
    })
    return businesses.map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      city: b.city,
      province: b.province,
      phone: b.phone,
      website: b.website,
      categories: b.businessCategories.map((bc) => bc.category.slug),
      categoryNames: b.businessCategories.map((bc) => bc.category.name),
      activeVoucherCount: b._count.vouchers,
    }))
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const useCase = createGetBusinessProfileUseCase()
        return await useCase.execute({ by: 'id', id: input.id })
      } catch (error) {
        mapDomainError(error)
      }
    }),
})
