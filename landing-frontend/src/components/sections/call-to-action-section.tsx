import React from "react";
import Link from "next/link";

import { Button } from "../ui/button";

export default function CallToActionSection() {
  return (
    <section className="py-20 bg-gray-50 bg-linear-to-l from-0% from-background to-[#111827]">
      <div className="container space-y-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2
            className="text-5xl font-heading text-foreground mb-6"
            data-aos="fade-up"
            data-aos-delay="150"
          >
            Ready to <span className="text-primary">Maximize</span> Your DeFi
            Returns?
          </h2>
          <p
            className="text-xl text-secondary-foreground dark:text-gray-300 mb-8"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            Join the future of automated DeFi trading with LucrumAI&apos;s
            consensus-driven AI system
          </p>
        </div>

        <div
          className="flex flex-col sm:flex-row sm:justify-center gap-4"
          data-aos="fade-up"
          data-aos-delay="450"
        >
          <Button
            asChild
            className="inline-flex text-base h-12 px-8 bg-primary hover:bg-primary/90 transition-all duration-300 shadow-none hover:shadow-[0_0_36.66px_rgba(0,255,135,0.55)]"
          >
            <Link href="https://monetai.monadai.xyz/">Launch App Now</Link>
          </Button>
          <Button
            asChild
            className="inline-flex text-base text-primary h-12 px-8 !border-primary hover:!bg-primary transition-all duration-300 shadow-none hover:shadow-[0_0_36.66px_rgba(0,255,135,0.55)]"
            variant="outline"
          >
            <Link href="#">View Documentation</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
