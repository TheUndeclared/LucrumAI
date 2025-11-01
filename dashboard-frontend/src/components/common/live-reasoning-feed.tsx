import { motion } from "framer-motion";
import { Clock, Database } from "lucide-react";
import React from "react";

export interface Feed {
  time: string;
  source: string;
  message: string;
  color: string; // Tailwind border color
}

export default function LiveReasoningFeed({ feedData }: { feedData: Feed[] }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-primary mb-5 flex items-center gap-2">
        <Database className="w-5 h-5 text-primary" />
        Live Reasoning Feed
      </h3>

      <div className="flex flex-col gap-4">
        {feedData.map((feed, index) => (
          <motion.div
            key={index}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-xl border border-border bg-muted/10 hover:bg-muted/20 transition-all`}
            initial={{ opacity: 0, y: 8 }}
            transition={{ delay: index * 0.05 }}
          >
            {/* Left color accent */}
            <div
              className={`absolute left-0 top-0 h-full w-1.5 rounded-l-xl ${feed.color}`}
            />

            <div className="px-4 py-3 pl-6">
              <div className="flex justify-between items-center text-xs text-muted-foreground mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 opacity-70" />
                  <span>{feed.time}</span>
                </div>
                <span className="italic">{feed.source}</span>
              </div>

              <p className="text-sm text-foreground leading-snug">{feed.message}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
