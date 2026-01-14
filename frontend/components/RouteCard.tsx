"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Route } from "@/store/routeStore";
import { Clock, RefreshCw, Navigation } from "lucide-react";
import { useRouter } from "next/navigation";

interface RouteCardProps {
  route: Route;
  onSelect: () => void;
  isSelected?: boolean;
}

export default function RouteCard({
  route,
  onSelect,
  isSelected = false,
}: RouteCardProps) {
  const router = useRouter();

  const getStepIcon = (type: string) => {
    switch (type) {
      case "walk":
        return "🚶";
      case "bus":
        return "🚌";
      case "train":
      case "metro":
        return "🚇";
      default:
        return "📍";
    }
  };

  const handleStartNavigation = () => {
    onSelect();
    router.push("/live");
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onSelect}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{route.estimatedTime}</span>
            </div>
            {route.transfers > 0 && (
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <RefreshCw className="h-3 w-3" />
                <span>{route.transfers} transfer{route.transfers > 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {route.steps.map((step, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 text-sm"
            >
              <span className="text-lg">{getStepIcon(step.type)}</span>
              <div className="flex-1">
                <span className="font-medium">{step.label}</span>
                <span className="text-muted-foreground ml-2">
                  {step.duration}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            handleStartNavigation();
          }}
        >
          <Navigation className="mr-2 h-4 w-4" />
          Start Navigation
        </Button>
      </CardFooter>
    </Card>
  );
}

