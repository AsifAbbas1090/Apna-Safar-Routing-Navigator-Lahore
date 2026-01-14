"use client";

import { useEffect, useState } from "react";
import { useRouteStore } from "@/store/routeStore";
import MapCanvas, { MapMarker } from "@/components/MapCanvas";
import ProgressStepper from "@/components/ProgressStepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LAHORE_CENTER, mockRoutes } from "@/lib/mockData";
import { Navigation, X, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LivePage() {
  const router = useRouter();
  const { currentRoute, setCurrentRoute, clearRoute, selectedRouteId, routes } = useRouteStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds

  // Initialize with mock route if no route is set
  useEffect(() => {
    if (!currentRoute) {
      if (selectedRouteId && routes.length > 0) {
        const route = routes.find(r => r.routeId === selectedRouteId);
        if (route) {
          setCurrentRoute(route);
        } else {
          setCurrentRoute(mockRoutes[0]);
        }
      } else {
        setCurrentRoute(mockRoutes[0]);
      }
    }
  }, [currentRoute, setCurrentRoute, selectedRouteId, routes]);

  // Simulate navigation progress
  useEffect(() => {
    if (!currentRoute) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          // Move to next step
          if (currentStepIndex < currentRoute.steps.length - 1) {
            setCurrentStepIndex((prev) => prev + 1);
            return 300; // Reset timer for next step
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentRoute, currentStepIndex]);

  if (!currentRoute) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg text-muted-foreground">
            No active route. Please plan a route first.
          </p>
          <Button onClick={() => router.push("/plan")}>
            Plan a Route
          </Button>
        </div>
      </div>
    );
  }

  const currentStep = currentRoute.steps[currentStepIndex];
  const steps = currentRoute.steps.map((step) => step.label);

  // Generate markers for live navigation
  const markers: MapMarker[] = [
    {
      id: "user",
      position: [
        LAHORE_CENTER[0] + currentStepIndex * 0.01,
        LAHORE_CENTER[1] + currentStepIndex * 0.01,
      ] as [number, number],
      type: "user",
    },
  ];

  // Mock route line
  const routeLine: GeoJSON.LineString = {
    type: "LineString",
    coordinates: Array.from({ length: currentRoute.steps.length + 1 }, (_, i) => [
      LAHORE_CENTER[0] + i * 0.01,
      LAHORE_CENTER[1] + i * 0.01,
    ]) as [number, number][],
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndNavigation = () => {
    clearRoute();
    router.push("/plan");
  };

  return (
    <div className="relative h-screen w-full">
      {/* Full Screen Map */}
      <MapCanvas
        center={LAHORE_CENTER}
        zoom={14}
        markers={markers}
        routeLine={routeLine}
        className="h-full w-full"
      />

      {/* Top Info Bar */}
      <div className="absolute left-0 right-0 top-4 z-10 px-4">
        <Card className="mx-auto max-w-md">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Action</p>
                <p className="font-semibold">{currentStep.label}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(timeRemaining)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Time remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation Card */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="absolute bottom-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-sm"
      >
        <div className="container mx-auto max-w-4xl px-4 py-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Progress Stepper */}
            <div>
              <h3 className="mb-4 text-sm font-semibold">Route Progress</h3>
              <ProgressStepper
                steps={steps}
                currentStepIndex={currentStepIndex}
                orientation="vertical"
              />
            </div>

            {/* Current Step Details */}
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-semibold">Next Steps</h3>
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">
                          {currentStep.type === "walk"
                            ? "🚶"
                            : currentStep.type === "bus"
                            ? "🚌"
                            : "🚇"}
                        </span>
                        <div>
                          <p className="font-medium">{currentStep.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {currentStep.duration}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button
                variant="destructive"
                className="w-full"
                onClick={handleEndNavigation}
              >
                <X className="mr-2 h-4 w-4" />
                End Navigation
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

