"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressStepperProps {
  steps: string[];
  currentStepIndex: number;
  orientation?: "horizontal" | "vertical";
}

export default function ProgressStepper({
  steps,
  currentStepIndex,
  orientation = "vertical",
}: ProgressStepperProps) {
  if (orientation === "horizontal") {
    return (
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                  index < currentStepIndex
                    ? "border-primary bg-primary text-white"
                    : index === currentStepIndex
                    ? "border-primary bg-primary text-white"
                    : "border-muted bg-background text-muted-foreground"
                )}
              >
                {index < currentStepIndex ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs",
                  index <= currentStepIndex
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-0.5 w-12",
                  index < currentStepIndex ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start space-x-4">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                index < currentStepIndex
                  ? "border-primary bg-primary text-white"
                  : index === currentStepIndex
                  ? "border-primary bg-primary text-white"
                  : "border-muted bg-background text-muted-foreground"
              )}
            >
              {index < currentStepIndex ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-xs font-medium">{index + 1}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "my-2 h-8 w-0.5",
                  index < currentStepIndex ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
          <div className="flex-1 pt-1">
            <p
              className={cn(
                "text-sm",
                index <= currentStepIndex
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {step}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

