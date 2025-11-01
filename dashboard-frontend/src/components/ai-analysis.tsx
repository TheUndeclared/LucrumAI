import { motion } from 'framer-motion'
import { Brain, CheckCircle2 } from 'lucide-react'
import React from 'react'

import LiveReasoningFeed, { Feed } from '@/components/common/live-reasoning-feed'

type Props = {
  tradingDecisions?: Array<{ modelAgreement?: string }>
  confidenceLevel: number | string
  liveReasoningFeed: Feed[]
  ConfidenceScore: React.ComponentType<{ confidenceLevel: any }>
}

export default function AIAnalysisSection({
  tradingDecisions,
  confidenceLevel,
  liveReasoningFeed,
  ConfidenceScore,
}: Props) {
  return (
    <section className="relative rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl p-6 shadow-sm overflow-hidden">
      {/* gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />

      {/* header */}
      <div className="mb-5 flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
          <Brain className="h-5 w-5 text-primary" />
        </span>
        <h2 className="text-xl font-semibold text-foreground">AI Analysis</h2>
      </div>

      {/* content stack */}
      <div className="flex flex-col gap-5">
        {/* Model Consensus */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-muted/10 p-4"
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Model Consensus
            </h3>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground/70" />
          </div>
          <p className="text-base text-foreground">
            {tradingDecisions?.[0]?.modelAgreement || 'N/A'}
          </p>
        </motion.div>

        {/* Confidence Score */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-muted/10 p-4"
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25, delay: 0.05 }}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Confidence Score
          </h3>
          <ConfidenceScore confidenceLevel={confidenceLevel as any} />
        </motion.div>

        {/* Live Reasoning Feed */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-muted/10 p-4"
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25, delay: 0.1 }}
        >
          <LiveReasoningFeed feedData={liveReasoningFeed} />
        </motion.div>
      </div>
    </section>
  )
}
