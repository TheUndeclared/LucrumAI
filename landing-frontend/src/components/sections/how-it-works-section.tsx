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
      className="py-20 bg-gray-50 dark:bg-gray-900"
    >
      <div className="container space-y-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2
            className="text-4xl sm:text-5xl font-heading text-foreground mb-6"
            data-aos="fade-up"
            data-aos-delay="150"
          >
            How It <span className="text-primary">Works</span>
          </h2>
          <p
            className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-8"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            Our AI-powered system continuously monitors markets and executes
            optimal trading strategies
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col md:flex-row md:flex-wrap gap-6 px-4 sm:px-6">
          {steps.map(({ icon: Icon, title, description }, idx) => (
            <div
              key={idx}
              className="relative bg-secondary border border-primary/30 rounded-xl p-6 sm:p-8 flex-1 flex flex-col items-center gap-4"
              data-aos="fade-up"
              data-aos-delay={300 + idx * 100}
            >
              <div className="p-4 sm:p-5 bg-primary/10 rounded-full mb-2 transform transition-transform duration-300 hover:rotate-6">
                <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl text-white text-center">{title}</h3>
              <p className="text-sm sm:text-base text-secondary-foreground text-center leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
