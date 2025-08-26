import Image from "next/image";
import Link from "next/link";
import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import Footer from "@/components/footer";
import { features } from "@/data/features";
import { whyChooseItems } from "@/data/why-choose-us";

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr] min-h-screen">
      <Header />
      <main className="row-start-2 pb-6">
        <HeroSection />

        {/* Features Grid */}
        {/* <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Key Features</h2>
              <p className="text-gray-600 dark:text-gray-400">
                MonetAI combines AI, automation, and DeFi expertise to deliver a
                comprehensive trading solution
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4">
                  AI-Powered Trading
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Integrates predictive analytics and sentiment analysis to
                  optimize trading decisions in real-time.
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4">
                  Portfolio Management
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Automated risk management, asset rebalancing, and yield
                  maximization strategies.
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4">DAO Governance</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Token holders can propose and vote on changes to risk
                  management and trading strategies.
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4">
                  Real-Time Analytics
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Live market data feeds and automated trade insights for
                  informed decision-making.
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4">
                  Multi-Chain Ready
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Built for expansion to multiple chains while leveraging
                  Monad&apos;s high-performance infrastructure.
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4">
                  Automated Trading
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Set up automated trading strategies that execute trades based
                  on predefined conditions.
                </p>
              </div>
            </div>
          </div>
        </section> */}

        {/* Key Features */}
        <section>
          <div className="flex flex-wrap items-center">
            {/* Left Image */}
            <div className="w-1/3">
              <Image
                src="/images/feature-02.webp"
                alt="SolTradeAI Mobile App showing few crypto trading bots running in action"
                height={100}
                width={100}
                className="w-full h-auto"
              />
            </div>

            {/* Features Content */}
            <div className="w-2/3 py-12 pr-4 pl-28 lg:pl-16">
              <div className="max-w-4xl pb-4">
                <h6
                  className="text-sm font-semibold text-gray-500 mb-2"
                  data-aos="fade-up"
                  data-aos-delay="10"
                >
                  KEY FEATURES
                </h6>
                <h2
                  className="mb-12 text-3xl font-bold text-black dark:text-white"
                  data-aos="fade-up"
                  data-aos-delay="150"
                >
                  MonetAI Combines AI, Automation, and DeFi Expertise To Deliver
                  A Comprehensive Trading Solution
                </h2>

                {/* Dynamic List */}
                <ul className="flex flex-wrap -mx-4">
                  {features.map((feature) => (
                    <li
                      key={feature.id}
                      className="w-full sm:w-1/2 px-4 mb-8"
                      data-aos="fade-up"
                      data-aos-delay="150"
                    >
                      <div className="bg-white dark:bg-gray-800 rounded-2xl border shadow-md p-6 flex items-start transition-transform transform hover:scale-102 hover:shadow-xl duration-300">
                        <div className="size-20 rounded-full flex items-center justify-center mr-5 flex-[0_0_80px] bg-gray-800">
                          <Image
                            src={feature.icon}
                            alt={feature.alt}
                            height={50}
                            width={50}
                          />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-3">
                            {feature.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 font-normal leading-5 max-w-[250px]">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2
                className="text-3xl font-bold mb-4"
                data-aos="fade-up"
                data-aos-delay="150"
              >
                How It Works
              </h2>
              <p
                className="text-gray-600 dark:text-gray-400"
                data-aos="fade-up"
                data-aos-delay="150"
              >
                Get started with MonetAI in just a few simple steps
              </p>
            </div>
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              data-aos="fade-up"
              data-aos-delay="150"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Connect Wallet</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Connect your Web3 Monad Native wallet to get started.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Fund Account</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Load your account with tokens on the Monad chain.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Configure AI</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Set your trading preferences and risk parameters.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  4
                </div>
                <h3 className="text-xl font-semibold mb-2">Start Trading</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Let the AI agent trade autonomously on your behalf.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-24 bg-gradient-to-b from-gray-100 to-transparent dark:from-gray-800 dark:to-gray-900 transition-colors duration-300">
          <div className="container px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Left Heading */}
              <div
                className="flex items-center lg:items-start justify-center lg:justify-start"
                data-aos="fade-up"
                data-aos-delay="150"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white leading-tight mt-5">
                  Why Choose SolTradeAI?
                </h2>
              </div>

              {/* Dynamic Choose Items */}
              {whyChooseItems.map((item) => (
                <div
                  key={item.id}
                  className="border bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-xl transform hover:scale-102 transition-all duration-300"
                  data-aos="fade-up"
                  data-aos-delay="150"
                >
                  {/* Icon Circle */}
                  <div className="size-20 rounded-full flex items-center justify-center mb-4 bg-blue-600 transform transition-transform duration-300 hover:rotate-6">
                    <Image
                      src={item.icon}
                      alt={item.alt}
                      width={40}
                      height={40}
                    />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-5">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2
                className="text-3xl font-bold mb-4"
                data-aos="fade-up"
                data-aos-delay="150"
              >
                Ready to Get Started?
              </h2>
              <p
                className="text-gray-600 dark:text-gray-400 mb-8"
                data-aos="fade-up"
                data-aos-delay="150"
              >
                Join the future of AI-powered DeFi trading on Monad
              </p>
              <Link
                href="https://monetai.monadai.xyz/"
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-lg"
                data-aos="fade-up"
                data-aos-delay="150"
              >
                Launch MonetAI
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
