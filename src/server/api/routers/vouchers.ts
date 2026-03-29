import { z } from 'zod'
import {
  createTRPCRouter,
  publicProcedure,
  businessProcedure,
  rateLimitedBusinessProcedure,
  adminProcedure,
} from '@/server/api/trpc'
import {
  createCreateVoucherUseCase,
  createSubmitVoucherUseCase,
  createGetBusinessVouchersUseCase,
  createGetBusinessProfileUseCase,
  createApproveVoucherUseCase,
  createRejectVoucherUseCase,
  createListPendingVouchersUseCase,
  voucherRepo,
} from '@/infrastructure/config/container'
import { VoucherMapper } from '@/application/mappers/VoucherMapper'
import { mapDomainError } from '@/server/api/helpers/mapDomainError'
import { TRPCError } from '@trpc/server'

export const vouchersRouter = createTRPCRouter({
  // Business: create a new draft voucher (rate limited)
  create: rateLimitedBusinessProcedure
    .input(
      z.object({
        title: z.string().min(3).max(200),
        description: z.string().min(10).max(2000),
        discountType: z.enum(['CASH', 'PERCENTAGE', 'PRODUCT', 'SERVICE']),
        discountValue: z.number().positive().optional(),
        discountDescription: z.string().max(500).optional(),
        terms: z.string().max(2000).optional(),
        minimumPurchase: z.number().positive().optional(),
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
        maxClaims: z.number().int().positive().optional(),
        image: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const useCase = createCreateVoucherUseCase()
        return await useCase.execute({ userId: ctx.session.user.id, ...input })
      } catch (error) {
        mapDomainError(error)
      }
    }),

  // Business: submit draft for admin approval (rate limited)
  submit: rateLimitedBusinessProcedure
    .input(z.object({ voucherId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get businessId via targeted profile lookup (not fetching all vouchers)
        const profileUseCase = createGetBusinessProfileUseCase()
        const profile = await profileUseCase.execute({ by: 'userId', userId: ctx.session.user.id })
        if (!profile) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Business profile not found' })
        }
        const useCase = createSubmitVoucherUseCase()
        return await useCase.execute({
          voucherId: input.voucherId,
          businessId: profile.id,
        })
      } catch (error) {
        if (error instanceof TRPCError) throw error
        mapDomainError(error)
      }
    }),

  // Business: list own vouchers
  listMine: businessProcedure.query(async ({ ctx }) => {
    try {
      const useCase = createGetBusinessVouchersUseCase()
      return await useCase.execute(ctx.session.user.id)
    } catch (error) {
      mapDomainError(error)
    }
  }),

  // Admin: list pending vouchers
  listPending: adminProcedure.query(async () => {
    const useCase = createListPendingVouchersUseCase()
    return await useCase.execute()
  }),

  // Admin: approve voucher
  approve: adminProcedure
    .input(z.object({ voucherId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const useCase = createApproveVoucherUseCase()
        return await useCase.execute({
          voucherId: input.voucherId,
          approvedBy: ctx.session.user.id,
        })
      } catch (error) {
        mapDomainError(error)
      }
    }),

  // Admin: reject voucher
  reject: adminProcedure
    .input(
      z.object({
        voucherId: z.string(),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const useCase = createRejectVoucherUseCase()
        return await useCase.execute({
          ...input,
          rejectedBy: ctx.session.user.id,
        })
      } catch (error) {
        mapDomainError(error)
      }
    }),

  // Public: list all active vouchers with business info
  listActive: publicProcedure.query(async ({ ctx }) => {
    const vouchers = await ctx.db.voucher.findMany({
      where: { status: 'ACTIVE' },
      include: {
        business: {
          include: { businessCategories: { include: { category: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return vouchers.map((v) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      discountType: v.discountType,
      discountValue: v.discountValue,
      discountDescription: v.discountDescription,
      terms: v.terms,
      slug: v.slug,
      businessName: v.business.name,
      businessId: v.business.id,
      city: v.business.city,
      categories: v.business.businessCategories.map((bc) => bc.category.slug),
      maxClaims: v.maxClaims,
      claimsCount: v.claimsCount,
      startDate: v.startDate,
      endDate: v.endDate,
    }))
  }),

  // Public: get voucher by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const voucher = await voucherRepo.findById(input.id)
      if (!voucher) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Voucher not found' })
      }
      return VoucherMapper.toDTO(voucher)
    }),
})
