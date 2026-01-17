"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, X } from "lucide-react";
import { apiUsageApi, ApiUsageStats } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * API Usage Warning Component
 * Shows warning when user approaches API limits
 */
export default function ApiUsageWarning() {
  const { isAuthenticated } = useAuthStore();
  const [usage, setUsage] = useState<ApiUsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    loadUsage();
    // Refresh every 5 minutes
    const interval = setInterval(loadUsage, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const loadUsage = async () => {
    try {
      const data = await apiUsageApi.getUsage();
      setUsage(data);
    } catch (error: any) {
      // Silently fail - user might not be fully authenticated yet
      // Only log if it's not a 401 (authentication required)
      if (error?.status !== 401) {
        console.error("Failed to load API usage:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || isLoading || !usage || dismissed) {
    return null;
  }

  // Premium users don't need warnings
  if (usage.isPremium) {
    return null;
  }

  // Find the highest usage percentage
  const highestUsage = usage.usage
    ? Math.max(
        usage.usage.dynamicMaps.percentage,
        usage.usage.placesAutocomplete.percentage,
        usage.usage.directions.percentage,
        usage.usage.geocoding.percentage,
      )
    : 0;

  // Only show warning if usage is above 80%
  if (highestUsage < 80) {
    return null;
  }

  const isCritical = highestUsage >= 95;

  return (
    <Alert
      variant={isCritical ? "destructive" : "default"}
      className="mb-4"
    >
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>
        {isCritical ? "API Usage Limit Almost Reached!" : "API Usage Warning"}
      </AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <div>
          <p className="mb-2">
            You've used {highestUsage}% of your monthly API quota.{" "}
            {isCritical
              ? "You'll need to upgrade to premium to continue using the service."
              : "Consider upgrading to premium for unlimited access."}
          </p>
          <div className="flex gap-2 mt-2">
            <Button asChild size="sm" variant={isCritical ? "default" : "outline"}>
              <Link href="/pricing">Upgrade to Premium</Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}


