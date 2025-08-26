import React from "react";
import Image from "next/image";

interface Partner {
  src: string;
  title: string;
}

// Partners
const partners: Partner[] = [
  {
    src: "/images/kamino.png",
    title: "Kamino",
  },
  {
    src: "/images/privy.png",
    title: "Privy",
  },
  {
    src: "/images/marginfi.jpeg",
    title: "MarginFi",
  },
  {
    src: "/images/raydium.png",
    title: "Raydium",
  },
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
            className="text-5xl font-heading text-foreground mb-6"
            data-aos="fade-up"
            data-aos-delay="150"
          >
            Integrations & <span className="text-primary">Partnerships</span>
          </h2>
          {/* <p
            className="text-xl text-secondary-foreground dark:text-gray-300 mb-8"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            Your keys, your crypto. AI trades on your behalf with customizable
            risk settings
          </p> */}
        </div>

        {/* Cards */}
        <div className="flex gap-8">
          {partners.map(({ src, title }, idx) => (
            <div
              key={idx}
              className={`border border-primary/30 rounded-xl py-4 px-5 flex-1 flex items-center gap-4`}
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="size-8 bg-primary/10 rounded-full overflow-hidden">
                <Image
                  className="size-full"
                  src={src}
                  width={32}
                  height={32}
                  alt={`${title} icon`}
                />
              </div>
              <h3 className="text-xl text-primary">{title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
