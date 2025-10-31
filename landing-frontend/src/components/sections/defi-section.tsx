import React from "react";
import { ArrowLeftRight, DatabaseZap, LucideIcon, Search } from "lucide-react";
import Counter from "../shared/counter";

interface IconListItem {
  icon: LucideIcon;
  title: string;
  description: string;
}
interface LendingRate {
  count: number;
  title: string;
  sufix: string;
}

const listItems: IconListItem[] = [
  {
    icon: Search,
    title: "Real-time Rate Scanning",
    description: "Monitor rates across all major Solana protocols",
  },
  {
    icon: ArrowLeftRight,
    title: "Arbitrage Opportunities",
    description: "Exploit price differences between protocols",
  },
  {
    icon: DatabaseZap,
    title: "Yield Optimization",
    description: "Automatically move funds to highest-yield opportunities",
  },
];

const lendingRates: LendingRate[] = [
  {
    count: 5.6,
    title: "Kamino APY",
    sufix: "%",
  },
  {
    count: 6.31,
    title: "MarginFi APY",
    sufix: "%",
  },
];

export default function DeFiSection() {
  return (
    <section
      id="deFi"
      className="py-20 bg-gray-50 bg-linear-to-l from-0% from-background to-[#111827]"
    >
      <div className="container space-y-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-6"
            data-aos="fade-up"
            data-aos-delay="150"
          >
            DeFi Arbitrage & <span className="text-primary">Lending</span>
          </h2>
          <p
            className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            Continuously scan borrowing and lending rates across protocols to
            maximize yield
          </p>
        </div>

        {/* Responsive layout */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-10 md:gap-12 px-4 sm:px-6">
          {/* List column */}
          <div className="flex-1 space-y-5">
            {listItems.map(({ icon: Icon, title, description }, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                {/* Icon */}
                <div className="flex-shrink-0 p-3 rounded-lg bg-primary/10 transform transition-transform duration-300 hover:rotate-6">
                  <Icon className="w-5 h-5 text-green-500" />
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-lg text-foreground">{title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Lending rates column */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            {lendingRates.map((rates, idx) => (
              <Counter
                key={idx}
                {...rates}
                data-aos="fade-up"
                data-aos-delay="300"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
