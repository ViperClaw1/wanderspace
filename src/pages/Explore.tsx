import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Filter, MapPin, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Place } from "@/lib/supabase";
import { Header } from "@/components/layout/Header";
import { PlaceCard, PlaceCardSkeleton } from "@/components/places/PlaceCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = ["All", "Park", "Museum", "Historical", "Monument", "Landmark", "Entertainment", "Religious"];

export default function Explore() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [places, setPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchPlaces();
      fetchFavorites();
    }
  }, [user, profile?.city]);

  const fetchPlaces = async () => {
    setLoading(true);
    let query = supabase
      .from("places")
      .select("*")
      .order("popularity_score", { ascending: false });

    if (profile?.city) {
      query = query.eq("city", profile.city);
    }

    const { data, error } = await query;

    if (!error && data) {
      setPlaces(data as Place[]);
      setFilteredPlaces(data as Place[]);
    }
    setLoading(false);
  };

  const fetchFavorites = async () => {
    const { data, error } = await supabase
      .from("user_favorites")
      .select("place_id")
      .eq("user_id", user!.id);

    if (!error && data) {
      setFavorites(data.map((f) => f.place_id));
    }
  };

  const toggleFavorite = async (placeId: string) => {
    if (favorites.includes(placeId)) {
      await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user!.id)
        .eq("place_id", placeId);
      setFavorites((prev) => prev.filter((id) => id !== placeId));
    } else {
      await supabase
        .from("user_favorites")
        .insert({ user_id: user!.id, place_id: placeId });
      setFavorites((prev) => [...prev, placeId]);
    }
  };

  useEffect(() => {
    let filtered = places;

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    setFilteredPlaces(filtered);
  }, [searchQuery, selectedCategory, places]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-primary mb-2">
            <MapPin className="h-5 w-5" />
            <span className="font-medium">{profile?.city || "All Cities"}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Discover Amazing Places
          </h1>
          <p className="text-muted-foreground">
            {profile?.city
              ? `Explore the best spots in ${profile.city}`
              : "Set your city in your profile to see personalized recommendations"}
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => navigate("/route-planner")}
            className="gradient-primary text-primary-foreground"
          >
            Plan a Route
          </Button>
        </motion.div>

        {/* Places Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <PlaceCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredPlaces.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No places found</h2>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPlaces.map((place, index) => (
              <PlaceCard
                key={place.id}
                place={place}
                index={index}
                isFavorite={favorites.includes(place.id)}
                onToggleFavorite={() => toggleFavorite(place.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
