"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/", label: "Usuarios", match: (path: string) => path === "/" || path.startsWith("/users") },
  { href: "/journeys", label: "Journeys", match: (path: string) => path.startsWith("/journeys") },
  { href: "/macros", label: "Macros", match: (path: string) => path.startsWith("/macros") },
  { href: "/noun-packs", label: "Noun packs", match: (path: string) => path.startsWith("/noun-packs") },
  { href: "/words", label: "Palabras", match: (path: string) => path.startsWith("/words") },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1">
      {LINKS.map((link) => {
        const active = link.match(pathname)
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors hover:text-foreground",
              active ? "bg-muted font-medium text-foreground" : "text-muted-foreground"
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
