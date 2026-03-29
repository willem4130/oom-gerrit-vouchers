'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { api } from '@/trpc/react'
import {
  TreePine,
  UtensilsCrossed,
  Beer,
  Sparkles,
  Bed,
  Bike,
  MapPin,
  ArrowRight,
  Menu,
  Building2,
  Ticket,
  Search,
  PartyPopper,
} from 'lucide-react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const categoryMeta: Record<string, { icon: typeof UtensilsCrossed; gradient: string; tagline: string }> = {
  restaurants: { icon: UtensilsCrossed, gradient: 'from-amber-500 to-orange-600', tagline: 'Proef het platteland' },
  bars: { icon: Beer, gradient: 'from-orange-500 to-red-500', tagline: 'Gezelligheid op z\'n best' },
  wellness: { icon: Sparkles, gradient: 'from-teal-500 to-cyan-600', tagline: 'Even tot rust komen' },
  accommodaties: { icon: Bed, gradient: 'from-sky-500 to-blue-600', tagline: 'Wakker worden in het groen' },
  activiteiten: { icon: Bike, gradient: 'from-emerald-500 to-green-600', tagline: 'Eropuit en beleven' },
}

function getDiscountLabel(v: { discountType: string; discountValue: number | null; discountDescription: string | null }) {
  if (v.discountType === 'CASH' && v.discountValue) return { text: `€${v.discountValue}`, sub: 'korting' }
  if (v.discountType === 'PERCENTAGE' && v.discountValue) return { text: `${v.discountValue}%`, sub: 'korting' }
  if (v.discountType === 'PRODUCT') return { text: 'Gratis', sub: 'product' }
  if (v.discountType === 'SERVICE') return { text: 'Gratis', sub: 'service' }
  return { text: '?', sub: '' }
}

