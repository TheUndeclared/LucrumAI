"use client";

import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";

export default function HeroSectionNew() {
  return (
    <section className="flex flex-col justify-center bg-gray-100 relative w-full overflow-hidden min-h-screen dark:bg-transparent dark:gradient-section py-24 lg:py-32">
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-heading text-black dark:text-white mb-6 leading-tight"
          data-aos="fade-up"
          data-aos-delay="150"
        >
          The <span className="text-primary">AI Portfolio Manager</span> for
          Solana DeFi
        </h1>
        <p
          className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          Harness the power of dual LLMs for consensus-driven automated trading
          and yield farming. Let AI maximize your DeFi returns while you sleep.
        </p>

        <div
          className="flex flex-col sm:flex-row sm:justify-center gap-4"
          data-aos="fade-up"
          data-aos-delay="450"
        >
          <Button
            asChild
            className="w-full sm:w-auto text-base h-12 px-8 bg-primary hover:bg-primary/90 transition-all duration-300 shadow-none hover:shadow-[0_0_36.66px_rgba(0,255,135,0.55)] rounded-lg"
          >
            <Link href="https://app.lucrumai.org/">Launch App</Link>
          </Button>
          <Button
            asChild
            className="w-full sm:w-auto text-base text-primary h-12 px-8 !border-primary hover:!bg-primary transition-all duration-300 shadow-none hover:shadow-[0_0_36.66px_rgba(0,255,135,0.55)] rounded-lg"
            variant="outline"
          >
            <Link href="#">Learn More</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
