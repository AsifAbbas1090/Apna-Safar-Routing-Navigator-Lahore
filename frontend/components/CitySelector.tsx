"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Search, X } from "lucide-react";
import { SUPPORTED_CITIES, City } from "@/lib/cities";
import { useRouteStore } from "@/store/routeStore";

interface CitySelectorProps {
  open: boolean;
  onSelect: (city: City) => void;
}

export default function CitySelector({ open, onSelect }: CitySelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCities, setFilteredCities] = useState<City[]>(SUPPORTED_CITIES);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      // Focus input when dialog opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCities(SUPPORTED_CITIES);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = SUPPORTED_CITIES.filter(
      (city) =>
        city.name.toLowerCase().includes(query) ||
        city.country.toLowerCase().includes(query)
    );
    setFilteredCities(filtered);
  }, [searchQuery]);

  const handleSelectCity = (city: City) => {
    onSelect(city);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span>Select Your City</span>
          </DialogTitle>
          <DialogDescription>
            Choose your city to get started with public transport navigation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Cities List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredCities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No cities found matching "{searchQuery}"</p>
              </div>
            ) : (
              filteredCities.map((city) => (
                <Card
                  key={city.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSelectCity(city)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{city.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {city.country}
                        </p>
                      </div>
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center">
            Only cities with government mass transit systems are available
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

