"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface SavedRouteCardProps {
  name: string;
  from: string;
  to: string;
  onStart: () => void;
  onDelete?: () => void;
}

export default function SavedRouteCard({
  name,
  from,
  to,
  onStart,
  onDelete,
}: SavedRouteCardProps) {
  const router = useRouter();

  const handleStart = () => {
    onStart();
    router.push("/plan");
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <h3 className="font-semibold text-lg mb-4">{name}</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">From</p>
              <p className="font-medium">{from}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">To</p>
              <p className="font-medium">{to}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex space-x-2">
        <Button className="flex-1" onClick={handleStart}>
          <ArrowRight className="mr-2 h-4 w-4" />
          Start Route
        </Button>
        {onDelete && (
          <Button variant="outline" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

