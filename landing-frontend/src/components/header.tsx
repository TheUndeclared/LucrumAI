"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";

interface INavigationMenuItem {
  title: string;
  href: string;
}

// Navigation menu items
const menuItems: INavigationMenuItem[] = [
  {
    title: "How It Works",
    href: "/#howItWorks",
  },
  {
    title: "AI Engine",
    href: "/#aiEngine",
  },
  {
    title: "DeFi",
    href: "/#deFi",
  },
  {
    title: "Wallets",
    href: "/#wallets",
  },
];

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-10 border-b border-primary/20 bg-background/90 backdrop-blur-sm">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo-2.png"
            width={32}
            height={32}
            alt="LucrumAI Logo"
          />
          <span className="text-primary text-xl font-heading">LucrumAI</span>
        </Link>

        {/* Center: Desktop Navigation */}
        <div className="hidden md:flex flex-1 justify-center">
          <NavigationMenu>
            <NavigationMenuList>
              {menuItems.map((item, index) => (
                <NavigationMenuItem key={index}>
                  <NavigationMenuLink asChild>
                    <Link
                      className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                      href={item.href}
                    >
                      {item.title}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right: CTA + Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* Desktop CTA */}
          <Button
            asChild
            className="hidden sm:inline-flex bg-primary text-black hover:bg-primary/90"
          >
            <Link href="https://app.lucrumai.org/">Launch App</Link>
          </Button>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white"
              >
                <MenuIcon className="h-6 w-6" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="bg-[rgba(0,0,0,0.95)] text-white p-6 h-full flex flex-col justify-start"
            >
              <nav className="flex flex-col gap-6 mt-4 text-lg">
                {menuItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="hover:text-primary transition-colors duration-200"
                  >
                    {item.title}
                  </Link>
                ))}

                {/* Mobile CTA */}
                <Button
                  asChild
                  className="mt-6 w-full rounded-lg bg-primary text-black hover:bg-primary/90 transition-colors duration-200"
                >
                  <Link
                    href="https://monetai.monadai.xyz/"
                    className="w-full text-center py-2"
                  >
                    Launch App
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
