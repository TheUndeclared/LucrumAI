import React from "react";
import Image from "next/image";

interface Partner {
  src: string;
  title: string;
}

const partners: Partner[] = [
  { src: "/images/kamino.png", title: "Kamino" },
  { src: "/images/privy.png", title: "Privy" },
  { src: "/images/marginfi.jpeg", title: "MarginFi" },
  { src: "/images/raydium.png", title: "Raydium" },
];

export default function IntegrationsAndPartnershipsSection() {
  return (
    <section
      id="integrationsAndPartnerships"
      className="py-20 gradient-section"
    >
      <div className="container space-y-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2
            className="text-4xl sm:text-5xl font-heading text-foreground mb-6"
            data-aos="fade-up"
            data-aos-delay="150"
          >
            Integrations & <span className="text-primary">Partnerships</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6 px-4 sm:px-6">
          {partners.map(({ src, title }, idx) => (
            <div
              key={idx}
              className="border border-primary/30 rounded-xl py-4 px-5 flex-1 flex items-center gap-4 min-w-[180px] sm:min-w-[200px]"
              data-aos="fade-up"
              data-aos-delay={300 + idx * 100}
            >
              <div className="w-10 h-10 bg-primary/10 rounded-full overflow-hidden flex items-center justify-center">
                <Image
                  className="w-full h-full object-contain"
                  src={src}
                  width={32}
                  height={32}
                  alt={`${title} icon`}
                />
              </div>
              <h3 className="text-lg sm:text-xl text-primary">{title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
