"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-10 lg:top-8">
      <div className="container">
        <div className="flex items-center justify-between gap-4 bg-blue-600/20 backdrop-blur-md sm:px-6 lg:bg-blue-600/10 border border-blue-600/30 rounded-2xl py-2 shadow-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-[1_0_auto]">
            <Image src="/images/logo.png" width={32} height={32} alt="MonetAI Logo" />
            <strong className="text-base text-gray-800 dark:text-white font-semibold">MonetAI</strong>
          </Link>

          {/* Buttons */}
          <div className="flex gap-2">
            <Link
              className="bg-primary text-white px-3 py-1.5 sm:px-5 sm:py-2 rounded-lg shadow-sm hover:shadow-lg"
              href="https://monetai.monadai.xyz/"
            >
              Launch App
            </Link>
            <Link
              className="bg-white text-blue-600 border border-blue-600 px-3 py-1.5 sm:px-5 sm:py-2 rounded-lg shadow-sm hover:bg-blue-50 hover:shadow-lg"
              href="https://github.com/MonadAI-xyz/monetai"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
