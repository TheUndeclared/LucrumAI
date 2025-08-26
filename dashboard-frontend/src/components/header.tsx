"use client";

import { Moon, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

// import { ConnectWalletButton } from "./wallet";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import SolanaWalletButton from "@/components/wallet/solana-wallet-button";

interface INavigationMenuItem {
  title: string;
  href: string;
}

// Navigation menu items
const menuItems: INavigationMenuItem[] = [
  {
    title: "Dashboard",
    href: "/",
  },
  {
    title: "Trading",
    href: "/trading",
  },
  {
    title: "Lending",
    href: "/lending",
  },
  {
    title: "DAO Governance",
    href: "/dao-governance",
  },
];

export default function Header() {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(true);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark", !darkMode);
  };

  return (
    <header
      className="self-start flex items-center justify-between px-6 py-4 shadow-xs border-b bg-background/90"
      // className="flex items-center justify-between px-6 py-4 shadow-md
      //   bg-gradient-to-r from-[#7efe73] via-[#009944] to-[#7efe73]
      //   bg-[length:200%_200%] animate-[gradientShift_6s_ease_infinite]
      //   dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
      //   text-white"
    >
      <Link className="flex items-center gap-2" href="/">
        <Image
          alt="LucrumAI Logo"
          className="rounded"
          height={32}
          src="/images/logo-2.png"
          width={32}
        />
        {/* <span className="text-xl text-primary drop-shadow-[0_0_8px_#7efe73]"> */}
        <span className="text-xl text-primary">LucrumAI</span>
      </Link>
      <NavigationMenu>
        <NavigationMenuList>
          {menuItems.map((item, index) => {
            const isActive = item.href === pathname;

            return (
              <NavigationMenuItem key={index}>
                <NavigationMenuLink
                  asChild
                  active={isActive}
                  className={navigationMenuTriggerStyle()}
                >
                  <Link
                    className={`relative text-lg font-semibold px-4 py-2 rounded-md transition-all duration-300 !bg-transparent ${
                      isActive
                        ? "text-primary"
                        : "dark:text-gray-200 hover:text-primary dark:hover:text-primary"
                    }`}
                    href={item.href}
                  >
                    {item.title}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex items-center gap-2">
        <Button
          // className="flex items-center gap-2 cursor-pointer"
          className="flex items-center gap-2 cursor-pointer border-primary text-primary hover:bg-primary hover:text-black hover:shadow-[0_0_10px_#7efe73]"
          variant="outline"
          onClick={toggleTheme}
        >
          {darkMode ? <Sun /> : <Moon />} Theme
        </Button>

        {/* Connect Wallet Button */}
        {/* <SolanaWalletButton /> */}
      </div>
    </header>
  );
}
