"use client";

import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";

export default function HeroSectionNew() {
  return (
    <>
      <section className="flex flex-col justify-center bg-gray-100 relative w-full overflow-hidden min-h-screen dark:bg-transparent dark:gradient-section py-[100px] lg:py-32">
        {/* Particles */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1
            className="text-8xl font-heading text-black dark:text-white mb-6"
            data-aos="fade-up"
            data-aos-delay="150"
          >
            The <span className="text-primary">AI Portfolio Manager</span> for
            Solana DeFi
          </h1>
          <p
            className="text-2xl text-gray-700 dark:text-gray-300 mb-8"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            Harness the power of dual LLMs for consensus-driven automated
            trading and yield farming. Let AI maximize your DeFi returns while
            you sleep.
          </p>
          <div
            className="flex flex-col sm:flex-row sm:justify-center gap-4"
            data-aos="fade-up"
            data-aos-delay="450"
          >
            <Button
              asChild
              className="inline-flex text-base h-12 px-8 bg-primary hover:bg-primary/90 transition-all duration-300 shadow-none hover:shadow-[0_0_36.66px_rgba(0,255,135,0.55)]"
            >
              <Link href="https://monetai.monadai.xyz/">Launch App</Link>
            </Button>
            <Button
              asChild
              className="inline-flex text-base text-primary h-12 px-8 !border-primary hover:!bg-primary transition-all duration-300 shadow-none hover:shadow-[0_0_36.66px_rgba(0,255,135,0.55)]"
              variant="outline"
            >
              <Link href="#">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
