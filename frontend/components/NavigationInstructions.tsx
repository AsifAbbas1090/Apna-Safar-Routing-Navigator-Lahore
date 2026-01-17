"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation, MapPin, Clock, Route } from "lucide-react";
import { motion } from "framer-motion";

interface NavigationInstructionsProps {
  instructions?: string[];
  estimatedTime?: number;
  transfers?: number;
  walkingDistance?: number;
}

export default function NavigationInstructions({
  instructions = [],
  estimatedTime,
  transfers,
  walkingDistance,
}: NavigationInstructionsProps) {
  if (!instructions || instructions.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Navigation className="h-5 w-5 text-primary" />
          <span>AI Navigation Guide</span>
        </CardTitle>
        <CardDescription>
          Step-by-step instructions to reach your destination
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          {(estimatedTime !== undefined || transfers !== undefined || walkingDistance !== undefined) && (
            <div className="grid grid-cols-3 gap-4 pb-4 border-b">
              {estimatedTime !== undefined && (
                <div className="text-center">
                  <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-medium">{estimatedTime} min</p>
                  <p className="text-xs text-muted-foreground">Total Time</p>
                </div>
              )}
              {transfers !== undefined && (
                <div className="text-center">
                  <Route className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-medium">{transfers}</p>
                  <p className="text-xs text-muted-foreground">Transfer{transfers !== 1 ? 's' : ''}</p>
                </div>
              )}
              {walkingDistance !== undefined && (
                <div className="text-center">
                  <MapPin className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-medium">{(walkingDistance / 1000).toFixed(1)} km</p>
                  <p className="text-xs text-muted-foreground">Walking</p>
                </div>
              )}
            </div>
          )}

          {/* Instructions List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {instructions.map((instruction, index) => {
              // Skip empty lines for cleaner display
              if (!instruction.trim()) {
                return <div key={index} className="h-2" />;
              }

              // Detect instruction type for styling
              const isHeader = instruction.startsWith('🚀') || instruction.startsWith('🔄') || instruction.startsWith('🚶') || instruction.startsWith('✅');
              const isStep = instruction.startsWith('📍') || instruction.startsWith('🚶') || instruction.startsWith('🚌') || instruction.startsWith('🚇') || instruction.startsWith('🚊');

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg ${
                    isHeader
                      ? 'bg-primary/10 border border-primary/20 font-semibold'
                      : isStep
                      ? 'bg-muted/50 border border-border'
                      : 'text-muted-foreground text-sm'
                  }`}
                >
                  <p 
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: instruction }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

