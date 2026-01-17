"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Route, Clock, TrendingUp, MapPin, Loader2 } from "lucide-react";
import { dashboardApi, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import ApiUsageWarning from "@/components/ApiUsageWarning";
import GoogleAd from "@/components/GoogleAd";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth check to complete
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Small delay to ensure token is available
    const timer = setTimeout(() => {
      loadStats();
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, authLoading, router]);

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Double-check token is available
      const token = localStorage.getItem('auth_token') || localStorage.getItem('accessToken');
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        useAuthStore.getState().logout();
        router.push("/login");
        return;
      }
      
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError("Authentication failed. Please log in again.");
          // Clear auth and redirect to login
          useAuthStore.getState().logout();
          setTimeout(() => {
            router.push("/login");
          }, 1000);
        } else {
          setError(err.message || "Failed to load dashboard stats");
        }
      } else {
        setError("Failed to load dashboard stats");
      }
      console.error("Dashboard error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-lg text-destructive mb-4">{error}</p>
          <button
            onClick={loadStats}
            className="text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statsCards = [
    {
      title: "Total Routes",
      value: stats.totalRoutes.toString(),
      description: "Routes taken this month",
      icon: <Route className="h-5 w-5" />,
      change: stats.totalRoutesChange > 0
        ? `+${stats.totalRoutesChange}% from last month`
        : stats.totalRoutesChange < 0
        ? `${stats.totalRoutesChange}% from last month`
        : "No change from last month",
    },
    {
      title: "Avg Commute Time",
      value: `${stats.avgCommuteTime} min`,
      description: "Average journey duration",
      icon: <Clock className="h-5 w-5" />,
      change: stats.avgCommuteTimeChange > 0
        ? `+${stats.avgCommuteTimeChange} min from last month`
        : stats.avgCommuteTimeChange < 0
        ? `${stats.avgCommuteTimeChange} min from last month`
        : "No change from last month",
    },
    {
      title: "Favorite Transport",
      value: stats.favoriteTransport,
      description: "Most used transport",
      icon: <MapPin className="h-5 w-5" />,
      change: stats.favoriteTransportCount > 0
        ? `Used ${stats.favoriteTransportCount} times`
        : "No data yet",
    },
    {
      title: "Time Saved",
      value: `${stats.timeSavedHours} hrs`,
      description: "Compared to walking",
      icon: <TrendingUp className="h-5 w-5" />,
      change: "This month",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Your navigation statistics and recent activity
        </p>
      </div>

      {/* API Usage Warning */}
      <ApiUsageWarning />

      {/* Google Ad for free users */}
      <div className="mb-6">
        <GoogleAd className="w-full" />
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className="text-primary">{stat.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Routes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Routes</CardTitle>
            <CardDescription>
              Your recently planned and completed routes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentRoutes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No recent routes yet. Plan your first route to see it here!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentRoutes.map((route: any) => (
                  <div
                    key={route.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium">{route.from}</span>
                      </div>
                      <div className="ml-6 mt-1 flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {route.to}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{route.duration}</p>
                      <p className="text-xs text-muted-foreground">{route.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
