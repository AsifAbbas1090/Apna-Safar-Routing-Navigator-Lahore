"use client";

import { useState, useEffect } from "react";
import { useRouteStore } from "@/store/routeStore";
import LocationInput from "@/components/LocationInput";
import RoutePreferences from "@/components/RoutePreferences";
import MapCanvas, { MapMarker } from "@/components/MapCanvas";
import RouteCard from "@/components/RouteCard";
import { Button } from "@/components/ui/button";
import { LAHORE_CENTER } from "@/lib/mockData";
import { routeApi, stopsApi, ApiError, googleMapsApi } from "@/lib/api";
import { Search, Plus, X, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import ApiUsageWarning from "@/components/ApiUsageWarning";
import GoogleAd from "@/components/GoogleAd";
import GoogleMapsCanvas from "@/components/GoogleMapsCanvas";
import NavigationInstructions from "@/components/NavigationInstructions";
import { getDefaultCity } from "@/lib/cities";

export default function PlanPage() {
  const {
    selectedCity,
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
    setCurrentRoute,
    resetDestinations,
  } = useRouteStore();
  
  // Get current city or default
  const city = selectedCity || getDefaultCity();

  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number }[]>([]);
  const [navigationInstructions, setNavigationInstructions] = useState<string[]>([]);
  const [plannedRouteData, setPlannedRouteData] = useState<{
    estimatedTime?: number;
    transfers?: number;
    walkingDistance?: number;
  } | null>(null);
  const [routePath, setRoutePath] = useState<Array<{ lat: number; lng: number }>>([]);

  // Initialize with one destination field on mount
  useEffect(() => {
    // On first load, if we have multiple empty destinations or no destinations, reset to one
    const hasNonEmpty = destinations.some(dest => dest.trim() !== "");
    
    if (!hasNonEmpty) {
      // All empty or no destinations - reset to just one empty destination
      if (destinations.length !== 1) {
        resetDestinations();
      }
    }
    // If there are non-empty destinations, keep them but don't add extra empty ones
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Geocode addresses to coordinates using Google Maps API
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const { googleMapsApi } = await import("@/lib/api");
      // Use city-specific location bias for better results
      return await googleMapsApi.geocode(address, {
        componentRestrictions: { country: "pk" },
        locationBias: {
          circle: {
            center: { lat: city.center[1], lng: city.center[0] },
            radius: 50000, // 50km radius
          },
        },
      });
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  const handleFindRoute = async () => {
    if (!currentLocation || destinations.length === 0 || !destinations[0]) {
      setError("Please enter your location and destination");
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      // Geocode addresses to coordinates
      let fromCoords = currentCoords;
      let toCoords = destinationCoords[0];

      if (!fromCoords && currentLocation) {
        const geocoded = await geocodeAddress(currentLocation);
        if (geocoded) {
          fromCoords = { lat: geocoded.lat, lng: geocoded.lng };
          setCurrentCoords(fromCoords);
        }
      }

      if (!toCoords && destinations[0]) {
        const geocoded = await geocodeAddress(destinations[0]);
        if (geocoded) {
          toCoords = { lat: geocoded.lat, lng: geocoded.lng };
          setDestinationCoords([toCoords]);
        }
      }

      // Fallback to city center if geocoding fails
      const fromCoordsFinal = fromCoords || { lat: city.center[1], lng: city.center[0] };
      const toCoordsFinal = toCoords || {
        lat: city.center[1] + 0.02,
        lng: city.center[0] + 0.02,
      };

      // Call backend API
      const plannedRoute = await routeApi.planRoute({
        from: { lat: fromCoordsFinal.lat, lng: fromCoordsFinal.lng },
        to: { lat: toCoordsFinal.lat, lng: toCoordsFinal.lng },
        preference: preference,
      });

      // Get actual route path using Google Directions API
      // This will give us the actual road path, not just a straight line
      let routePath: Array<{ lat: number; lng: number }> = [];
      try {
        // Wait for Google Maps to be available
        if (typeof window !== 'undefined' && window.google && window.google.maps) {
          const directions = await googleMapsApi.getDirections(
            fromCoordsFinal,
            toCoordsFinal
          );
          
          // Google Directions API returns routes with encoded polylines
          if (directions && directions.routes && directions.routes.length > 0) {
            const route = directions.routes[0];
            // Use overview_polyline if available (simplified path)
            if (route.overview_polyline && route.overview_polyline.points) {
              // Decode polyline using Google Maps geometry library
              const decodedPath = window.google.maps.geometry.encoding.decodePath(route.overview_polyline.points);
              routePath = decodedPath.map((point: google.maps.LatLng) => ({
                lat: point.lat(),
                lng: point.lng(),
              }));
            } else if (route.legs && route.legs.length > 0) {
              // Fallback: build path from route legs
              routePath = [fromCoordsFinal];
              route.legs.forEach((leg: any) => {
                if (leg.steps) {
                  leg.steps.forEach((step: any) => {
                    if (step.path) {
                      routePath.push(...step.path.map((p: any) => ({ lat: p.lat(), lng: p.lng() })));
                    }
                  });
                }
              });
              routePath.push(toCoordsFinal);
            }
          }
        } else {
          // Google Maps not loaded yet, use simple path
          routePath = [fromCoordsFinal, toCoordsFinal];
        }
      } catch (dirError) {
        console.warn("Could not get directions path, using straight line:", dirError);
        // Fallback: simple straight line
        routePath = [fromCoordsFinal, toCoordsFinal];
      }

      // Store route path for map display
      setRoutePath(routePath);

      // Convert backend response to frontend format
      const convertedRoutes = [
        {
          routeId: `route-${Date.now()}`,
          estimatedTime: `${plannedRoute.estimatedTime} mins`,
          transfers: plannedRoute.transfers,
          steps: plannedRoute.steps.map((step) => ({
            type: step.type,
            label: `${step.from} → ${step.to}${step.route ? ` (${step.route})` : ""}`,
            duration: `${step.time} min`,
          })),
        },
      ];

      setRoutes(convertedRoutes);
      setCurrentRoute(convertedRoutes[0]);
      
      // Store route path for live navigation
      if (routePath.length > 0) {
        localStorage.setItem('currentRoutePath', JSON.stringify(routePath));
      }
      
      // Store AI navigation instructions if available
      if ((plannedRoute as any).instructions) {
        setNavigationInstructions((plannedRoute as any).instructions);
        setPlannedRouteData({
          estimatedTime: plannedRoute.estimatedTime,
          transfers: plannedRoute.transfers,
          walkingDistance: plannedRoute.walkingDistance,
        });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to plan route. Please try again.");
      } else {
        setError("Network error. Please check if the backend is running.");
      }
      console.error("Route planning error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Generate markers for map in proper A, B, C, D order
  // Always show start as A, destinations as B, C, D... in sequence
  const markers: Array<{
    id: string;
    position: [number, number];
    type: "start" | "end" | "stop";
    label?: string;
  }> = [];
  
  // Start point is always A
  if (currentCoords) {
    markers.push({
      id: "start",
      position: [currentCoords.lng, currentCoords.lat],
      type: "start",
      label: "A",
    });
  }
  
  // Destinations are B, C, D... in order
  destinationCoords.forEach((coords, index) => {
    const label = String.fromCharCode(66 + index); // B=66, C=67, D=68...
    const isLast = index === destinationCoords.length - 1;
    markers.push({
      id: `dest-${index}`,
      position: [coords.lng, coords.lat],
      type: isLast ? "end" : "stop",
      label: label, // B, C, D, E...
    });
  });

  // Route line for Google Maps - use actual route path if available
  const routeLine: google.maps.PolylineOptions | undefined =
    routePath.length > 0
      ? {
          path: routePath.map(p => ({ lat: p.lat, lng: p.lng })),
          strokeColor: "#3b82f6",
          strokeWeight: 4,
          strokeOpacity: 0.8,
        }
      : currentCoords && destinationCoords.length > 0
      ? {
          path: [
            { lat: currentCoords.lat, lng: currentCoords.lng },
            ...destinationCoords.map(coords => ({ lat: coords.lat, lng: coords.lng })),
          ],
          strokeColor: "#3b82f6",
          strokeWeight: 4,
          strokeOpacity: 0.8,
        }
      : undefined;

  const canSearch = currentLocation.trim() !== "" && destinations.length > 0 && destinations[0].trim() !== "";

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col md:flex-row">
      {/* Left Panel - Controls */}
      <div className="w-full space-y-6 overflow-y-auto border-r bg-background p-6 md:w-1/3 lg:w-1/4">
        <div>
          <h1 className="mb-6 text-2xl font-bold">Plan Your Route</h1>
          
          {/* API Usage Warning */}
          <ApiUsageWarning />
          
          {/* Google Ad for free users */}
          <div className="mb-4">
            <GoogleAd className="w-full" />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Current Location */}
          <div className="mb-4">
            <LocationInput
              label="Your Location (A)"
              placeholder="Enter your current location"
              value={currentLocation}
              onChange={setCurrentLocation}
              onDetectLocation={(coords) => {
                // Coordinates are passed directly from LocationInput
                if (coords) {
                  setCurrentCoords(coords);
                } else {
                  // Fallback: get from window storage
                  const storedCoords = (window as any).lastGeocodedCoords;
                  if (storedCoords) {
                    setCurrentCoords(storedCoords);
                  }
                }
              }}
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
                    label={index === 0 ? `Destination (B)` : `Stop ${index} (${String.fromCharCode(66 + index)})`}
                    placeholder="Where do you want to go?"
                    value={dest}
                    onChange={(value) => {
                      updateDestination(index, value);
                      // Clear coordinates when text changes manually (not from autocomplete)
                      // Coordinates will be set when selecting from autocomplete
                    }}
                    onDetectLocation={(coords) => {
                      // Coordinates are passed directly from LocationInput when "Locate Me" is clicked
                      if (coords) {
                        const newCoords = [...destinationCoords];
                        newCoords[index] = coords;
                        setDestinationCoords(newCoords);
                      } else {
                        // Fallback: get from window storage (for autocomplete selections)
                        const storedCoords = (window as any).lastGeocodedCoords;
                        if (storedCoords) {
                          const newCoords = [...destinationCoords];
                          newCoords[index] = storedCoords;
                          setDestinationCoords(newCoords);
                        }
                      }
                    }}
                  />
                </div>
                {destinations.length > 1 && (
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
                )}
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

        {/* AI Navigation Instructions */}
        {navigationInstructions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <NavigationInstructions
              instructions={navigationInstructions}
              estimatedTime={plannedRouteData?.estimatedTime}
              transfers={plannedRouteData?.transfers}
              walkingDistance={plannedRouteData?.walkingDistance}
            />
          </motion.div>
        )}

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
        <GoogleMapsCanvas
          center={currentCoords ? [currentCoords.lng, currentCoords.lat] : city.center}
          zoom={12}
          markers={markers.map(m => ({
            id: m.id,
            position: m.position,
            type: m.type as "start" | "end" | "stop",
            label: m.label
          }))}
          routeLine={routeLine}
          className="h-full w-full"
          restrictToBounds={city.bounds}
          onMapClick={async (lat, lng) => {
            try {
              // Reverse geocode to get address
              const address = await googleMapsApi.reverseGeocode(lat, lng);
              
              // Add as new destination
              addDestination(address);
              
              // Set coordinates
              const newCoords = [...destinationCoords];
              newCoords.push({ lat, lng });
              setDestinationCoords(newCoords);
              
              console.log(`Added destination: ${address}`);
            } catch (error) {
              console.error("Error adding destination:", error);
            }
          }}
        />
      </div>
    </div>
  );
}
