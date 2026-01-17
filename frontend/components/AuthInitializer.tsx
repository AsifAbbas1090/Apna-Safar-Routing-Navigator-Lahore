"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

/**
 * AuthInitializer Component
 * Initializes authentication state on app load
 * This ensures auth state is checked when the app starts
 */
export default function AuthInitializer() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Check authentication status on app load
    checkAuth().catch((error: any) => {
      // Silently fail - user might not be logged in
      // Only log if it's not a 401 (which is expected for unauthenticated users)
      if (error?.status !== 401 && error?.message?.includes('401')) {
        console.debug("Auth check failed (expected if not logged in):", error);
      }
    });
  }, [checkAuth]);

  // This component doesn't render anything
  return null;
}

