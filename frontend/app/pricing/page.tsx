"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for occasional travelers",
      features: [
        "5 routes per day",
        "Basic route planning",
        "Live navigation",
        "Saved routes (up to 3)",
        "Community support",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "per month",
      description: "For daily commuters and power users",
      features: [
        "Unlimited routes",
        "Advanced route optimization",
        "AI-powered predictions",
        "Offline maps",
        "Priority support",
        "Route history analytics",
        "Custom route preferences",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Pricing</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Choose the plan that works best for you. Start free and upgrade when
            you need more features.
          </p>
        </motion.div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card
              className={`relative h-full ${
                plan.popular
                  ? "border-primary shadow-lg ring-2 ring-primary"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground"> / {plan.period}</span>
                </div>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start space-x-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/plan" className="w-full">
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mx-auto mt-16 max-w-3xl"
      >
        <h2 className="mb-8 text-center text-2xl font-bold">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Can I change plans later?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                will be reflected in your next billing cycle.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Is there a free trial?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Pro plan comes with a 14-day free trial. No credit card required
                to start.
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

