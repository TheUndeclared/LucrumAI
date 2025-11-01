import { Metadata } from "next";

import CustodialWalletSection from "@/components/common/custodial-wallet-section";
import RefreshProfileButton from "@/components/common/refresh-profile-button";
import Header from "@/components/header";
import ClientLendingHistoryTable from "@/components/tables/client-lending-history-table";
import ClientTradingHistoryTable from "@/components/tables/client-trading-history-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/functions";

export const metadata: Metadata = {
  title: "Profile",
};

export default function Page() {
  return (
    <div
      className={cn(
        "min-h-screen grid grid-rows-[auto_1fr] text-gray-900 dark:text-foreground transition-colors"
      )}
    >
      <Header />

      {/* Main Content */}
      <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-16">
        {/* Responsive layout: stack on mobile, 2-col on lg+ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar / Portfolio Overview */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="rounded-xl bg-secondary p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl text-primary">Portfolio Overview</h2>
                <RefreshProfileButton />
              </div>
              <CustodialWalletSection />
            </div>
          </aside>

          {/* Content */}
          <section className="lg:col-span-8 xl:col-span-9">
            <div className="rounded-xl border bg-secondary p-4 sm:p-6 space-y-4">
              <h2 className="text-lg sm:text-xl text-primary">Transaction History</h2>

              <Tabs className="w-full" defaultValue="trading">
                {/* Responsive Tabs: grid (mobile) → inline (md+) */}
                <TabsList className="w-full bg-gray-700/40 p-1 rounded-lg grid grid-cols-2 gap-1 md:inline-flex md:w-auto">
                  <TabsTrigger
                    className="cursor-pointer data-[state=active]:bg-gray-900 rounded-md px-3 py-2 text-sm md:text-base"
                    value="trading"
                  >
                    Trading Transaction History
                  </TabsTrigger>
                  <TabsTrigger
                    className="cursor-pointer data-[state=active]:bg-gray-900 rounded-md px-3 py-2 text-sm md:text-base"
                    value="yieldFarming"
                  >
                    Yield Farming
                  </TabsTrigger>
                </TabsList>

                <TabsContent className="mt-4" value="trading">
                  {/* Make tables scroll on small screens to avoid overflow */}
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="min-w-[640px] sm:min-w-0 px-4 sm:px-0">
                      <ClientTradingHistoryTable />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent className="mt-4" value="yieldFarming">
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="min-w-[640px] sm:min-w-0 px-4 sm:px-0">
                      <ClientLendingHistoryTable />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
