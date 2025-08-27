import { Metadata } from "next";

import ProtocolAllocationChart from "@/components/charts/protocol-allocation-chart";
import TradingViewChart from "@/components/charts/trading-view-chart";
import Header from "@/components/header";
import CurvanceDecisionsTable from "@/components/tables/curvance-decisions-table";
import TradingDecisionsTable from "@/components/tables/trading-decisions-table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, transformDecisionsData } from "@/functions";
import { getDecisions, getTradingMetrics } from "@/lib/actions";
import LiveReasoningFeed from "@/components/common/live-reasoning-feed";

export const metadata: Metadata = {
  title: "Profile",
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
  const [decisionsResult, metricsResult] = await Promise.allSettled([
    getDecisions(),
    getTradingMetrics(),
  ]);

  let tradingDecisions = [];
  let curvanceDecisions = [];
  let averageAPY, pnl24Hours, totalBalanceTraded24h;

  // Decisions History
  if (decisionsResult.status === "fulfilled") {
    const { tradingDecisions: t, curvanceDecisions: c } =
      transformDecisionsData(decisionsResult.value?.data?.rows || []);
    tradingDecisions = t;
    curvanceDecisions = c;
  }

  // Trading Metrics
  if (metricsResult.status === "fulfilled") {
    ({ averageAPY, pnl24Hours, totalBalanceTraded24h } =
      metricsResult.value?.data?.data);
  }

  console.log("Trading Decisions:", tradingDecisions);
  console.log("Curvance Decisions:", curvanceDecisions);
  console.log({ averageAPY, pnl24Hours, totalBalanceTraded24h });

  const confidenceScore =
    tradingDecisions?.[0]?.confidence === "LOW"
      ? 30
      : tradingDecisions?.[0]?.confidence === "HIGH"
        ? 80
        : 0;

  const liveReasoningFeed: Feed[] = tradingDecisions
    .slice(0, 4)
    .map((decision) => ({
      time: new Date(decision.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // force 24h format
      }),
      source: decision.pair,
      message: decision.technicalAnalysis,
      color:
        decision.confidence === "HIGH"
          ? "border-primary"
          : decision.confidence === "MEDIUM"
            ? "border-blue-600"
            : "border-yellow-600",
    }));

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
            <h3 className="text-muted-foreground text-sm">
              Total Balance Traded
            </h3>
            <div className="text-primary text-2xl">
              ${totalBalanceTraded24h || 0}
            </div>
            {/* <div className="text-primary text-sm">+12.34% (24h)</div> */}
          </div>

          {/* 24h PnL */}
          <div className="border rounded-md p-4 bg-background">
            <h3 className="text-muted-foreground text-sm">24h PnL</h3>
            <div className="text-primary text-2xl">+${pnl24Hours || 0}</div>
            {/* <div className="text-primary text-sm">+2.61%</div> */}
          </div>

          {/* Avg. APY */}
          <div className="border rounded-md p-4 bg-background">
            <h3 className="text-muted-foreground text-sm">Avg. APY</h3>
            <div className="text-primary text-2xl">{averageAPY || 0}%</div>
            {/* <div className="text-primary text-sm">Across 5 protocols</div> */}
            <div className="text-primary text-sm">Against 1 protocol</div>
          </div>

          {/* Protocol Allocation */}
          <ProtocolAllocationChart />
        </div>

        <div className="flex-1 border-x-1 p-4 max-w-full space-y-6">
          {/* Decisions History */}
          {/* <DecisionsHistory
            curvanceDecisions={curvanceDecisions}
            tradingDecisions={tradingDecisions}
          /> */}
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
              {tradingDecisions?.[0]?.modelAgreement || "N/A"}
            </p>
          </div>

          {/* Confidence Score */}
          <div className="border rounded-md p-4 bg-background">
            <h3 className="text-muted-foreground mb-3">Confidence Score</h3>
            <div className="flex items-center gap-3">
              {/* Percentage */}
              <span className="text-xl text-primary">{confidenceScore}%</span>

              {/* Progress Bar */}
              <Progress
                className="h-2 flex-1 bg-muted dark:bg-[#374151] [&_[data-slot=progress-indicator]]:bg-primary [&_[data-slot=progress-indicator]]:bg-linear-0"
                value={confidenceScore}
              />
            </div>
          </div>

          {/* Live Reasoning Feed */}
          <LiveReasoningFeed feedData={liveReasoningFeed} />
        </div>
      </main>
    </div>
  );
}
