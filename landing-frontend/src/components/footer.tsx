import React from "react";
import Link from "next/link";
import { Github, Twitter } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-background py-6 border-t border-primary/20">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <Image
              src="/images/logo-2.png"
              width={28}
              height={28}
              alt="LucrumAI Logo"
            />
            <span className="text-primary text-base font-heading">
              LucrumAI
            </span>
          </Link>
          <p className="text-muted-foreground text-sm mb-4 md:mb-0">
            © {currentYear} <span className="font-heading">LucrumAI</span>. All
            rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link
              href="https://twitter.com/MonetAI_xyz"
              className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
            >
              <Twitter />
            </Link>
            <Link
              href="https://github.com/MonadAI-xyz/monetai"
              className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
            >
              <Github />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
