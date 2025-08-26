import React from "react";
import Link from "next/link";
import { Github, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400 mb-4 md:mb-0">
            © 2025 MonetAI. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link
              href="https://twitter.com/MonetAI_xyz"
              className="text-gray-600 dark:text-gray-400 hover:text-primary"
            >
              <Twitter />
            </Link>
            <Link
              href="https://github.com/MonadAI-xyz/monetai"
              className="text-gray-600 dark:text-gray-400 hover:text-primary"
            >
              <Github />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
