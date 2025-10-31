import React from "react";
import { Bot, LucideIcon, ShieldHalf, SlidersHorizontal } from "lucide-react";

interface HowItWorkStep {
  icon: LucideIcon;
  title: string;
  description: string;
}

const steps: HowItWorkStep[] = [
  {
    icon: ShieldHalf,
    title: "Full Control",
    description:
      "You maintain complete ownership of your private keys and funds.",
  },
  {
    icon: SlidersHorizontal,
    title: "Risk Settings",
    description:
      "Customize AI behavior with your preferred risk tolerance levels.",
  },
  {
    icon: Bot,
    title: "AI Trading",
    description:
      "Let AI execute optimal strategies while you retain full custody.",
  },
];

export default function WalletsSection() {
  return (
    <section
      id="wallets"
      className="py-20 bg-gray-50 dark:bg-gray-900"
    >
      <div className="container space-y-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-6"
            data-aos="fade-up"
            data-aos-delay="150"
          >
            Non-Custodial <span className="text-primary">Wallets</span>
          </h2>
          <p
            className="text-base sm:text-lg md:text-xl text-secondary-foreground dark:text-gray-300 mb-8"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            Your keys, your crypto. AI trades on your behalf with customizable
            risk settings
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-6 px-4 sm:px-6">
          {steps.map(({ icon: Icon, title, description }, idx) => (
            <div
              key={idx}
              className="relative bg-secondary border border-primary/30 rounded-xl p-6 sm:p-8 flex-1 flex flex-col items-center gap-4 min-w-[200px]"
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
