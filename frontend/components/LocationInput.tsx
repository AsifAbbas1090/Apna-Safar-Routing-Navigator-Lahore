"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";
import { useState } from "react";

interface LocationInputProps {
  label: string;
  placeholder: string;
  value?: string;
  onChange: (value: string) => void;
  onDetectLocation?: () => void;
  required?: boolean;
  error?: string;
}

export default function LocationInput({
  label,
  placeholder,
  value = "",
  onChange,
  onDetectLocation,
  required = false,
  error,
}: LocationInputProps) {
  const [isDetecting, setIsDetecting] = useState(false);

  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // In production, this would reverse geocode to get address
        const address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        onChange(address);
        setIsDetecting(false);
        if (onDetectLocation) {
          onDetectLocation();
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to detect your location. Please enter manually.");
        setIsDetecting(false);
      }
    );
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, "-")}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={label.toLowerCase().replace(/\s+/g, "-")}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`pl-10 pr-24 ${error ? "border-destructive" : ""}`}
          required={required}
        />
        {onDetectLocation && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
            onClick={handleDetectLocation}
            disabled={isDetecting}
            aria-label="Detect location"
          >
            <Navigation className="h-4 w-4" />
          </Button>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

