import React from "react";
import {
  ArrowLeftRight,
  Brain,
  CandlestickChart,
  LucideIcon,
  TrendingUp,
} from "lucide-react";

interface HowItWorkStep {
  icon: LucideIcon;
  title: string;
  description: string;
}

// How it works steps
const steps: HowItWorkStep[] = [
  {
    icon: CandlestickChart,
    title: "Market Data",
    description:
      "Continuously fetch real-time market data from multiple Solana DeFi protocols.",
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description:
      "Dual LLMs analyze opportunities and must reach consensus before execution.",
  },
  {
    icon: ArrowLeftRight,
    title: "Execute Trades",
    description:
      "Automatically execute optimal trades and yield farming strategies.",
  },
  {
    icon: TrendingUp,
    title: "Maximize Yield",
    description: "Continuously optimize your portfolio for maximum returns.",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="howItWorks"
      className="py-20 bg-gray-50 bg-linear-to-r from-0% from-background to-[#111827]"
    >
      <div className="container space-y-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2
            className="text-5xl font-heading text-foreground mb-6"
            data-aos="fade-up"
            data-aos-delay="150"
          >
            How It <span className="text-primary">Works</span>
          </h2>
          <p
            className="text-xl text-gray-700 dark:text-gray-300 mb-8"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            Our AI-powered system continuously monitors markets and executes
            optimal trading strategies
          </p>
        </div>

        {/* Cards */}
        <div className="flex gap-8">
          {steps.map(({ icon: Icon, title, description }, idx) => (
            <div
              key={idx}
              className={`relative bg-secondary border border-primary/30 rounded-xl p-8 flex-1 flex flex-col items-center gap-4 
              ${
                idx < steps.length - 1
                  ? "after:content-[''] after:absolute after:top-1/2 after:-right-4 after:w-8 after:border-t-2 after:border-primary"
                  : ""
              }`}
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="p-5 bg-primary/10 rounded-full mb-2 transform transition-transform duration-300 hover:rotate-6">
                <Icon className="size-8 text-primary" />
              </div>
              <h3 className="text-xl text-white">{title}</h3>
              <p className="text-sm text-secondary-foreground text-center leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
