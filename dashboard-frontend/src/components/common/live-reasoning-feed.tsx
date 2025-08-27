import React from "react";

export interface Feed {
  time: string;
  source: string;
  message: string;
  color: string; // Tailwind border color
}

export default function LiveReasoningFeed({ feedData }: { feedData: Feed[] }) {
  return (
    <div className="border rounded-md p-4 bg-background">
      <h3 className="text-primary text-lg mb-3.5">Live Reasoning Feed</h3>

      {/* Feeds */}
      <div className="space-y-4">
        {feedData.map((feed, index) => (
          <div key={index} className={`border-l-2 pl-3.5 ${feed.color}`}>
            <div className="text-xs text-muted-foreground">
              {feed.time} - {feed.source}
            </div>
            <div className="text-sm text-white">{feed.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
