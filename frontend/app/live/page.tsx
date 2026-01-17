"use client";

import { useEffect, useState, useRef } from "react";
import { useRouteStore } from "@/store/routeStore";
import GoogleMapsCanvas from "@/components/GoogleMapsCanvas";
import ProgressStepper from "@/components/ProgressStepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LAHORE_CENTER, mockRoutes } from "@/lib/mockData";
import { Navigation, X, Clock, MapPin, Locate } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { googleMapsApi } from "@/lib/api";

export default function LivePage() {
  const router = useRouter();
  const { selectedCity, currentRoute, setCurrentRoute, clearRoute, selectedRouteId, routes, addDestination } = useRouteStore();
  const city = selectedCity || getDefaultCity();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(city.center);
  const [routePath, setRoutePath] = useState<Array<{ lat: number; lng: number }>>([]);
  const [clickedStops, setClickedStops] = useState<Array<{ lat: number; lng: number; label: string }>>([]);
  const watchIdRef = useRef<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setMapCenter([longitude, latitude]);
          
          // Start watching position for live updates
          watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
              setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              setMapCenter([pos.coords.longitude, pos.coords.latitude]);
            },
            (err) => console.error("Location watch error:", err),
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            }
          );
        },
        (err) => {
          console.error("Location error:", err);
          // Use default center if location fails
          setUserLocation({ lat: city.center[1], lng: city.center[0] });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }

    // Cleanup watch on unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Initialize with route from store or get route path
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

    // Get route path from localStorage or route store if available
    const storedRoutePath = localStorage.getItem('currentRoutePath');
    if (storedRoutePath) {
      try {
        const path = JSON.parse(storedRoutePath);
        setRoutePath(path);
      } catch (e) {
        console.error("Error parsing route path:", e);
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
  const markers: Array<{
    id: string;
    position: [number, number];
    type: "start" | "end" | "stop";
    label?: string;
  }> = [];

  // Add user location marker
  if (userLocation) {
    markers.push({
      id: "user",
      position: [userLocation.lng, userLocation.lat],
      type: "start",
      label: "You",
    });
  }

  // Add clicked stops
  clickedStops.forEach((stop, index) => {
    markers.push({
      id: `stop-${index}`,
      position: [stop.lng, stop.lat],
      type: "stop",
      label: stop.label || String.fromCharCode(66 + index), // B, C, D...
    });
  });

  // Convert route path to Google Maps polyline format
  const routeLinePolyline: google.maps.PolylineOptions | undefined = 
    routePath.length > 0
      ? {
          path: routePath.map(p => ({ lat: p.lat, lng: p.lng })),
          strokeColor: "#3b82f6",
          strokeWeight: 4,
          strokeOpacity: 0.8,
        }
      : undefined;

  // Handle map click to add stops
  const handleMapClick = async (lat: number, lng: number) => {
    try {
      // Reverse geocode to get address
      const address = await googleMapsApi.reverseGeocode(lat, lng);
      const label = String.fromCharCode(66 + clickedStops.length); // B, C, D...
      
      setClickedStops([...clickedStops, { lat, lng, label }]);
      
      // Add to destinations in route store
      addDestination(address);
      
      // Show notification
      console.log(`Added stop ${label} at: ${address}`);
    } catch (error) {
      console.error("Error adding stop:", error);
    }
  };

  // Handle locate me button
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setMapCenter([longitude, latitude]);
        },
        (err) => {
          console.error("Location error:", err);
          alert("Unable to get your location. Please check your browser permissions.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndNavigation = () => {
    // Don't clear route data - keep location and destinations
    // Only clear the active route, but preserve the route data for display
    setCurrentRoute(undefined);
    router.push("/plan");
  };

  return (
    <div className="relative h-screen w-full">
      {/* Full Screen Map */}
      <GoogleMapsCanvas
        center={mapCenter}
        zoom={15}
        markers={markers}
        routeLine={routeLinePolyline}
        className="h-full w-full"
        onMapClick={handleMapClick}
        restrictToBounds={city.bounds}
      />

      {/* Locate Me Button */}
      <div className="absolute bottom-24 right-4 z-20">
        <Button
          onClick={handleLocateMe}
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg"
          variant="default"
        >
          <Locate className="h-5 w-5" />
        </Button>
      </div>

      {/* Top Info Bar - Compact */}
      <div className="absolute left-0 right-0 top-4 z-10 px-4">
        <Card className="mx-auto max-w-md cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowDetails(!showDetails)}>
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Current Action</p>
                <p className="font-semibold text-sm truncate">{currentStep.label}</p>
              </div>
              <div className="text-right ml-4">
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{formatTime(timeRemaining)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Time remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Panel - Overlay when clicked */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-20 left-4 right-4 z-20 max-h-[60vh] overflow-y-auto"
        >
          <Card className="bg-background/98 backdrop-blur-md shadow-2xl border-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Route Details</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDetails(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                {/* Progress Stepper */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold">Route Progress</h3>
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
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Compact Bottom Bar - Always visible */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-background/90 backdrop-blur-sm border-t">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs"
            >
              {showDetails ? "Hide" : "Show"} Details
            </Button>
            <div className="text-xs text-muted-foreground">
              Step {currentStepIndex + 1} of {steps.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

