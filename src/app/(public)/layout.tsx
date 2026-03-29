import Link from 'next/link'
import { TreePine } from 'lucide-react'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <nav className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <TreePine className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Oom Gerrit</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/vouchers" className="hover:text-foreground transition-colors">Bonnen</Link>
            <Link href="/about" className="hover:text-foreground transition-colors">Over ons</Link>
            <Link href="/business/register" className="hover:text-foreground transition-colors">Voor ondernemers</Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4">{children}</main>
    </div>
  )
}
