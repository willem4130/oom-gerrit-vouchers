import { nanoid } from 'nanoid'
import type { IUseCase } from '@/application/interfaces/IUseCase'
import type { IClaimRepository } from '@/domain/repositories/IClaimRepository'
import type { IVoucherRepository } from '@/domain/repositories/IVoucherRepository'
import type { ITransactionManager } from '@/domain/types'
import { ClaimLimitExceededError } from '@/domain/errors/VoucherErrors'

interface ClaimVoucherInput {
  voucherId: string
  userId: string
}

interface ClaimVoucherOutput {
  claimId: string
  claimCode: string
  expiresAt: Date
}

export class ClaimVoucherUseCase implements IUseCase<ClaimVoucherInput, ClaimVoucherOutput> {
  constructor(
    private claimRepo: IClaimRepository,
    private voucherRepo: IVoucherRepository,
    private transactionManager: ITransactionManager,
  ) {}

  async execute(input: ClaimVoucherInput): Promise<ClaimVoucherOutput> {
    return this.transactionManager.run(async (tx) => {
      const voucher = await this.voucherRepo.findById(input.voucherId, tx)
      if (!voucher) {
        throw new Error('Voucher niet gevonden')
      }

      if (!voucher.isClaimable()) {
        throw new ClaimLimitExceededError(input.voucherId)
      }

      const claimCode = nanoid(8).toUpperCase()
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

      const claim = await this.claimRepo.create({
        voucherId: input.voucherId,
        userId: input.userId,
        claimCode,
        expiresAt,
      }, tx)

      await this.voucherRepo.incrementClaimCount(input.voucherId, tx)

      return {
        claimId: claim.id,
        claimCode: claim.claimCode,
        expiresAt,
      }
    })
  }
}
