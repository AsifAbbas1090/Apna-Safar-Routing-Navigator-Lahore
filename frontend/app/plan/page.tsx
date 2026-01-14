"use client";

import { useState, useEffect } from "react";
import { useRouteStore } from "@/store/routeStore";
import LocationInput from "@/components/LocationInput";
import RoutePreferences from "@/components/RoutePreferences";
import MapCanvas, { MapMarker } from "@/components/MapCanvas";
import RouteCard from "@/components/RouteCard";
import { Button } from "@/components/ui/button";
import { mockRoutes, LAHORE_CENTER } from "@/lib/mockData";
import { Search, Plus, X } from "lucide-react";
import { motion } from "framer-motion";

export default function PlanPage() {
  const {
    currentLocation,
    destinations,
    preference,
    setCurrentLocation,
    addDestination,
    updateDestination,
    removeDestination,
    setPreference,
    setRoutes,
    selectRoute,
    selectedRouteId,
    routes,
  } = useRouteStore();

  const [isSearching, setIsSearching] = useState(false);

  // Initialize with one destination field if empty
  useEffect(() => {
    if (destinations.length === 0) {
      addDestination("");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Generate markers for map
  const markers: MapMarker[] = [];
  if (currentLocation) {
    markers.push({
      id: "start",
      position: LAHORE_CENTER, // In production, geocode address to coordinates
      type: "start",
    });
  }
  destinations.forEach((dest, index) => {
    markers.push({
      id: `dest-${index}`,
      position: [
        LAHORE_CENTER[0] + (index + 1) * 0.01,
        LAHORE_CENTER[1] + (index + 1) * 0.01,
      ] as [number, number],
      type: index === destinations.length - 1 ? "end" : "stop",
    });
  });

  // Mock route line (in production, this would come from routing API)
  const routeLine: GeoJSON.LineString | undefined =
    currentLocation && destinations.length > 0
      ? {
          type: "LineString",
          coordinates: [
            LAHORE_CENTER,
            [
              LAHORE_CENTER[0] + 0.02,
              LAHORE_CENTER[1] + 0.02,
            ] as [number, number],
          ],
        }
      : undefined;

  const handleFindRoute = () => {
    if (!currentLocation || destinations.length === 0) {
      alert("Please enter your location and destination");
      return;
    }

    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setRoutes(mockRoutes);
      setIsSearching(false);
    }, 1000);
  };

  const canSearch = currentLocation.trim() !== "" && destinations.length > 0;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col md:flex-row">
      {/* Left Panel - Controls */}
      <div className="w-full space-y-6 overflow-y-auto border-r bg-background p-6 md:w-1/3 lg:w-1/4">
        <div>
          <h1 className="mb-6 text-2xl font-bold">Plan Your Route</h1>

          {/* Current Location */}
          <div className="mb-4">
            <LocationInput
              label="Your Location"
              placeholder="Enter your current location"
              value={currentLocation}
              onChange={setCurrentLocation}
              onDetectLocation={() => {}}
              required
            />
          </div>

          {/* Destinations */}
          <div className="mb-4 space-y-4">
            <label className="text-sm font-medium">
              Destination{destinations.length > 1 ? "s" : ""}
            </label>
            {destinations.map((dest, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex-1">
                  <LocationInput
                    label={`Stop ${index + 1}`}
                    placeholder="Where do you want to go?"
                    value={dest}
                    onChange={(value) => updateDestination(index, value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDestination(index)}
                  className="flex-shrink-0"
                  aria-label={`Remove stop ${index + 1}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {destinations.length === 0 && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => addDestination("")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Destination
              </Button>
            )}
            {destinations.length > 0 && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => addDestination("")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another Stop
              </Button>
            )}
          </div>

          {/* Preferences */}
          <div className="mb-6">
            <RoutePreferences
              preference={preference}
              onChange={setPreference}
            />
          </div>

          {/* Find Route Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleFindRoute}
            disabled={!canSearch || isSearching}
          >
            {isSearching ? (
              <>
                <Search className="mr-2 h-4 w-4 animate-spin" />
                Finding Route...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Find Best Route
              </>
            )}
          </Button>
        </div>

        {/* Route Results */}
        {routes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold">Suggested Routes</h2>
            {routes.map((route) => (
              <RouteCard
                key={route.routeId}
                route={route}
                onSelect={() => selectRoute(route.routeId)}
                isSelected={selectedRouteId === route.routeId}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Right Panel - Map */}
      <div className="flex-1">
        <MapCanvas
          center={LAHORE_CENTER}
          zoom={12}
          markers={markers}
          routeLine={routeLine}
          className="h-full w-full"
        />
      </div>
    </div>
  );
}

