"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";
import { loadGoogleMapsScript } from "@/lib/googleMapsLoader";

interface GoogleMapsCanvasProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    position: [number, number];
    type: "start" | "end" | "stop";
    label?: string; // For A, B, C labels
  }>;
  routeLine?: google.maps.PolylineOptions;
  className?: string;
  onMapLoad?: () => void;
  restrictToBounds?: google.maps.LatLngBounds | {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  onMapClick?: (lat: number, lng: number) => void; // Callback for map clicks
}

declare global {
  interface Window {
    google: typeof google;
    initGoogleMap: () => void;
  }
}

export default function GoogleMapsCanvas({
  center,
  zoom = 12,
  markers = [],
  routeLine,
  className = "",
  onMapLoad,
  restrictToBounds,
  onMapClick,
}: GoogleMapsCanvasProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuthStore();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const initializedRef = useRef(false);

  // Initialize map only once
  useEffect(() => {
    if (!apiKey || initializedRef.current) {
      if (!apiKey) {
        setError("Google Maps API key not configured");
        setIsLoading(false);
      }
      return;
    }

    if (!mapRef.current) return;

    // Load Google Maps script using the global loader
    loadGoogleMapsScript(apiKey)
      .then(() => {
        initializeMap();
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load Google Maps");
        setIsLoading(false);
      });

    function initializeMap() {
      if (!mapRef.current || initializedRef.current) return;

      try {
        // Check if Google Maps is fully loaded and ready
        if (!window.google || !window.google.maps || !window.google.maps.Map) {
          console.error('Google Maps API not fully loaded');
          setError('Google Maps API not fully loaded. Please check your API key.');
          setIsLoading(false);
          return;
        }

        // Create bounds from provided bounds object or use default
        let mapBounds: google.maps.LatLngBounds;
        if (restrictToBounds) {
          // If it's already a LatLngBounds instance, use it
          if (restrictToBounds instanceof window.google.maps.LatLngBounds) {
            mapBounds = restrictToBounds;
          } else {
            // If it's a bounds object with north/south/east/west, create LatLngBounds
            const bounds = restrictToBounds as { north: number; south: number; east: number; west: number };
            mapBounds = new window.google.maps.LatLngBounds(
              { lat: bounds.south, lng: bounds.west },
              { lat: bounds.north, lng: bounds.east }
            );
          }
        } else {
          // Default: Lahore bounds
          mapBounds = new window.google.maps.LatLngBounds(
            { lat: 31.35, lng: 74.20 }, // Southwest corner
            { lat: 31.65, lng: 74.50 }  // Northeast corner
          );
        }

        // Initialize map with city restrictions
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: center[1], lng: center[0] },
          zoom,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          restriction: restrictToBounds ? {
            latLngBounds: mapBounds,
            strictBounds: false, // Allow slight panning outside bounds
          } : undefined,
        });

        mapInstanceRef.current = map;
        initializedRef.current = true;

        // Add click listener for adding stops (only once)
        if (onMapClick) {
          // Remove existing listener if any
          if (clickListenerRef.current) {
            google.maps.event.removeListener(clickListenerRef.current);
          }
          clickListenerRef.current = map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng && onMapClick) {
              onMapClick(e.latLng.lat(), e.latLng.lng());
            }
          });
        }

        setIsLoading(false);
        setError(null);
        onMapLoad?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize map");
        setIsLoading(false);
      }
    }

    // Cleanup
    return () => {
      if (clickListenerRef.current) {
        google.maps.event.removeListener(clickListenerRef.current);
        clickListenerRef.current = null;
      }
    };
  }, [apiKey]); // Only depend on apiKey for initialization

  // Update map center and zoom without reinitializing
  useEffect(() => {
    if (mapInstanceRef.current && initializedRef.current) {
      const currentCenter = mapInstanceRef.current.getCenter();
      const newCenter = { lat: center[1], lng: center[0] };
      
      // Only update if center actually changed (prevent unnecessary updates)
      if (!currentCenter || 
          Math.abs(currentCenter.lat() - newCenter.lat) > 0.0001 || 
          Math.abs(currentCenter.lng() - newCenter.lng) > 0.0001) {
        mapInstanceRef.current.setCenter(newCenter);
      }
      
      const currentZoom = mapInstanceRef.current.getZoom();
      if (currentZoom !== zoom) {
        mapInstanceRef.current.setZoom(zoom);
      }
    }
  }, [center, zoom]);

  // Update click listener when onMapClick changes
  useEffect(() => {
    if (!mapInstanceRef.current || !initializedRef.current) return;

    // Remove existing listener
    if (clickListenerRef.current) {
      google.maps.event.removeListener(clickListenerRef.current);
      clickListenerRef.current = null;
    }

    // Add new listener if onMapClick is provided
    if (onMapClick) {
      clickListenerRef.current = mapInstanceRef.current.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          onMapClick(e.latLng.lat(), e.latLng.lng());
        }
      });
    }
  }, [onMapClick]);

  // Update markers without reinitializing map
  useEffect(() => {
    if (!mapInstanceRef.current || !initializedRef.current) return;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach((marker, index) => {
      const label = marker.label || (marker.type === 'start' ? 'A' : marker.type === 'end' ? 'B' : String.fromCharCode(67 + index));
      const icon = getMarkerIcon(marker.type, label);
      const googleMarker = new window.google.maps.Marker({
        position: { lat: marker.position[1], lng: marker.position[0] },
        map: mapInstanceRef.current!,
        icon,
        title: marker.id,
        label: {
          text: label,
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: 'bold',
        },
      });
      markersRef.current.push(googleMarker);
    });
  }, [markers]);

  // Update route line without reinitializing map
  useEffect(() => {
    if (!mapInstanceRef.current || !initializedRef.current) return;

    // Remove existing polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    // Add new route line if provided
    if (routeLine && routeLine.path && window.google.maps.Polyline) {
      const polyline = new window.google.maps.Polyline({
        path: routeLine.path,
        map: mapInstanceRef.current,
        strokeColor: routeLine.strokeColor || "#16a34a",
        strokeWeight: routeLine.strokeWeight || 4,
        strokeOpacity: routeLine.strokeOpacity || 0.8,
      });
      polylineRef.current = polyline;
    }
  }, [routeLine]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
      if (clickListenerRef.current) {
        google.maps.event.removeListener(clickListenerRef.current);
      }
    };
  }, []);

  const getMarkerIcon = (type: "start" | "end" | "stop", label?: string) => {
    const colors = {
      start: "#16a34a", // Green
      end: "#dc2626", // Red
      stop: "#f59e0b", // Amber
    };

    // Use larger icon for labeled markers (A, B, C...)
    return {
      path: window.google?.maps.SymbolPath.CIRCLE,
      scale: label ? 14 : 8,
      fillColor: colors[type],
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: label ? 3 : 2,
    };
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <div className="text-center">
          <p className="text-destructive mb-2">{error}</p>
          <p className="text-sm text-muted-foreground">
            Please check your Google Maps API key configuration
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}

