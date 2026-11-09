export type Caffeine = "decaf" | "light" | "regular" | "high";
export type Temp = "hot" | "iced" | "both";
export type Mood = "cozy" | "refreshing" | "indulgent" | "clean";
export type Plan = "grab" | "work" | "catchup" | "treat";
export type DistanceChoice = "5" | "15" | "trip";

export interface Drink {
  name: string;
  caffeine: Caffeine;
  temp: Temp;
  tags: string[];
  sweetness: number; // 0 (none) – 3 (very sweet)
  unusual?: boolean;
}

export interface Cafe {
  id: string;
  name: string;
  chain?: string;
  neighborhood: string;
  lat: number;
  lng: number;
  priceLevel: number; // 1–4
  rating: number;
  reviews: number;
  openMin: number; // minutes after midnight
  closeMin: number;
  tags: string[];
  noNonDairy?: boolean;
  drinks: Drink[];
  reviewSnippets: string[];
  promoted?: boolean;
  offers?: Offer[];
}

export interface Offer {
  text: string;
  startMin: number;
  endMin: number;
  purposes: Plan[];
  code: string;
}

export type PassReason = "vibe" | "drink" | "far" | "been";

export interface Profile {
  budget: number; // max price level 1–4
  caffeineSensitive: boolean;
  needsNonDairy: boolean;
  radiusScale: number; // shrinks 10% on each "Too far"
  tagWeights: Record<string, number>;
  passes: { cafeId: string; reason: PassReason; at: number }[];
  seenCafeIds: string[];
  milk?: "whole" | "oat" | "almond" | "black" | undefined;
  usualOrder?: string;
  caffeineTolerance?: "sensitive" | "normal" | "high" | undefined;
}

export interface CheckIn {
  battery: number;
  mood: Mood;
  plan: Plan;
  distance: DistanceChoice;
  note?: string;
  adventurous?: boolean;
  duration?: "1h" | "2-3h" | "allday" | undefined;
}

export interface RecoContext {
  now: number; // epoch ms
  localMinutes: number; // user's local minutes after midnight
  tempF?: number;
  raining?: boolean;
  lat: number;
  lng: number;
}

export interface Needs {
  caffeine: Caffeine;
  temp: "hot" | "iced" | "any";
  flavorTags: string[];
  sweetness: "low" | "high" | "any";
  requiredTags: string[];
  radiusM: number;
}

export interface RecoCard {
  cafeId: string;
  name: string;
  neighborhood: string;
  distanceM: number;
  walkMin: number;
  match: number;
  rawScore: number;
  heroDrink: string;
  heroLine: string;
  why: string;
  cafeTags: string[];
  drinkTags: string[];
  wildcard: boolean;
  priceLevel: number;
  rating: number;
  promoted: boolean;
  offer: Offer | null;
  reviewSnippets: string[];
  drinks: string[];
  hours: string;
}

export interface Preferences {
  purpose: Plan;
  duration: "1h" | "2-3h" | "allday" | null;
  energy: "low" | "medium" | "high";
  mood: Mood;
  social_battery: number;
  temperature: "hot" | "iced";
  flavor_tags: string[];
  caffeine_level: Caffeine;
  noise: "quiet" | "moderate" | "lively";
  needs_outlets: boolean;
  needs_wifi: boolean;
  drink: string | null;
  budget: number;
  radius_minutes: number;
}

export type SwipeAction =
  | "heart"
  | "heartDrink"
  | "heartVibe"
  | "goNow"
  | "passVibe"
  | "passDrink"
  | "passFar"
  | "passBeen";
