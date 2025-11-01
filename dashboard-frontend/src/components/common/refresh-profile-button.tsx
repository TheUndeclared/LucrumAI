"use client";

import { Loader2, RotateCw } from "lucide-react"; // nice refresh icon

import { Button } from "@/components/ui/button"; // shadcn button
import useProfile from "@/hooks/use-profile";

export default function RefreshProfileButton() {
  const { isFetchingProfile, refetchProfile } = useProfile();

  return (
    <Button
      className="flex items-center gap-2 cursor-pointer border-border"
      disabled={isFetchingProfile}
      variant="outline"
      onClick={refetchProfile}
    >
      {isFetchingProfile ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RotateCw className="w-4 h-4" />
      )}
    </Button>
  );
}
