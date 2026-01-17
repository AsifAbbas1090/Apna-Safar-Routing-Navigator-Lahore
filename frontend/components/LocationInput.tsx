"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouteStore } from "@/store/routeStore";
import { googleMapsApi } from "@/lib/api";
import { getDefaultCity } from "@/lib/cities";

interface LocationInputProps {
  label: string;
  placeholder: string;
  value?: string;
  onChange: (value: string) => void;
  onDetectLocation?: (coords?: { lat: number; lng: number }) => void;
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
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated } = useAuthStore();
  const { selectedCity } = useRouteStore();

  // Generate session token for autocomplete
  useEffect(() => {
    if (isAuthenticated && !sessionToken) {
      setSessionToken(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }
  }, [isAuthenticated, sessionToken]);

  // Handle autocomplete with Lahore, Pakistan restriction
  const handleInputChange = async (inputValue: string) => {
    onChange(inputValue);
    
    // Allow autocomplete for both authenticated and unauthenticated users
    if (inputValue.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      // Get current city or default to Lahore
      const city = selectedCity || getDefaultCity();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e959c8d5-c5d1-4ea5-b92d-9048dc30ea1b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LocationInput.tsx:58',message:'handleInputChange started',data:{inputValue,selectedCity:selectedCity?.name||'none',cityName:city.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      // Restrict autocomplete to selected city
      const results = await googleMapsApi.autocomplete(
        inputValue, 
        sessionToken,
        {
          componentRestrictions: { country: "pk" },
          locationBias: { 
            circle: { 
              center: { lat: city.center[1], lng: city.center[0] }, 
              radius: 50000 // 50km radius
            } 
          },
        }
      );
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e959c8d5-c5d1-4ea5-b92d-9048dc30ea1b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LocationInput.tsx:78',message:'handleInputChange error caught',data:{inputValue,errorMessage:error instanceof Error?error.message:String(error),errorType:error?.constructor?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.error("Autocomplete error:", error);
      setSuggestions([]);
      // Don't show error to user for autocomplete failures - just silently fail
      // The user can still type and use the location manually
    }
  };

  const handleSelectSuggestion = async (suggestion: any, event?: React.MouseEvent) => {
    // Prevent blur from closing dropdown
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    const selectedText = suggestion.description;
    onChange(selectedText);
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Geocode to get coordinates with city-specific bias
    try {
      const city = selectedCity || getDefaultCity();
      const coords = await googleMapsApi.geocode(selectedText, {
        componentRestrictions: { country: "pk" },
        locationBias: {
          circle: {
            center: { lat: city.center[1], lng: city.center[0] },
            radius: 50000, // 50km radius
          },
        },
      });
      if (onDetectLocation) {
        // Store coordinates for map and trigger callback
        (window as any).lastGeocodedCoords = coords;
        if (typeof onDetectLocation === 'function') {
          try {
            onDetectLocation(coords);
          } catch (e) {
            onDetectLocation();
          }
        } else {
          onDetectLocation();
        }
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsDetecting(true);
    
    // Use high accuracy with longer timeout for better location detection
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // Validate location is reasonable (within Lahore bounds approximately)
        const isInLahore = latitude >= 31.2 && latitude <= 31.7 && longitude >= 74.1 && longitude <= 74.6;
        
        if (!isInLahore) {
          console.warn(`Location seems outside Lahore: ${latitude}, ${longitude}. Accuracy: ${accuracy}m`);
          // Still use it but warn user
        }
        
        // Store coordinates immediately - this is critical for filling the input
        const coords = { lat: latitude, lng: longitude };
        (window as any).lastGeocodedCoords = coords;
        
        // Call onDetectLocation FIRST with coordinates so parent can update state
        if (onDetectLocation) {
          // Pass coordinates directly to callback
          if (typeof onDetectLocation === 'function') {
            // Check if callback accepts coordinates
            try {
              onDetectLocation(coords);
            } catch (e) {
              // Fallback to calling without params if it doesn't accept coords
              onDetectLocation();
            }
          } else {
            onDetectLocation();
          }
        }
        
        // Reverse geocode to get address
        try {
          const address = await googleMapsApi.reverseGeocode(latitude, longitude);
          onChange(address);
        } catch (error) {
          console.error("Reverse geocode error:", error);
          // Fallback to coordinates if reverse geocode fails
          const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          onChange(address);
        }
        
        setIsDetecting(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMessage = "Unable to detect your location.";
        if (error.code === 1) {
          errorMessage = "Location permission denied. Please enable location access in your browser settings.";
        } else if (error.code === 2) {
          errorMessage = "Location unavailable. Please check your GPS/network connection.";
        } else if (error.code === 3) {
          errorMessage = "Location request timed out. Please try again.";
        }
        alert(errorMessage);
        setIsDetecting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout
        maximumAge: 60000, // Accept cached location up to 1 minute old
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
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
        <Input
          ref={inputRef}
          id={label.toLowerCase().replace(/\s+/g, "-")}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => value.length >= 3 && suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={(e) => {
            // Store reference to the input element before setTimeout
            const inputElement = e.currentTarget;
            // Delay closing to allow click on suggestion
            setTimeout(() => {
              // Only close if focus didn't move to suggestion dropdown
              if (inputElement && !inputElement.contains(document.activeElement)) {
                setShowSuggestions(false);
              }
            }, 300);
          }}
          className={`pl-10 pr-24 ${error ? "border-destructive" : ""}`}
          required={required}
        />
        {onDetectLocation && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 z-10"
            onClick={handleDetectLocation}
            disabled={isDetecting}
            aria-label="Detect location"
          >
            <Navigation className="h-4 w-4" />
          </Button>
        )}
        
        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div 
            className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
            onMouseDown={(e) => e.preventDefault()} // Prevent input blur when clicking
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.place_id || index}
                type="button"
                className="w-full text-left px-4 py-2 hover:bg-muted focus:bg-muted focus:outline-none"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleSelectSuggestion(suggestion, e)}
              >
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{suggestion.structured_formatting?.main_text || suggestion.description}</p>
                    {suggestion.structured_formatting?.secondary_text && (
                      <p className="text-sm text-muted-foreground">{suggestion.structured_formatting.secondary_text}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

