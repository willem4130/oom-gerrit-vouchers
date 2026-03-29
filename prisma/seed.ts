import { PrismaClient, UserRole, BusinessStatus, VoucherStatus, DiscountType } from '@prisma/client'
import { achterhoekBusinesses } from './seed-data/achterhoek'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Oom Gerrit database...\n')

  // ── Clear existing data ──
  console.log('🗑️  Clearing existing data...')
  await prisma.voucherEvent.deleteMany()
  await prisma.redemption.deleteMany()
  await prisma.voucherClaim.deleteMany()
  await prisma.voucher.deleteMany()
  await prisma.businessCategory.deleteMany()
  await prisma.business.deleteMany()
  await prisma.category.deleteMany()
  await prisma.userRecommendation.deleteMany()
  await prisma.user.deleteMany()
  console.log('  ✅ Cleared\n')

  // ── Categories ──
  console.log('📁 Creating categories...')
  const categoryDefs = [
    { name: 'Restaurants', slug: 'restaurants', description: 'Restaurants en eetgelegenheden', icon: 'utensils', sortOrder: 1 },
    { name: 'Bars', slug: 'bars', description: 'Gezellige bars, kroegen en cafés', icon: 'beer', sortOrder: 2 },
    { name: 'Wellness', slug: 'wellness', description: 'Spa, sauna en wellness faciliteiten', icon: 'spa', sortOrder: 3 },
    { name: 'Accommodaties', slug: 'accommodaties', description: 'B&Bs, hotels, glampings en campings', icon: 'bed', sortOrder: 4 },
    { name: 'Activiteiten', slug: 'activiteiten', description: 'Outdoor activiteiten en recreatie', icon: 'bicycle', sortOrder: 5 },
  ]

  const categoryMap = new Map<string, string>() // slug -> id
  for (const cat of categoryDefs) {
    const created = await prisma.category.create({ data: cat })
    categoryMap.set(cat.slug, created.id)
    console.log(`  ✅ ${created.name}`)
  }

  // ── Admin user ──
  console.log('\n👤 Creating admin user...')
  const admin = await prisma.user.create({
    data: {
      email: 'admin@oomgerrit.nl',
      name: 'Admin Gebruiker',
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  })
  console.log(`  ✅ ${admin.email}`)

  // ── Consumer user ──
  console.log('\n👥 Creating test consumer...')
  const consumer = await prisma.user.create({
    data: {
      email: 'bezoeker@oomgerrit.nl',
      name: 'Jan de Vries',
      role: UserRole.CONSUMER,
      emailVerified: new Date(),
    },
  })
  console.log(`  ✅ ${consumer.email}`)

  // ── Achterhoek businesses + vouchers ──
  console.log(`\n🏢 Creating ${achterhoekBusinesses.length} Achterhoek businesses...`)

  let voucherCount = 0
  for (const biz of achterhoekBusinesses) {
    // Create business user
    const user = await prisma.user.create({
      data: {
        email: biz.email,
        name: biz.ownerName,
        role: UserRole.BUSINESS,
        emailVerified: new Date(),
      },
    })

    // Create business
    const business = await prisma.business.create({
      data: {
        userId: user.id,
        name: biz.name,
        description: biz.description,
        address: biz.address,
        city: biz.city,
        postalCode: biz.postalCode,
        province: biz.province,
        phone: biz.phone,
        website: biz.website,
        status: BusinessStatus.VERIFIED,
        verifiedAt: new Date(),
      },
    })

    // Link categories
    for (const slug of biz.categories) {
      const catId = categoryMap.get(slug)
      if (catId) {
        await prisma.businessCategory.create({
          data: { businessId: business.id, categoryId: catId },
        })
      }
    }

    // Create vouchers
    for (const v of biz.vouchers) {
      await prisma.voucher.create({
        data: {
          businessId: business.id,
          title: v.title,
          description: v.description,
          discountType: v.discountType as DiscountType,
          discountValue: v.discountValue ?? null,
          discountDescription: v.discountDescription ?? null,
          terms: v.terms,
          minimumPurchase: v.minimumPurchase ?? null,
          startDate: new Date(),
          endDate: new Date(Date.now() + v.daysValid * 24 * 60 * 60 * 1000),
          maxClaims: v.maxClaims,
          status: VoucherStatus.ACTIVE,
          approvedAt: new Date(),
          slug: v.slug,
        },
      })
      voucherCount++
    }

    console.log(`  ✅ ${biz.name} (${biz.city}) — ${biz.vouchers.length} bonnen`)
  }

  console.log(`\n🎉 Database seeded successfully!`)
  console.log(`   ${achterhoekBusinesses.length} bedrijven, ${voucherCount} bonnen`)
  console.log(`\n📝 Test accounts:`)
  console.log(`   Admin:    admin@oomgerrit.nl`)
  console.log(`   Consumer: bezoeker@oomgerrit.nl`)
  console.log(`   Business: ${achterhoekBusinesses[0]!.email} (en ${achterhoekBusinesses.length - 1} anderen)`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
