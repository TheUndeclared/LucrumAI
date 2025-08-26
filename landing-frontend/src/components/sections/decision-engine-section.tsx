import { Brain, Handshake, LucideIcon } from "lucide-react";
import React from "react";

interface Decision {
  icon: LucideIcon;
  title: string;
  description: string;
  disabledCard?: boolean;
}

// Decisions Engine list
const decisions: Decision[] = [
  {
    icon: Brain,
    title: "LLM Alpha",
    description: "Risk Assessment & Market Analysis",
  },
  {
    icon: Handshake,
    title: "Consensus Required",
    description: "Both AIs must agree before execution",
    disabledCard: true,
  },
  {
    icon: Brain,
    title: "LLM Beta",
    description: "Strategy Optimization & Validation",
  },
];

export default function DecisionEngineSection() {
  return (
    <section id="aiEngine" className="py-20">
      <div className="container space-y-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2
            className="text-5xl font-heading text-foreground mb-6"
            data-aos="fade-up"
            data-aos-delay="150"
          >
            AI Decision <span className="text-primary">Engine</span>
          </h2>
          <p
            className="text-xl text-gray-700 dark:text-gray-300 mb-8"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            Two independent LLMs debate and must reach consensus before any
            transaction
          </p>
        </div>

        {/* Cards */}
        <div className="flex items-start gap-8">
          {decisions.map(
            ({ icon: Icon, title, description, disabledCard }, idx) => (
              <div
                key={idx}
                className={`${
                  !disabledCard &&
                  "gradient-section border border-primary/30 rounded-xl py-8"
                } px-8 flex-1 flex flex-col items-center gap-2`}
                data-aos="fade-up"
                data-aos-delay="300"
              >
                {!disabledCard ? (
                  <Icon className="size-8 text-primary" />
                ) : (
                  <div className="p-5 border-2 border-primary rounded-full mb-2 transform transition-transform duration-300 hover:rotate-6">
                    <Icon className="size-8 text-primary" />
                  </div>
                )}

                <h3
                  className={`text-xl ${
                    !disabledCard ? "text-white" : "text-primary"
                  }`}
                >
                  {title}
                </h3>
                <p className="text-sm text-secondary-foreground text-center leading-relaxed">
                  {description}
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
