"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Clock, Route, ArrowRight, Play, Brain, Shield, Zap, Globe, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { SUPPORTED_CITIES } from "@/lib/cities";

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

  const aiFeatures = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Route Planning",
      description: "Our intelligent system analyzes multiple factors including distance, time, transfers, and walking to find your optimal route.",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Smart Bus Selection",
      description: "AI automatically selects the nearest and most efficient bus type (Metro, Orange Line, Feeder, Express) for your journey.",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Step-by-Step Guidance",
      description: "Get detailed AI-generated instructions: where to walk, which stop to board, where to get off, and when to transfer.",
    },
  ];

  return (
    <div className="flex flex-col bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#556B2F] via-black to-black py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-4 inline-block rounded-full bg-[#556B2F]/20 px-4 py-2 text-sm font-medium text-[#9AB973]">
              Supported by <span className="font-bold text-[#9AB973]">SynkSpace</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl">
              Smart Public Transport Navigation for{" "}
              <span className="text-[#9AB973]">Pakistan</span>
            </h1>
            <p className="mb-8 text-lg text-gray-300 md:text-xl">
              Find the fastest route using buses, metro & walking — all in one map.
              Powered by AI and covering all Mass Transit Authority routes.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/plan">
                <Button size="lg" className="w-full bg-[#556B2F] hover:bg-[#6B7F3F] text-white sm:w-auto">
                  Plan My Route
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="w-full border-[#556B2F] text-white hover:bg-[#556B2F]/20 sm:w-auto">
                  <Play className="mr-2 h-5 w-5" />
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mass Transit Authority Coverage - Big Box */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-5xl"
          >
            <Card className="border-4 border-[#556B2F] bg-gradient-to-br from-[#556B2F]/10 to-[#9AB973]/10 shadow-2xl">
              <CardHeader className="text-center pb-8">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#556B2F]">
                  <CheckCircle2 className="h-12 w-12 text-white" />
                </div>
                <CardTitle className="text-4xl font-bold text-black md:text-5xl">
                  Proudly Covering All Mass Transit Authority Routes
                </CardTitle>
                <CardDescription className="mt-4 text-lg text-gray-700">
                  We provide comprehensive coverage of all government mass transit systems across Pakistan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="rounded-lg bg-black p-6 text-center text-white">
                    <div className="mb-3 text-3xl font-bold text-[#9AB973]">🚇</div>
                    <h3 className="mb-2 text-xl font-bold">Metro Systems</h3>
                    <p className="text-gray-300">Orange Line, Metro Bus, and all metro routes</p>
                  </div>
                  <div className="rounded-lg bg-black p-6 text-center text-white">
                    <div className="mb-3 text-3xl font-bold text-[#9AB973]">🚌</div>
                    <h3 className="mb-2 text-xl font-bold">Bus Networks</h3>
                    <p className="text-gray-300">Feeder, Express, Periphery, and Suburban routes</p>
                  </div>
                  <div className="rounded-lg bg-black p-6 text-center text-white">
                    <div className="mb-3 text-3xl font-bold text-[#9AB973]">🚶</div>
                    <h3 className="mb-2 text-xl font-bold">Walking Routes</h3>
                    <p className="text-gray-300">Optimized walking paths between stops and stations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* How It Works with AI - Big Box */}
      <section className="bg-black py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-5xl text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              How It Works with <span className="text-[#9AB973]">AI</span>
            </h2>
            <p className="mb-12 text-lg text-gray-300">
              Our intelligent system uses artificial intelligence to provide you with the best possible route
            </p>
            <div className="grid gap-8 md:grid-cols-3">
              {aiFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full border-2 border-[#556B2F] bg-gradient-to-br from-black to-[#1a1a1a] text-white">
                    <CardHeader>
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-[#556B2F] text-[#9AB973]">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base text-gray-300">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cities We Cover - Big Box */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-5xl"
          >
            <Card className="border-4 border-[#556B2F] bg-gradient-to-br from-white to-[#556B2F]/5 shadow-2xl">
              <CardHeader className="text-center pb-8">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#556B2F]">
                  <Globe className="h-12 w-12 text-white" />
                </div>
                <CardTitle className="text-4xl font-bold text-black md:text-5xl">
                  Cities We Cover
                </CardTitle>
                <CardDescription className="mt-4 text-lg text-gray-700">
                  Currently serving {SUPPORTED_CITIES.length} major cities with government mass transit systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {SUPPORTED_CITIES.map((city, index) => (
                    <motion.div
                      key={city.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="rounded-lg bg-black p-4 text-center text-white transition-transform hover:scale-105"
                    >
                      <MapPin className="mx-auto mb-2 h-6 w-6 text-[#9AB973]" />
                      <h3 className="font-bold text-white">{city.name}</h3>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-black py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-300">
              Navigate Pakistan's public transport system with confidence
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
                <Card className="h-full border-2 border-[#556B2F] bg-gradient-to-br from-black to-[#1a1a1a] text-white hover:border-[#9AB973] transition-all">
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#556B2F] text-[#9AB973]">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-gray-300">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-b from-black via-[#556B2F] to-black py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl rounded-lg border-4 border-[#9AB973] bg-black p-8 text-center text-white shadow-2xl"
          >
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Ready to Start Your Journey?
            </h2>
            <p className="mb-6 text-lg text-gray-300">
              Plan your route now and experience seamless navigation across Pakistan.
              No login required - start using it right away!
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/plan">
                <Button size="lg" className="bg-[#556B2F] hover:bg-[#6B7F3F] text-white">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-[#556B2F] text-white hover:bg-[#556B2F]/20">
                  Login for Stats
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-400">
              Supported by <a href="https://synkspace.io" target="_blank" rel="noopener noreferrer" className="text-[#9AB973] hover:underline font-bold">SynkSpace</a>
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