const navLinks = [
  { href: '#bonnen', label: 'Alle bonnen' },
  { href: '#bedrijven', label: 'Bedrijven' },
  { href: '/admin/businesses', label: 'Admin' },
]

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: vouchers } = api.vouchers.listActive.useQuery()
  const { data: businesses } = api.businesses.listVerified.useQuery()

  const onHeroImageLoad = () => {
    const cover = containerRef.current?.querySelector('.hero-image-cover')
    if (cover) {
      gsap.to(cover, { autoAlpha: 0, duration: 1.2, ease: 'power2.inOut' })
    }
  }

  const filteredVouchers = activeCategory
    ? vouchers?.filter((v) => v.categories.includes(activeCategory))
    : vouchers

  useGSAP(() => {
    const container = containerRef.current
    if (!container) return

    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    heroTl
      .fromTo(container.querySelector('.hero-glow'),
        { scale: 0.5, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 1.2 }, 0)
      .fromTo(container.querySelector('.hero-icon'),
        { scale: 0.8, autoAlpha: 0, y: 20 },
        { scale: 1, autoAlpha: 1, y: 0, duration: 0.8 }, '-=0.8')
      .fromTo(container.querySelectorAll('.hero-heading > *'),
        { y: 60, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.15 }, '-=0.5')
      .fromTo(container.querySelector('.hero-sub'),
        { y: 30, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7 }, '-=0.4')
      .fromTo(container.querySelectorAll('.hero-cta > *'),
        { y: 20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.1 }, '-=0.3')

    gsap.to(container.querySelector('.hero-glow'), {
      y: 150, ease: 'none',
      scrollTrigger: { trigger: container.querySelector('.hero-section'), start: 'top top', end: 'bottom top', scrub: true },
    })
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-amber-50/20">
      {/* Navigation */}
      <nav className="glass sticky top-0 z-50 border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 p-2">
                <TreePine className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-base font-semibold">Oom Gerrit</p>
                <p className="text-[11px] text-muted-foreground">De beste tips van &apos;t platteland</p>
              </div>
            </Link>

            <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <Link href="/register/business">
                <Button variant="ghost" size="sm">Ondernemer? Meld je aan</Button>
              </Link>
              <Link href="/business/vouchers">
                <Button size="sm" className="shadow-lg shadow-primary/25">
                  Mijn bonnen
                </Button>
              </Link>
            </div>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <nav className="flex flex-col gap-4 pt-8">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>
                      {link.label}
                    </Link>
                  ))}
                  <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                    <Link href="/register/business" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">Ondernemer? Meld je aan</Button>
                    </Link>
                    <Link href="/business/vouchers" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">Mijn bonnen</Button>
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/countryside-panoramic.jpg" alt="Panoramisch uitzicht over het Achterhoekse landschap" fill className="object-cover" priority onLoad={onHeroImageLoad} />
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/90" />
          <div className="hero-image-cover absolute inset-0 bg-white" />
        </div>
        <main className="container relative mx-auto px-4 py-16 md:py-24 lg:py-32">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative">
              <div className="hero-glow absolute inset-0 rounded-full bg-gradient-to-r from-emerald-200 to-amber-200 opacity-50 blur-3xl" />
              <div className="hero-icon glass relative rounded-3xl p-6">
                <TreePine className="h-12 w-12 text-emerald-700 md:h-16 md:w-16" />
              </div>
            </div>
            <div className="hero-heading mt-8 max-w-4xl">
              <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
                <span className="inline-block bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">Ontdek het beste van</span>
                <br />
                <span className="inline-block bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">de Achterhoek</span>
              </h1>
            </div>
            <p className="hero-sub mx-auto mt-4 max-w-2xl text-base text-gray-700 text-balance md:text-lg">
              Van Winterswijk tot Zutphen, van Groenlo tot Doetinchem — Oom Gerrit kent de lekkerste restaurants, gezelligste kroegen en mooiste plekjes.
            </p>
            <div className="hero-cta mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#bonnen" className="glossy-btn flex items-center gap-2 rounded-xl px-6 py-3 text-base font-medium hover:scale-105 transition-transform">
                <Ticket className="h-4 w-4" />
                Bekijk alle {vouchers?.length ?? ''} bonnen
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#bedrijven" className="flex items-center gap-2 rounded-xl border-2 border-gray-300 bg-white/70 backdrop-blur-sm px-6 py-3 text-base font-medium hover:border-gray-400 hover:bg-white/90 transition-colors">
                <Building2 className="h-4 w-4" />
                {businesses?.length ?? ''} bedrijven
              </a>
            </div>
          </div>
        </main>
      </section>

      {/* All Vouchers */}
      <section id="bonnen" className="container mx-auto px-4 py-16">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Alle bonnen</h2>
            <p className="mt-1 text-sm text-muted-foreground">{filteredVouchers?.length ?? 0} bonnen beschikbaar</p>
          </div>
        </div>

        {/* Category filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${!activeCategory ? 'bg-primary text-white shadow-md' : 'bg-white/70 text-muted-foreground hover:bg-white'}`}
          >
            Alles
          </button>
          {Object.entries(categoryMeta).map(([slug, meta]) => {
            const Icon = meta.icon
            return (
              <button
                key={slug}
                onClick={() => setActiveCategory(activeCategory === slug ? null : slug)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${activeCategory === slug ? 'bg-primary text-white shadow-md' : 'bg-white/70 text-muted-foreground hover:bg-white'}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {slug === 'restaurants' ? 'Restaurants' : slug === 'bars' ? 'Bars & Cafés' : slug === 'wellness' ? 'Wellness' : slug === 'accommodaties' ? 'Overnachten' : 'Activiteiten'}
              </button>
            )
          })}
        </div>

        {/* Voucher grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredVouchers?.map((v) => {
            const label = getDiscountLabel(v)
            const catSlug = v.categories[0] ?? 'restaurants'
            const meta = categoryMeta[catSlug] ?? categoryMeta['restaurants']!
            return (
              <div key={v.id} className="glass group overflow-hidden rounded-2xl transition-shadow duration-300 hover:shadow-2xl hover:scale-[1.02] transition-transform">
                <div className={`h-1.5 bg-gradient-to-r ${meta.gradient}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-tight">{v.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{v.businessName}</p>
                    </div>
                    <div className={`shrink-0 rounded-lg bg-gradient-to-br ${meta.gradient} px-2.5 py-1.5 text-center shadow-md`}>
                      <span className="block text-sm font-bold leading-none text-white">{label.text}</span>
                      <span className="block text-[9px] font-medium uppercase tracking-wide text-white/80">{label.sub}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {v.city}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {!vouchers && (
          <div className="py-12 text-center text-muted-foreground">Bonnen laden...</div>
        )}
      </section>

      {/* All Businesses */}
      <section id="bedrijven" className="container mx-auto px-4 pb-16">
        <h2 className="mb-6 text-2xl font-bold md:text-3xl">Deelnemende bedrijven</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {businesses?.map((b) => {
            const catSlug = b.categories[0] ?? 'restaurants'
            const meta = categoryMeta[catSlug] ?? categoryMeta['restaurants']!
            const Icon = meta.icon
            return (
              <div key={b.id} className="glossy-card group hover:scale-[1.02] transition-transform">
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${meta.gradient}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{b.name}</p>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {b.city}
                    </div>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{b.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {b.categoryNames.map((name: string) => (
                      <span key={name} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{name}</span>
                    ))}
                  </div>
                  <span className="text-xs font-medium text-primary">{b.activeVoucherCount} bonnen</span>
                </div>
              </div>
            )
          })}
        </div>
        {!businesses && (
          <div className="py-12 text-center text-muted-foreground">Bedrijven laden...</div>
        )}
      </section>

      {/* How It Works */}
      <section id="zo-werkt-het" className="container mx-auto px-4 pb-16">
        <h2 className="mb-6 text-2xl font-bold md:text-3xl">Zo werkt het</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Search, title: 'Ontdek', desc: 'Blader door bonnen in de Achterhoek. Filter op categorie of zoek op stad.', gradient: 'from-emerald-500 to-green-600' },
            { icon: Ticket, title: 'Claim je bon', desc: 'Gratis account, unieke code. Geen addertje onder het gras.', gradient: 'from-amber-500 to-orange-600' },
            { icon: PartyPopper, title: 'Ga genieten', desc: 'Toon je code bij de ondernemer en geniet van je korting.', gradient: 'from-teal-500 to-cyan-600' },
          ].map((step) => (
            <div key={step.title} className="glossy-card">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${step.gradient} shadow-lg`}>
                <step.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Business CTA */}
      <section className="container mx-auto px-4 pb-16">
        <div className="overflow-hidden rounded-3xl relative">
          <div className="absolute inset-0">
            <Image src="/images/hero-path.jpg" alt="Zandpad door groene akkers" fill className="object-cover" />
            <div className="absolute inset-0 bg-white/60" />
          </div>
          <div className="relative border border-white/30 rounded-3xl p-8 sm:p-12">
            <div className="flex flex-col items-center text-center lg:flex-row lg:items-start lg:text-left lg:gap-12">
              <div className="flex-1">
                <p className="text-sm font-medium text-primary">Voor ondernemers</p>
                <h2 className="mt-2 text-2xl font-bold md:text-3xl">
                  Laat je zaak zien aan{' '}
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">duizenden bezoekers</span>
                </h2>
                <p className="mt-3 max-w-lg text-sm text-muted-foreground">
                  Gratis registreren. Eigen bonnen aanmaken. Meer klanten, minder moeite.
                </p>
                <div className="mt-6">
                  <Link href="/register/business" className="glossy-btn inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-medium hover:scale-105 transition-transform">
                    Gratis aanmelden <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div className="mt-8 grid shrink-0 grid-cols-1 gap-2 lg:mt-0">
                {['Gratis zichtbaarheid', 'Eigen dashboard', 'Direct meer klanten'].map((item) => (
                  <div key={item} className="glass-subtle flex items-center gap-3 rounded-xl px-4 py-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600">
                      <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 bg-white/30 backdrop-blur-sm">
        <div className="container mx-auto flex flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-emerald-600 to-green-700 p-1.5">
              <TreePine className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium">Oom Gerrit</span>
            <span className="text-xs text-muted-foreground">— Proef, beleef en geniet van de Achterhoek</span>
          </div>
          <nav className="flex gap-6 text-xs text-muted-foreground">
            <a href="#bonnen" className="hover:text-foreground transition-colors">Bonnen</a>
            <a href="#bedrijven" className="hover:text-foreground transition-colors">Bedrijven</a>
            <Link href="/register/business" className="hover:text-foreground transition-colors">Voor ondernemers</Link>
            <Link href="/admin/businesses" className="hover:text-foreground transition-colors">Admin</Link>
          </nav>
          <p className="text-xs text-muted-foreground">&copy; 2026 Oom Gerrit</p>
        </div>
      </footer>
    </div>
  )
}
