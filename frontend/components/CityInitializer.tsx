"use client";

import { useEffect, useState } from "react";
import { useRouteStore } from "@/store/routeStore";
import CitySelector from "./CitySelector";
import { City, getDefaultCity } from "@/lib/cities";

export default function CityInitializer() {
  const { selectedCity, setSelectedCity } = useRouteStore();
  const [showCitySelector, setShowCitySelector] = useState(false);

  useEffect(() => {
    // Show city selector if no city is selected
    if (!selectedCity) {
      setShowCitySelector(true);
    }
  }, [selectedCity]);

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setShowCitySelector(false);
  };

  return (
    <CitySelector
      open={showCitySelector}
      onSelect={handleCitySelect}
    />
  );
}

