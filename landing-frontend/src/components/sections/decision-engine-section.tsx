import { Brain, Handshake, LucideIcon } from "lucide-react";
import React from "react";

interface Decision {
  icon: LucideIcon;
  title: string;
  description: string;
  disabledCard?: boolean;
}

const decisions: Decision[] = [
  { icon: Brain, title: "LLM Alpha", description: "Risk Assessment & Market Analysis" },
  { icon: Handshake, title: "Consensus Required", description: "Both AIs must agree before execution", disabledCard: true },
  { icon: Brain, title: "LLM Beta", description: "Strategy Optimization & Validation" },
];

export default function DecisionEngineSection() {
  return (
    <section id="aiEngine" className="py-20">
      <div className="container space-y-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-heading text-foreground mb-6"
            data-aos="fade-up"
            data-aos-delay="150"
          >
            AI Decision <span className="text-primary">Engine</span>
          </h2>
          <p
            className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            Two independent LLMs debate and must reach consensus before any transaction
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col md:flex-row gap-6 px-4 sm:px-6">
          {decisions.map(({ icon: Icon, title, description, disabledCard }, idx) => (
            <div
              key={idx}
              className={`${
                !disabledCard ? "gradient-section border border-primary/30 rounded-xl py-6 sm:py-8" : "border-2 border-primary rounded-xl py-6 sm:py-8"
              } px-6 flex-1 flex flex-col items-center gap-3`}
              data-aos="fade-up"
              data-aos-delay={300 + idx * 100}
            >
              {!disabledCard ? (
                <Icon className="w-10 h-10 text-primary" />
              ) : (
                <div className="p-4 sm:p-5 border-2 border-primary rounded-full mb-2 transform transition-transform duration-300 hover:rotate-6">
                  <Icon className="w-10 h-10 text-primary" />
                </div>
              )}

              <h3 className={`text-lg sm:text-xl ${!disabledCard ? "text-white" : "text-primary"} text-center`}>
                {title}
              </h3>
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
