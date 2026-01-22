'use client'

/**
 * Header component with navigation
 * Includes logo, search, and navigation with cart.
 */
import Link from 'next/link'
import { Nav } from './Nav'
import { Cart } from './Cart'
import { Search } from './Search'

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-8xl px-4">
        <div className="flex h-14 items-center justify-between gap-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tight text-primary">
              Full-Stack Shop
            </span>
          </Link>
          <div className="hidden flex-1 justify-center md:flex">
            <Search />
          </div>
          <Nav />
        </div>
      </div>
      <Cart />
    </header>
  )
}
