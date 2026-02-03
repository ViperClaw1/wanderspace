import { supabase } from "@/integrations/supabase/client";

export { supabase };

export type Profile = {
  id: string;
  user_id: string;
  display_name: string | null;
  city: string | null;
  preferences: string[];
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Place = {
  id: string;
  name: string;
  description: string | null;
  city: string;
  category: string;
  rating: number;
  popularity_score: number;
  image_url: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  opening_hours: string | null;
  created_at: string;
};

export type UserFavorite = {
  id: string;
  user_id: string;
  place_id: string;
  created_at: string;
};

export type Route = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  route_data: Place[];
  created_at: string;
  updated_at: string;
};
