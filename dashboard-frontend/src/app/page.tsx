import { Metadata } from "next";

import SolanaBalanceChart from "@/components/charts/solana-balance-chart";
import TradingViewChart from "@/components/charts/trading-view-chart";
import Header from "@/components/header";
import CurvanceDecisionsTable from "@/components/tables/curvance-decisions-table";
import TradingDecisionsTable from "@/components/tables/trading-decisions-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, transformDecisionsData } from "@/functions";
import { getDecisions } from "@/lib/actions";
import { Progress } from "@/components/ui/progress";

export const metadata: Metadata = {
  title: "Dashboard",
};

type Feed = {
  time: string;
  source: string;
  message: string;
  color: string; // Tailwind border color
};

const feeds: Feed[] = [
  {
    time: "14:23",
    source: "Model Alpha",
    message:
      "Detected 15% yield increase in Kamino USDC pool. Recommending position increase.",
    color: "border-primary",
  },
  {
    time: "14:22",
    source: "Model Beta",
    message:
      "Confirmed: Low volatility environment supports yield farming strategy.",
    color: "border-blue-600",
  },
  {
    time: "14:20",
    source: "Risk Assessment",
    message:
      "Market conditions stable. Risk level: Medium. Proceed with caution.",
    color: "border-yellow-600",
  },
  {
    time: "14:18",
    source: "Model Alpha",
    message:
      "SOL price action suggests continued uptrend. Maintaining bullish outlook.",
    color: "border-primary",
  },
];

export default async function Page() {
  // Get decisions history
  const decisions = await getDecisions();
  const { tradingDecisions, curvanceDecisions } = transformDecisionsData(
    decisions?.data?.rows || []
  );
  // console.log("Trading Decisions:", tradingDecisions);
  // console.log("Curvance Decisions:", curvanceDecisions);

  return (
    <div
      className={cn(
        "min-h-screen grid grid-rows-[auto_1fr] text-gray-900 dark:text-foreground transition-colors"
      )}
    >
      <Header />

      {/* Main Content */}
      <main className="flex">
        <div className="w-[320px] p-6 bg-secondary space-y-4">
          <h2 className="text-xl text-primary mb-6">Portfolio Overview</h2>

          {/* Total Balance */}
          <div className="border rounded-md p-4 bg-background">
            <h3 className="text-muted-foreground text-sm">Total Balance</h3>
            <div className="text-primary text-2xl">$127,543.89</div>
            <div className="text-primary text-sm">+12.34% (24h)</div>
          </div>

          {/* 24h PnL */}
          <div className="border rounded-md p-4 bg-background">
            <h3 className="text-muted-foreground text-sm">24h PnL</h3>
            <div className="text-primary text-2xl">+$3,241.67</div>
            <div className="text-primary text-sm">+2.61%</div>
          </div>

          {/* Avg. APY */}
          <div className="border rounded-md p-4 bg-background">
            <h3 className="text-muted-foreground text-sm">Avg. APY</h3>
            <div className="text-primary text-2xl">18.7%</div>
            <div className="text-primary text-sm">Across 5 protocols</div>
          </div>
        </div>

        <div className="flex-1 border-x-1 p-4 max-w-full space-y-6">
          {/* Top Grid */}
          {/* <div
            className={cn(
              "rounded-2xl p-5 relative overflow-hidden",
              "bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800",
              "shadow-lg hover:shadow-[0_0_8px_#7efe733d] transition-all duration-400"
            )}
          >
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <span className="text-[#7efe73]">●</span> Portfolio Overview
            </h3>
            <SolanaBalanceChart />
          </div> */}

          {/* Market OHLC Chart */}
          <div
            // className="bg-muted/50 rounded-xl p-4 md:col-span-2"
            className="rounded-md border overflow-hidden"
            // className={cn(
            //   "rounded-2xl md:col-span-2 relative overflow-hidden",
            //   "bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800",
            //   "shadow-lg hover:shadow-[0_0_8px_#7efe733d] transition-all duration-400"
            // )}
          >
            {/* <OHLCPriceMetricsChart /> */}
            <TradingViewChart />
          </div>

          {/* Decisions History */}
          <div
            // className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl p-4 md:min-h-min"
            className="border rounded-md p-4 bg-secondary"
            // className={cn(
            //   "rounded-2xl p-6",
            //   "bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800",
            //   "shadow-lg hover:shadow-[0_0_8px_#7efe733d] transition-all duration-400"
            // )}
          >
            <h2 className="text-xl text-primary mb-4">Decisions History</h2>
            <Tabs className="gap-6" defaultValue="trading">
              <TabsList className="bg-gray-700/40 self-end -mt-12">
                <TabsTrigger
                  className="cursor-pointer data-[state=active]:bg-gray-900"
                  value="trading"
                >
                  Trading
                </TabsTrigger>
                <TabsTrigger
                  className="cursor-pointer data-[state=active]:bg-gray-900"
                  value="yieldFarming"
                >
                  Yield Farming
                </TabsTrigger>
              </TabsList>
              <TabsContent value="trading">
                <TradingDecisionsTable data={tradingDecisions} />
              </TabsContent>
              <TabsContent value="yieldFarming">
                <CurvanceDecisionsTable data={curvanceDecisions} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="w-[320px] p-6 bg-secondary space-y-4">
          <h2 className="text-xl text-primary mb-6">AI Insights</h2>

          {/* Model Consensus */}
          <div className="border rounded-md p-4 bg-background">
            <h3 className="text-muted-foreground mb-3">Model Consensus</h3>
            <p className="text-gray-300 text-sm">
              Both models recommend increasing exposure to Kamino protocol due
              to favorable market conditions.
            </p>
          </div>

          {/* Confidence Score */}
          <div className="border rounded-md p-4 bg-background">
            <h3 className="text-muted-foreground mb-3">Confidence Score</h3>
            <div className="flex items-center gap-3">
              {/* Percentage */}
              <span className="text-xl text-primary">87%</span>

              {/* Progress Bar */}
              <Progress
                className="h-2 flex-1 bg-muted dark:bg-[#374151] [&_[data-slot=progress-indicator]]:bg-primary [&_[data-slot=progress-indicator]]:bg-linear-0"
                value={87}
              />
            </div>
          </div>

          {/* Live Reasoning Feed */}
          <div className="border rounded-md p-4 bg-background">
            <h3 className="text-primary text-lg mb-3.5">Live Reasoning Feed</h3>

            {/* Feeds */}
            <div className="space-y-4">
              {feeds.map((feed, index) => (
                <div key={index} className={`border-l-2 pl-3.5 ${feed.color}`}>
                  <div className="text-xs text-muted-foreground">
                    {feed.time} - {feed.source}
                  </div>
                  <div className="text-sm text-white">{feed.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
