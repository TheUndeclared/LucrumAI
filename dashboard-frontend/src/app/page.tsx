'use client'

import { useEffect, useState } from 'react'

import AIAnalysisSection from '@/components/ai-analysis'
import ProtocolAllocationChart from '@/components/charts/protocol-allocation-chart'
import TradingViewChart from '@/components/charts/trading-view-chart'
import ConfidenceScore from '@/components/common/confidence-score'
import { Feed } from '@/components/common/live-reasoning-feed'
import Header from '@/components/header'
import CurvanceDecisionsTable from '@/components/tables/curvance-decisions-table'
import TradingDecisionsTable from '@/components/tables/trading-decisions-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { transformDecisionsData } from '@/functions'
import {
  DecisionsResponse,
  getDecisions,
  getTradingMetrics,
} from '@/lib/actions'

export default function Page() {
  const [tradingDecisions, setTradingDecisions] = useState<any[]>([])
  const [curvanceDecisions, setCurvanceDecisions] = useState<any[]>([])
  const [averageAPY, setAverageAPY] = useState<number>(0)
  const [pnl24Hours, setPnl24Hours] = useState<number>(0)
  const [totalPnl24Hours, setTotalPnl24Hours] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tableLoading, setTableLoading] = useState(false)

  // Helper function to format PnL value
  const formatPnL = (value: number): string => {
    if (value === 0) return '0'

    // For non-zero values, show up to 4 decimal places but remove trailing zeros
    const formatted = value.toFixed(4)
    return parseFloat(formatted).toString()
  }

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetchDashboardData = async (
    page?: number,
    size?: number,
    isTableUpdate = false
  ) => {
    const currentPageNum = page ?? currentPage
    const currentPageSize = size ?? pageSize
    try {
      if (isTableUpdate) {
        setTableLoading(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const offset = (currentPageNum - 1) * currentPageSize

      const [decisionsResult, metricsResult] = await Promise.allSettled([
        getDecisions(currentPageSize, offset),
        getTradingMetrics(),
      ])

      // Decisions History.
      if (decisionsResult.status === 'fulfilled') {
        const response = decisionsResult.value as unknown as DecisionsResponse
        const { tradingDecisions: t, curvanceDecisions: c } =
          transformDecisionsData(response?.data?.rows || [])
        setTradingDecisions(t)
        setCurvanceDecisions(c)

        // Update pagination info
        const count = response?.data?.count || 0
        setTotalCount(count)
        setTotalPages(Math.ceil(count / currentPageSize))
      } else {
        console.error('Failed to fetch decisions:', decisionsResult.reason)
        setError('Failed to fetch decisions data')
      }

      // Trading Metrics.
      if (
        metricsResult.status === 'fulfilled' &&
        metricsResult.value?.data?.data
      ) {
        const {
          averageAPY: apy,
          pnl24Hours: pnl24,
          totalPnl24Hours: totalPnl24,
        } = metricsResult.value.data.data
        setAverageAPY(apy)
        setPnl24Hours(pnl24)
        setTotalPnl24Hours(totalPnl24)
      } else {
        console.error('Failed to fetch metrics:', metricsResult)
        setError('Failed to fetch metrics data')
      }

      console.log('Dashboard data refreshed successfully')
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      if (isTableUpdate) {
        setTableLoading(false)
      } else {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchDashboardData(1, 5)
  }, [])

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchDashboardData(page, pageSize, true)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Reset to first page when changing page size
    fetchDashboardData(1, size, true)
  }

  // Refresh data when user returns to the page (focus event)
  useEffect(() => {
    const handleFocus = () => {
      // Only refresh if the page has been visible for more than 30 seconds
      // This prevents excessive API calls when quickly switching tabs
      const lastRefresh = localStorage.getItem('dashboardLastRefresh')
      const now = Date.now()
      if (!lastRefresh || now - parseInt(lastRefresh) > 30000) {
        fetchDashboardData()
        localStorage.setItem('dashboardLastRefresh', now.toString())
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  // Extract confidence.
  const confidenceLevel = tradingDecisions?.[0]?.confidence ?? 'UNKNOWN'

  const liveReasoningFeed: Feed[] = tradingDecisions
    .slice(0, 4)
    .map((decision) => ({
      time: new Date(decision.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // force 24h format
      }),
      source: decision.pair,
      message: decision.technicalAnalysis,
      color:
        decision.confidence === 'HIGH'
          ? 'border-primary'
          : decision.confidence === 'MEDIUM'
            ? 'border-blue-600'
            : 'border-yellow-600',
    }))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            onClick={() => fetchDashboardData()}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Header />
      {/* Hero Section with Key Metrics */}
      <div className="container mx-auto px-4 py-6 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-background backdrop-blur-lg rounded-xl p-6 text-white">
            <h3 className="text-gray-400 text-sm">Total PnL 24h</h3>
            <div className="text-3xl font-bold mt-2">
              {totalPnl24Hours || 0}%
            </div>
          </div>
          <div className="bg-background backdrop-blur-lg rounded-xl p-6 text-white">
            <h3 className="text-gray-400 text-sm">24h PnL</h3>
            <div className="text-3xl font-bold mt-2">
              {pnl24Hours >= 0 ? '+' : ''}${formatPnL(pnl24Hours)}
            </div>
          </div>
          <div className="bg-background backdrop-blur-lg rounded-xl p-6 text-white">
            <h3 className="text-gray-400 text-sm">Average APY</h3>
            <div className="text-3xl font-bold mt-2">{averageAPY || 0}%</div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-background backdrop-blur-lg rounded-xl p-4">
              <TradingViewChart />
            </div>
            <div className="bg-background backdrop-blur-lg rounded-xl p-6">
              <Tabs className="w-full" defaultValue="trading">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl text-white">Trading Activity</h2>
                  <TabsList className="bg-gray-800/50">
                    <TabsTrigger className="text-white cursor-pointer" value="trading">
                      Trading
                    </TabsTrigger>
                    <TabsTrigger className="text-white cursor-pointer" value="yieldFarming">
                      Yield Farming
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="trading">
                  <TradingDecisionsTable
                    data={tradingDecisions}
                    loading={tableLoading}
                    pagination={{
                      page: currentPage,
                      pageSize: pageSize,
                      totalPages: totalPages,
                      totalRecords: totalCount,
                      onPageChange: handlePageChange,
                      onPageSizeChange: handlePageSizeChange,
                    }}
                  />
                </TabsContent>
                <TabsContent value="yieldFarming">
                  <CurvanceDecisionsTable
                    data={curvanceDecisions}
                    loading={tableLoading}
                    pagination={{
                      page: currentPage,
                      pageSize: pageSize,
                      totalPages: totalPages,
                      totalRecords: totalCount,
                      onPageChange: handlePageChange,
                      onPageSizeChange: handlePageSizeChange,
                    }}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-background backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-xl text-white mb-4">Protocol Allocation</h2>
              <ProtocolAllocationChart />
            </div>

            <AIAnalysisSection
              confidenceLevel={confidenceLevel}
              ConfidenceScore={ConfidenceScore}
              liveReasoningFeed={liveReasoningFeed}
              tradingDecisions={tradingDecisions}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
