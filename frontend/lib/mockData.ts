import { Route } from "@/store/routeStore";

export const mockRoutes: Route[] = [
  {
    routeId: "route-1",
    estimatedTime: "38 mins",
    transfers: 1,
    steps: [
      { type: "walk", label: "Walk to Thokar Station", duration: "5 min" },
      { type: "train", label: "Orange Line to GPO", duration: "25 min" },
      { type: "walk", label: "Walk to PUCIT", duration: "8 min" },
    ],
  },
  {
    routeId: "route-2",
    estimatedTime: "42 mins",
    transfers: 2,
    steps: [
      { type: "walk", label: "Walk to Metro Bus Stop", duration: "3 min" },
      { type: "bus", label: "Metro Bus to Kalma Chowk", duration: "20 min" },
      { type: "walk", label: "Walk to Orange Line", duration: "2 min" },
      { type: "train", label: "Orange Line to GPO", duration: "15 min" },
      { type: "walk", label: "Walk to PUCIT", duration: "2 min" },
    ],
  },
  {
    routeId: "route-3",
    estimatedTime: "45 mins",
    transfers: 0,
    steps: [
      { type: "walk", label: "Walk to nearest stop", duration: "8 min" },
      { type: "bus", label: "Direct bus to PUCIT", duration: "35 min" },
      { type: "walk", label: "Walk to destination", duration: "2 min" },
    ],
  },
];

export const savedRoutes = [
  {
    id: "saved-1",
    name: "Home → Office",
    from: "Thokar Niaz Baig",
    to: "PUCIT, Lahore",
  },
  {
    id: "saved-2",
    name: "University → Hostel",
    from: "PUCIT, Lahore",
    to: "Johar Town",
  },
  {
    id: "saved-3",
    name: "Airport → Home",
    from: "Allama Iqbal Airport",
    to: "Thokar Niaz Baig",
  },
];

// Lahore coordinates
export const LAHORE_CENTER: [number, number] = [74.3587, 31.5204];

