import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { createClaimVoucherUseCase } from '@/infrastructure/config/container'
import { claimRepo } from '@/infrastructure/config/container'

export const claimsRouter = createTRPCRouter({
  // Claim a voucher — lightweight: just needs an email (finds or creates user)
  claim: publicProcedure
    .input(z.object({
      voucherId: z.string(),
      email: z.string().email(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Find or create user by email
      let user = await ctx.db.user.findUnique({ where: { email: input.email } })
      if (!user) {
        user = await ctx.db.user.create({
          data: {
            email: input.email,
            name: input.email.split('@')[0] ?? 'Bezoeker',
            role: 'CONSUMER',
          },
        })
      }

      try {
        const useCase = createClaimVoucherUseCase()
        return await useCase.execute({
          voucherId: input.voucherId,
          userId: user.id,
        })
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: error.message })
        }
        throw error
      }
    }),

  // Look up a claim by code (for the business to verify)
  getByCode: publicProcedure
    .input(z.object({ code: z.string().min(1) }))
    .query(async ({ input }) => {
      const claim = await claimRepo.findByClaimCode(input.code)
      if (!claim) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Code niet gevonden' })
      }
      return {
        id: claim.id,
        claimCode: claim.claimCode,
        status: claim.status,
        claimedAt: claim.claimedAt,
        expiresAt: claim.expiresAt,
        isRedeemable: claim.isRedeemable(),
        isExpired: claim.isExpired(),
      }
    }),
})
