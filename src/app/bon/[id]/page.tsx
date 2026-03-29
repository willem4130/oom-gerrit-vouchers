'use client'

import Link from 'next/link'
import { use, useState } from 'react'
import { api } from '@/trpc/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  TreePine,
  ArrowLeft,
  MapPin,
  Calendar,
  Ticket,
  Building2,
  Check,
  Copy,
} from 'lucide-react'

export default function VoucherDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: voucher, isLoading } = api.vouchers.getById.useQuery({ id })

  const [email, setEmail] = useState('')
  const [claimed, setClaimed] = useState<{ claimCode: string; expiresAt: Date } | null>(null)
  const [copied, setCopied] = useState(false)

  const claimMutation = api.claims.claim.useMutation({
    onSuccess: (data) => {
      setClaimed({ claimCode: data.claimCode, expiresAt: new Date(data.expiresAt) })
    },
  })

  const handleClaim = () => {
    if (!email || !voucher) return
    claimMutation.mutate({ voucherId: voucher.id, email })
  }

  const handleCopy = () => {
    if (!claimed) return
    navigator.clipboard.writeText(claimed.claimCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-green-50/30 to-amber-50/20">
        <p className="text-muted-foreground">Bon laden...</p>
      </div>
    )
  }

  if (!voucher) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-white via-green-50/30 to-amber-50/20">
        <p className="text-lg font-semibold">Bon niet gevonden</p>
        <Link href="/"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Terug naar overzicht</Button></Link>
      </div>
    )
  }

  const discountDisplay = voucher.discountType === 'CASH' && voucher.discountValue
    ? `€${voucher.discountValue} korting`
    : voucher.discountType === 'PERCENTAGE' && voucher.discountValue
    ? `${voucher.discountValue}% korting`
    : voucher.discountDescription ?? 'Gratis'

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-amber-50/20">
      <nav className="glass sticky top-0 z-50 border-b border-gray-200/50">
        <div className="container mx-auto flex h-14 items-center gap-4 px-4">
          <Link href="/#bonnen" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Alle bonnen
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <TreePine className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Oom Gerrit</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto max-w-2xl px-4 py-12">
        {/* Discount badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
          <Ticket className="h-4 w-4" />
          {discountDisplay}
        </div>

        <h1 className="text-3xl font-bold md:text-4xl">{voucher.title}</h1>

        <Link href={`/bedrijf/${voucher.businessId}`} className="mt-4 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <Building2 className="h-4 w-4" />
          <span className="text-sm font-medium">{voucher.businessName}</span>
          {voucher.city && (
            <>
              <MapPin className="ml-2 h-3.5 w-3.5" />
              <span className="text-sm">{voucher.city}</span>
            </>
          )}
        </Link>

        {/* Description */}
        <div className="mt-8 glossy-card">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Beschrijving</h2>
          <p className="mt-2 leading-relaxed">{voucher.description}</p>
        </div>

        {voucher.terms && (
          <div className="mt-4 glossy-card">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Voorwaarden</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{voucher.terms}</p>
          </div>
        )}

        {/* Details grid */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          {voucher.minimumPurchase && (
            <div className="glossy-card">
              <p className="text-xs text-muted-foreground">Minimale besteding</p>
              <p className="mt-1 text-lg font-bold">€{voucher.minimumPurchase}</p>
            </div>
          )}
          {voucher.remainingClaims !== null && (
            <div className="glossy-card">
              <p className="text-xs text-muted-foreground">Nog beschikbaar</p>
              <p className="mt-1 text-lg font-bold">{voucher.remainingClaims}x</p>
            </div>
          )}
          {voucher.startDate && (
            <div className="glossy-card">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Geldig vanaf
              </div>
              <p className="mt-1 text-sm font-medium">{new Date(voucher.startDate).toLocaleDateString('nl-NL')}</p>
            </div>
          )}
          {voucher.endDate && (
            <div className="glossy-card">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Geldig t/m
              </div>
              <p className="mt-1 text-sm font-medium">{new Date(voucher.endDate).toLocaleDateString('nl-NL')}</p>
            </div>
          )}
        </div>

        {/* Claim section */}
        <div className="mt-10">
          {!claimed ? (
            <div className="glossy-card">
              <h2 className="text-lg font-bold">Claim deze bon</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Vul je e-mailadres in en ontvang direct een unieke code. Toon deze code bij de ondernemer om je korting te verzilveren.
              </p>
              <div className="mt-4 flex gap-3">
                <Input
                  type="email"
                  placeholder="je@email.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleClaim()}
                  className="flex-1"
                />
                <Button
                  onClick={handleClaim}
                  disabled={!email || claimMutation.isPending}
                  className="shadow-lg shadow-primary/25"
                >
                  {claimMutation.isPending ? 'Bezig...' : 'Claim'}
                </Button>
              </div>
              {claimMutation.error && (
                <p className="mt-3 text-sm text-destructive">{claimMutation.error.message}</p>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                Gratis — geen account nodig. Je e-mail wordt alleen gebruikt om je bon te koppelen.
              </p>
            </div>
          ) : (
            <div className="glossy-card text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600">
                <Check className="h-6 w-6 text-white" />
              </div>
              <h2 className="mt-4 text-lg font-bold">Bon geclaimed!</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Toon deze code bij {voucher.businessName} om je korting te krijgen.
              </p>

              {/* Claim code display */}
              <div className="mt-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 p-6">
                <p className="text-xs font-medium uppercase tracking-widest text-emerald-600">Jouw code</p>
                <p className="mt-2 font-mono text-4xl font-bold tracking-[0.3em] text-emerald-800">
                  {claimed.claimCode}
                </p>
                <button
                  onClick={handleCopy}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-200 transition-colors"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Gekopieerd!' : 'Kopieer code'}
                </button>
              </div>

              {/* QR code */}
              <div className="mt-6">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(claimed.claimCode)}`}
                  alt={`QR code voor ${claimed.claimCode}`}
                  className="mx-auto h-48 w-48 rounded-xl"
                />
                <p className="mt-2 text-xs text-muted-foreground">Scan bij de ondernemer</p>
              </div>

              <div className="mt-6 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
                <p>Geldig t/m {claimed.expiresAt.toLocaleDateString('nl-NL')}</p>
              </div>

              <div className="mt-6">
                <Link href="/#bonnen">
                  <Button variant="outline">Meer bonnen bekijken</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
