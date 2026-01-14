"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Clock, Route, ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const features = [
    {
      icon: <Navigation className="h-6 w-6" />,
      title: "Nearest Transport",
      description: "Find the closest bus stop, metro station, or transport hub to your location.",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Fastest Route",
      description: "Get optimized routes that save you time with real-time transit data.",
    },
    {
      icon: <Route className="h-6 w-6" />,
      title: "Live Map Navigation",
      description: "Follow your route in real-time with turn-by-turn navigation guidance.",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Smart Public Transport Navigation for{" "}
              <span className="text-primary">Lahore</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Find the fastest route using buses, metro & walking — all in one
              map.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/plan">
                <Button size="lg" className="w-full sm:w-auto">
                  Plan My Route
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Play className="mr-2 h-5 w-5" />
                  See How It Works
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground">
              Navigate Lahore's public transport system with confidence
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* City Trust Section */}
      <section className="bg-secondary/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6 flex items-center justify-center space-x-2">
                <MapPin className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold md:text-4xl">
                  Built for Lahore
                </h2>
              </div>
              <p className="mb-8 text-lg text-muted-foreground">
                Optimized for Lahore's public transport network including Orange
                Line Metro, Metro Bus, and local bus routes.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="rounded-lg bg-background px-4 py-2 text-sm font-medium shadow-sm">
                  🚇 Orange Line
                </div>
                <div className="rounded-lg bg-background px-4 py-2 text-sm font-medium shadow-sm">
                  🚌 Metro Bus
                </div>
                <div className="rounded-lg bg-background px-4 py-2 text-sm font-medium shadow-sm">
                  🚶 Walking Routes
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl rounded-lg bg-primary p-8 text-center text-white"
          >
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Ready to Start Your Journey?
            </h2>
            <p className="mb-6 text-lg opacity-90">
              Plan your route now and experience seamless navigation across
              Lahore.
            </p>
            <Link href="/plan">
              <Button size="lg" variant="secondary">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

