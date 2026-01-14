"use client";

import { Button } from "@/components/ui/button";
import { RoutePreference } from "@/store/routeStore";
import { Clock, Footprints, RefreshCw } from "lucide-react";

interface RoutePreferencesProps {
  preference: RoutePreference;
  onChange: (value: RoutePreference) => void;
}

export default function RoutePreferences({
  preference,
  onChange,
}: RoutePreferencesProps) {
  const options: {
    value: RoutePreference;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      value: "fastest",
      label: "Fastest",
      icon: <Clock className="h-4 w-4" />,
    },
    {
      value: "least-walking",
      label: "Least Walking",
      icon: <Footprints className="h-4 w-4" />,
    },
    {
      value: "least-transfers",
      label: "Least Transfers",
      icon: <RefreshCw className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Route Preference</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={preference === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(option.value)}
            className="flex items-center space-x-2"
          >
            {option.icon}
            <span>{option.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

