import Link from 'next/link'
import { TreePine } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <nav className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2">
            <TreePine className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Oom Gerrit</span>
          </Link>
        </div>
      </nav>
      <main className="container mx-auto p-4">{children}</main>
    </div>
  )
}
