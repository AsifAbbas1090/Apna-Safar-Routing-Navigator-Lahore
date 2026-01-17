"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { LAHORE_CENTER } from "@/lib/mockData";

// Set Mapbox access token from environment variable
const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
if (!mapboxToken) {
  console.warn('⚠️ NEXT_PUBLIC_MAPBOX_TOKEN is not set. Map will not work. Get your token from https://account.mapbox.com/access-tokens/');
}
mapboxgl.accessToken = mapboxToken || '';

export interface MapMarker {
  id: string;
  position: [number, number];
  type: "start" | "end" | "stop" | "user";
}

interface MapCanvasProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  routeLine?: GeoJSON.LineString;
  className?: string;
}

export default function MapCanvas({
  center = LAHORE_CENTER,
  zoom = 12,
  markers = [],
  routeLine,
  className = "",
}: MapCanvasProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    if (!mapboxToken) {
      console.error('Mapbox token is missing. Please set NEXT_PUBLIC_MAPBOX_TOKEN in your .env.local file');
      return;
    }

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: center,
      zoom: zoom,
    });

    map.current.on("load", () => {
      setIsLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update map center
  useEffect(() => {
    if (map.current && isLoaded) {
      map.current.flyTo({
        center: center,
        zoom: zoom,
        duration: 1000,
      });
    }
  }, [center, zoom, isLoaded]);

  // Render markers
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Remove existing markers
    const existingMarkers = document.querySelectorAll(".map-marker");
    existingMarkers.forEach((marker) => marker.remove());

    // Add new markers
    markers.forEach((marker) => {
      const el = document.createElement("div");
      el.className = "map-marker";
      el.style.width = "24px";
      el.style.height = "24px";
      el.style.borderRadius = "50%";
      el.style.border = "3px solid white";
      el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";

      // Color based on type
      switch (marker.type) {
        case "start":
          el.style.backgroundColor = "#6B8E23"; // Olive green
          break;
        case "end":
          el.style.backgroundColor = "#0B0B0B"; // Black
          break;
        case "user":
          el.style.backgroundColor = "#3B82F6"; // Blue
          break;
        default:
          el.style.backgroundColor = "#6B7280"; // Gray
      }

      new mapboxgl.Marker(el)
        .setLngLat(marker.position)
        .addTo(map.current!);
    });
  }, [markers, isLoaded]);

  // Render route line
  useEffect(() => {
    if (!map.current || !isLoaded || !routeLine) return;

    const sourceId = "route";
    const layerId = "route-layer";

    // Remove existing route if any
    if (map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId);
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId);
    }

    // Add route source and layer
    map.current.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: routeLine,
      },
    });

    map.current.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#6B8E23",
        "line-width": 4,
        "line-dasharray": [2, 2],
      },
    });

    // Fit bounds to route
    const coordinates = routeLine.coordinates;
    const bounds = coordinates.reduce(
      (bounds, coord) => bounds.extend(coord as [number, number]),
      new mapboxgl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number])
    );
    map.current.fitBounds(bounds, {
      padding: 50,
      duration: 1000,
    });
  }, [routeLine, isLoaded]);

  return (
    <div
      ref={mapContainer}
      className={`h-full w-full ${className}`}
      style={{ minHeight: "400px" }}
    />
  );
}

