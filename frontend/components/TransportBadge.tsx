"use client";

import { Badge } from "@/components/ui/badge";

interface TransportBadgeProps {
  type: "walk" | "bus" | "train" | "metro";
  label?: string;
}

export default function TransportBadge({ type, label }: TransportBadgeProps) {
  const getConfig = () => {
    switch (type) {
      case "walk":
        return {
          emoji: "🚶",
          text: "Walk",
          className: "bg-gray-100 text-gray-800",
        };
      case "bus":
        return {
          emoji: "🚌",
          text: "Bus",
          className: "bg-blue-100 text-blue-800",
        };
      case "train":
        return {
          emoji: "🚇",
          text: "Train",
          className: "bg-orange-100 text-orange-800",
        };
      case "metro":
        return {
          emoji: "🚇",
          text: "Metro",
          className: "bg-primary/10 text-primary",
        };
      default:
        return {
          emoji: "📍",
          text: "Stop",
          className: "bg-gray-100 text-gray-800",
        };
    }
  };

  const config = getConfig();

  return (
    <Badge className={config.className}>
      <span className="mr-1">{config.emoji}</span>
      {label || config.text}
    </Badge>
  );
}

