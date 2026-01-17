"use client";

import { useState, useEffect } from "react";
import SavedRouteCard from "@/components/SavedRouteCard";
import { useRouteStore } from "@/store/routeStore";
import { motion } from "framer-motion";
import { Bookmark, Loader2 } from "lucide-react";
import { savedRoutesApi, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SavedPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { setCurrentLocation, addDestination, clearRoute } = useRouteStore();
  const [savedRoutes, setSavedRoutes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    loadSavedRoutes();
  }, [isAuthenticated, router]);

  const loadSavedRoutes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const routes = await savedRoutesApi.getAll();
      setSavedRoutes(routes);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to load saved routes");
      } else {
        setError("Failed to load saved routes");
      }
      console.error("Saved routes error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRoute = (from: string, to: string) => {
    clearRoute();
    setCurrentLocation(from);
    addDestination(to);
    router.push("/plan");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this saved route?")) {
      return;
    }

    setDeletingId(id);
    try {
      await savedRoutesApi.delete(id);
      setSavedRoutes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      if (err instanceof ApiError) {
        alert(err.message || "Failed to delete route");
      } else {
        alert("Failed to delete route");
      }
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-lg text-destructive mb-4">{error}</p>
          <Button onClick={loadSavedRoutes} variant="outline">
            Try again
          </Button>
        </div>
      </div>
    );
  }

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
          <p className="text-sm text-muted-foreground mb-4">
            Plan a route and save it for quick access later
          </p>
          <Button onClick={() => router.push("/plan")} variant="outline">
            Plan a Route
          </Button>
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
                name={route.savedName || `${route.startStop.name} → ${route.endStop.name}`}
                from={route.startStop.name}
                to={route.endStop.name}
                onStart={() => handleStartRoute(route.startStop.name, route.endStop.name)}
                onDelete={() => handleDelete(route.id)}
                isDeleting={deletingId === route.id}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
