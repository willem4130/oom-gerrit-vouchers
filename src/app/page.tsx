'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  TreePine,
  Search,
  Ticket,
  PartyPopper,
  UtensilsCrossed,
  Beer,
  Sparkles,
  Bed,
  Bike,
  MapPin,
  ArrowRight,
  Menu,
} from 'lucide-react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const categories = [
  { name: 'Restaurants', slug: 'restaurants', tagline: 'Proef het platteland', icon: UtensilsCrossed, gradient: 'from-amber-500 to-orange-600' },
  { name: 'Bars & Cafés', slug: 'bars', tagline: 'Gezelligheid op z\'n best', icon: Beer, gradient: 'from-orange-500 to-red-500' },
  { name: 'Wellness', slug: 'wellness', tagline: 'Even tot rust komen', icon: Sparkles, gradient: 'from-teal-500 to-cyan-600' },
  { name: 'Overnachten', slug: 'accommodaties', tagline: 'Wakker worden in het groen', icon: Bed, gradient: 'from-sky-500 to-blue-600' },
  { name: 'Activiteiten', slug: 'activiteiten', tagline: 'Eropuit en beleven', icon: Bike, gradient: 'from-emerald-500 to-green-600' },
] as const

const featuredVouchers = [
  {
    title: '€10 korting op lunch menu',
    business: 'De Groene Weide',
    city: 'Valkenburg',
    discount: '€10',
    label: 'korting',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    title: '2e biertje gratis',
    business: '\'t Gezellige Hoekje',
    city: 'Roermond',
    discount: '2e',
    label: 'gratis',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    title: '20% korting op massage',
    business: 'Wellness Retreat Limburg',
    city: 'Maastricht',
    discount: '20%',
    label: 'korting',
    gradient: 'from-teal-500 to-cyan-600',
  },
]

