"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Route, Clock, TrendingUp, MapPin } from "lucide-react";

export default function DashboardPage() {
  // Mock stats data
  const stats = [
    {
      title: "Total Routes",
      value: "127",
      description: "Routes taken this month",
      icon: <Route className="h-5 w-5" />,
      change: "+12% from last month",
    },
    {
      title: "Avg Commute Time",
      value: "32 min",
      description: "Average journey duration",
      icon: <Clock className="h-5 w-5" />,
      change: "-5 min from last month",
    },
    {
      title: "Favorite Transport",
      value: "Orange Line",
      description: "Most used transport",
      icon: <MapPin className="h-5 w-5" />,
      change: "Used 45 times",
    },
    {
      title: "Time Saved",
      value: "8.5 hrs",
      description: "Compared to walking",
      icon: <TrendingUp className="h-5 w-5" />,
      change: "This month",
    },
  ];

  const recentRoutes = [
    {
      from: "Thokar Niaz Baig",
      to: "PUCIT, Lahore",
      date: "Today, 2:30 PM",
      duration: "38 mins",
    },
    {
      from: "PUCIT, Lahore",
      to: "Johar Town",
      date: "Yesterday, 5:15 PM",
      duration: "25 mins",
    },
    {
      from: "Allama Iqbal Airport",
      to: "Thokar Niaz Baig",
      date: "2 days ago",
      duration: "52 mins",
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

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
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
            <div className="space-y-4">
              {recentRoutes.map((route, index) => (
                <div
                  key={index}
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
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

