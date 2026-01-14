import { create } from "zustand";

export type RoutePreference = "fastest" | "least-walking" | "least-transfers";

export interface RouteStep {
  type: "walk" | "bus" | "train" | "metro";
  label: string;
  duration: string;
}

export interface Route {
  routeId: string;
  estimatedTime: string;
  transfers: number;
  steps: RouteStep[];
}

interface RouteStore {
  currentLocation: string;
  destinations: string[];
  preference: RoutePreference;
  selectedRouteId?: string;
  routes: Route[];
  currentRoute?: Route;

  setCurrentLocation: (val: string) => void;
  addDestination: (val: string) => void;
  updateDestination: (index: number, val: string) => void;
  removeDestination: (index: number) => void;
  setPreference: (val: RoutePreference) => void;
  selectRoute: (id: string) => void;
  setRoutes: (routes: Route[]) => void;
  setCurrentRoute: (route?: Route) => void;
  clearRoute: () => void;
}

export const useRouteStore = create<RouteStore>((set) => ({
  currentLocation: "",
  destinations: [],
  preference: "fastest",
  routes: [],
  currentRoute: undefined,

  setCurrentLocation: (val) => set({ currentLocation: val }),
  addDestination: (val) =>
    set((state) => ({ destinations: [...state.destinations, val] })),
  updateDestination: (index, val) =>
    set((state) => {
      const newDests = [...state.destinations];
      newDests[index] = val;
      return { destinations: newDests };
    }),
  removeDestination: (index) =>
    set((state) => ({
      destinations: state.destinations.filter((_, i) => i !== index),
    })),
  setPreference: (val) => set({ preference: val }),
  selectRoute: (id) => set({ selectedRouteId: id }),
  setRoutes: (routes) => set({ routes }),
  setCurrentRoute: (route) => set({ currentRoute: route }),
  clearRoute: () =>
    set({
      currentLocation: "",
      destinations: [],
      selectedRouteId: undefined,
      routes: [],
      currentRoute: undefined,
    }),
}));

