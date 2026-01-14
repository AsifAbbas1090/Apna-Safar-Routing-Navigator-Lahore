"use client";

import { savedRoutes } from "@/lib/mockData";
import SavedRouteCard from "@/components/SavedRouteCard";
import { useRouteStore } from "@/store/routeStore";
import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";

export default function SavedPage() {
  const { setCurrentLocation, addDestination, clearRoute } = useRouteStore();

  const handleStartRoute = (from: string, to: string) => {
    clearRoute();
    setCurrentLocation(from);
    addDestination(to);
  };

  const handleDelete = (id: string) => {
    // In production, this would call an API to delete the saved route
    console.log("Delete route:", id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-2">
          <Bookmark className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Saved Routes</h1>
        </div>
        <p className="text-muted-foreground">
          Quick access to your frequently used routes
        </p>
      </div>

      {savedRoutes.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground mb-4">
            No saved routes yet
          </p>
          <p className="text-sm text-muted-foreground">
            Plan a route and save it for quick access later
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savedRoutes.map((route, index) => (
            <motion.div
              key={route.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <SavedRouteCard
                name={route.name}
                from={route.from}
                to={route.to}
                onStart={() => handleStartRoute(route.from, route.to)}
                onDelete={() => handleDelete(route.id)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

