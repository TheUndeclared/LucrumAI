'use client'

import Cookies from 'js-cookie'
import { MenuIcon, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import { SolanaWalletButton } from '@/components/wallet'

interface INavigationMenuItem {
  title: string
  href: string
  disabled?: boolean
}

export default function Header() {
  const pathname = usePathname()
  const [authToken, setAuthToken] = useState<string | undefined>(undefined)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const token = Cookies.get('authToken')
    setAuthToken(token)
  }, [])

  const menuItems: INavigationMenuItem[] = [
    { title: 'Dashboard', href: '/' },
    // { title: 'Trading', href: '/trading' },
    // { title: 'Lending', href: '/lending' },
    {
      title: 'DAO Governance (Coming soon)',
      href: '/dao-governance',
      disabled: true,
    },
    { title: 'Profile', href: '/profile' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 w-full overflow-hidden z-50 bg-background/90 backdrop-blur-sm border-b shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 mx-auto">
        {/* Logo */}
        <Link className="flex items-center gap-2 flex-shrink-0" href="/">
          <Image
            alt="LucrumAI Logo"
            height={32}
            src="/images/logo-2.png"
            width={32}
          />
          <span className="text-xl text-primary font-semibold">LucrumAI</span>
        </Link>

        {/* Desktop Navigation for lg and above */}
        <div className="hidden lg:flex items-center gap-4 overflow-x-auto max-w-[calc(100%-200px)]">
          {mounted && (
            <NavigationMenu>
              <NavigationMenuList className="flex gap-2">
                {menuItems.map((item, index) => {
                  const isActive = item.href === pathname
                  return (
                    <NavigationMenuItem key={index}>
                      <NavigationMenuLink asChild active={isActive}>
                        <Link
                          aria-disabled={item.disabled}
                          className={`relative text-lg font-semibold px-4 py-2 rounded-md transition-all duration-300 whitespace-nowrap ${
                            isActive
                              ? 'text-primary'
                              : 'dark:text-gray-200 '
                          } ${
                            item.disabled &&
                            'text-muted-foreground dark:text-muted-foreground cursor-not-allowed pointer-events-none'
                          }`}
                          href={item.href}
                        >
                          {item.title}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  )
                })}
              </NavigationMenuList>
            </NavigationMenu>
          )}
        </div>

        {/* Right section: Wallet + Hamburger for tablets and mobile */}
        <div className="flex items-center gap-2">
          {/* Desktop Wallet (lg+) */}
          {mounted && (
            <div className="hidden lg:block flex-shrink-0">
              <SolanaWalletButton />
            </div>
          )}

          {/* Hamburger Menu (below lg) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button aria-label="Open menu" className="lg:hidden p-2" variant="ghost">
                <MenuIcon className="w-6 h-6 text-primary" />
              </Button>
            </SheetTrigger>

            {/* Hide the built-in (default) close button and use our custom one */}
            <SheetContent
              className="bg-background/95 p-6 flex flex-col gap-6 w-full max-w-xs [&>button]:hidden"
              side="right"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-semibold text-primary">Menu</span>

                {/* Use SheetClose inside the drawer (not SheetTrigger) */}
                <SheetClose asChild>
                  <Button aria-label="Close menu" className="p-2" variant="ghost">
                    <X className="w-6 h-6 text-primary" />
                  </Button>
                </SheetClose>
              </div>

              {/* Menu Items — close the sheet when a link is tapped */}
              <nav className="flex flex-col gap-4">
                {menuItems.map((item, idx) => {
                  const isActive = item.href === pathname
                  return (
                    <SheetClose key={idx} asChild>
                      <Link
                        aria-disabled={item.disabled}
                        className={`px-4 py-2 rounded-md text-lg font-medium whitespace-nowrap ${
                          isActive
                            ? 'text-primary'
                            : 'text-gray-200 hover:text-primary'
                        } ${item.disabled && 'text-muted-foreground cursor-not-allowed pointer-events-none'}`}
                        href={item.href}
                        tabIndex={item.disabled ? -1 : 0}
                      >
                        {item.title}
                      </Link>
                    </SheetClose>
                  )
                })}
              </nav>

              {/* Mobile/Tablet Wallet */}
              {mounted && <SolanaWalletButton />}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