const navLinks = [
  { href: '/vouchers', label: 'Bonnen' },
  { href: '/about', label: 'Over ons' },
  { href: '/business/register', label: 'Voor ondernemers' },
]

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const onHeroImageLoad = () => {
    const cover = containerRef.current?.querySelector('.hero-image-cover')
    if (cover) {
      gsap.to(cover, { autoAlpha: 0, duration: 1.2, ease: 'power2.inOut' })
    }
  }

  useGSAP(() => {
    const container = containerRef.current
    if (!container) return

    // -- Hero entrance (page load) --
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    heroTl
      .fromTo(container.querySelector('.hero-glow'),
        { scale: 0.5, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 1.2 },
        0
      )
      .fromTo(container.querySelector('.hero-icon'),
        { scale: 0.8, autoAlpha: 0, y: 20 },
        { scale: 1, autoAlpha: 1, y: 0, duration: 0.8 },
        '-=0.8'
      )
      .fromTo(container.querySelectorAll('.hero-heading > *'),
        { y: 60, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.15 },
        '-=0.5'
      )
      .fromTo(container.querySelector('.hero-sub'),
        { y: 30, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7 },
        '-=0.4'
      )
      .fromTo(container.querySelectorAll('.hero-cta > *'),
        { y: 20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.1 },
        '-=0.3'
      )

    // -- Hero parallax glow --
    gsap.to(container.querySelector('.hero-glow'), {
      y: 150,
      ease: 'none',
      scrollTrigger: {
        trigger: container.querySelector('.hero-section'),
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    })

    // -- Scroll reveal helper --
    function revealOnScroll(
      trigger: string,
      targets: string,
      fromVars: gsap.TweenVars = {},
      stagger = 0.12,
    ) {
      const triggerEl = container!.querySelector(trigger)
      const els = container!.querySelectorAll(targets)
      if (!triggerEl || els.length === 0) return

      gsap.fromTo(els,
        { autoAlpha: 0, y: 50, ...fromVars },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: triggerEl,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      )
    }

    // -- Section reveals --
    revealOnScroll('[data-section="categories"]', '[data-animate="cat"]', {}, 0.08)
    revealOnScroll('[data-section="vouchers"]', '[data-animate="voucher-header"]', {})
    revealOnScroll('[data-section="vouchers"]', '[data-animate="voucher"]', {}, 0.15)
    revealOnScroll('[data-section="how"]', '[data-animate="how-header"]', {})
    revealOnScroll('[data-section="how"]', '[data-animate="how-card"]', { scale: 0.95 }, 0.15)

    // -- Business CTA --
    const bizEl = container.querySelector('[data-section="biz"]')
    if (bizEl) {
      gsap.fromTo(bizEl,
        { autoAlpha: 0, y: 60, scale: 0.97 },
        {
          autoAlpha: 1, y: 0, scale: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: bizEl,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      )

      gsap.fromTo(bizEl.querySelectorAll('[data-animate="benefit"]'),
        { x: 30, autoAlpha: 0 },
        {
          x: 0, autoAlpha: 1,
          duration: 0.5,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: bizEl,
            start: 'top 70%',
            toggleActions: 'play none none none',
          },
        }
      )
    }

    // -- Footer --
    const footer = container.querySelector('footer')
    if (footer) {
      gsap.fromTo(footer.querySelector('.footer-content'),
        { y: 20, autoAlpha: 0 },
        {
          y: 0, autoAlpha: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: footer,
            start: 'top 95%',
            toggleActions: 'play none none none',
          },
        }
      )
    }
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
                <p className="text-[11px] text-muted-foreground">Plattelandsbonnen</p>
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
              <Link href="/login">
                <Button variant="ghost" size="sm">Inloggen</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="shadow-lg shadow-primary/25">
                  Registreren
                </Button>
              </Link>
            </div>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <nav className="flex flex-col gap-4 pt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">Inloggen</Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">Registreren</Button>
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
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/countryside-panoramic.jpg"
            alt="Panoramisch uitzicht over groene weilanden op het Nederlandse platteland"
            fill
            className="object-cover"
            priority
            onLoad={onHeroImageLoad}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/90" />
          <div className="hero-image-cover absolute inset-0 bg-white" />
        </div>

        <main className="container relative mx-auto px-4 py-20 md:py-28 lg:py-36">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative">
              <div className="hero-glow absolute inset-0 rounded-full bg-gradient-to-r from-emerald-200 to-amber-200 opacity-50 blur-3xl" />
              <div className="hero-icon glass relative rounded-3xl p-8">
                <TreePine className="h-16 w-16 text-emerald-700 md:h-20 md:w-20" />
              </div>
            </div>

            <div className="hero-heading mt-10 max-w-4xl space-y-5">
              <h1 className="text-5xl font-bold md:text-6xl lg:text-7xl">
                <span className="inline-block bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  Ontdek het beste van
                </span>
                <br />
                <span className="inline-block bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                  het platteland
                </span>
              </h1>
            </div>
            <p className="hero-sub mx-auto mt-5 max-w-2xl text-lg text-gray-700 text-balance md:text-xl">
              Oom Gerrit kent alle verborgen parels bij jou in de buurt. Van gezellige restaurants
              en bruine kroegen tot wellness en buitenactiviteiten.
            </p>

            <div className="hero-cta mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/vouchers"
                className="glossy-btn flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-medium hover:scale-105 transition-transform"
              >
                <Search className="h-5 w-5" />
                Bekijk bonnen
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/business/register"
                className="flex items-center gap-2 rounded-xl border-2 border-gray-300 bg-white/70 backdrop-blur-sm px-8 py-4 text-lg font-medium hover:border-gray-400 hover:bg-white/90 transition-colors"
              >
                Ondernemer? Meld je aan
              </Link>
            </div>
          </div>
        </main>
      </section>

      {/* Categories */}
      <section data-section="categories" className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/vouchers?categorie=${cat.slug}`} data-animate="cat">
              <div className="glossy-card group cursor-pointer text-left hover:scale-[1.03] transition-transform">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${cat.gradient}`}>
                  <cat.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold">{cat.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{cat.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Vouchers */}
      <section data-section="vouchers" className="container mx-auto px-4 pb-20">
        <div data-animate="voucher-header" className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">Bonnen in de kijker</h2>
            <p className="mt-2 text-muted-foreground">Een greep uit de aanbiedingen van lokale ondernemers.</p>
          </div>
          <Link href="/vouchers" className="hidden text-sm font-medium text-primary hover:underline md:block">
            Alle bonnen &rarr;
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredVouchers.map((v) => (
            <Link key={v.title} href="/vouchers" data-animate="voucher">
              <div className="glass group cursor-pointer overflow-hidden rounded-2xl transition-shadow duration-300 hover:shadow-2xl hover:scale-[1.02] transition-transform">
                <div className={`h-1.5 bg-gradient-to-r ${v.gradient}`} />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-semibold">{v.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{v.business}</p>
                    </div>
                    <div className={`shrink-0 rounded-xl bg-gradient-to-br ${v.gradient} px-3 py-2 text-center shadow-lg`}>
                      <span className="block text-lg font-bold leading-none text-white">{v.discount}</span>
                      <span className="block text-[10px] font-medium uppercase tracking-wide text-white/80">{v.label}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {v.city}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6 md:hidden">
          <Link href="/vouchers">
            <Button variant="outline" className="w-full">Alle bonnen bekijken</Button>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section id="zo-werkt-het" data-section="how" className="container mx-auto px-4 pb-20">
        <h2 data-animate="how-header" className="mb-8 text-3xl font-bold md:text-4xl">Zo werkt het</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Search, title: 'Ontdek', desc: 'Blader door bonnen in jouw regio. Filter op categorie, stad of laat Oom Gerrit iets leuks voor je uitzoeken.', gradient: 'from-emerald-500 to-green-600' },
            { icon: Ticket, title: 'Claim je bon', desc: 'Gratis account, unieke code. Geen addertje onder het gras — helemaal gratis.', gradient: 'from-amber-500 to-orange-600' },
            { icon: PartyPopper, title: 'Ga genieten', desc: 'Toon je code of QR-code bij de ondernemer en geniet van je korting. Zo simpel is het.', gradient: 'from-teal-500 to-cyan-600' },
          ].map((step) => (
            <div key={step.title} data-animate="how-card" className="glossy-card">
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${step.gradient} shadow-lg`}>
                <step.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Business CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div data-section="biz" className="overflow-hidden rounded-3xl relative">
          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src="/images/hero-path.jpg"
              alt="Zandpad door groene akkers op het platteland"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-white/60" />
          </div>
          <div className="relative border border-white/30 rounded-3xl p-8 sm:p-12 lg:p-16">
            <div className="relative flex flex-col items-center text-center lg:flex-row lg:items-start lg:text-left">
              <div className="flex-1">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <TreePine className="h-3 w-3" />
                  Voor ondernemers
                </div>
                <h2 className="text-3xl font-bold md:text-4xl">
                  Laat je zaak zien aan{' '}
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    duizenden bezoekers
                  </span>
                </h2>
                <p className="mt-4 max-w-xl text-lg text-muted-foreground text-balance">
                  Gratis registreren. Eigen bonnen aanmaken en beheren.
                  Meer klanten, minder moeite — jij doet waar je goed in bent.
                </p>
                <div className="mt-8">
                  <Link
                    href="/business/register"
                    className="glossy-btn inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-medium hover:scale-105 transition-transform"
                  >
                    Gratis aanmelden
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
              <div className="mt-10 grid shrink-0 grid-cols-1 gap-3 lg:mt-0 lg:ml-12">
                {[
                  'Gratis zichtbaarheid',
                  'Eigen dashboard',
                  'Direct meer klanten',
                ].map((item) => (
                  <div key={item} data-animate="benefit" className="glass-subtle flex items-center gap-3 rounded-xl px-5 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
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
        <div className="footer-content container mx-auto flex flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-emerald-600 to-green-700 p-1.5">
              <TreePine className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-medium">Oom Gerrit</span>
              <span className="mx-2 text-gray-300">—</span>
              <span className="text-sm text-muted-foreground">Jouw gids voor het platteland</span>
            </div>
          </div>
          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/vouchers" className="hover:text-foreground transition-colors">Bonnen</Link>
            <Link href="/about" className="hover:text-foreground transition-colors">Over ons</Link>
            <Link href="/business/register" className="hover:text-foreground transition-colors">Voor ondernemers</Link>
          </nav>
          <p className="text-xs text-muted-foreground">&copy; 2026 Oom Gerrit</p>
        </div>
      </footer>
    </div>
  )
}
