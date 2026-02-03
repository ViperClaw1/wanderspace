import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MapPin, Clock, ArrowLeft, Heart, Share2, Navigation } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Place } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { RouteMap } from "@/components/map/RouteMap";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PlaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPlace();
      if (user) {
        checkFavorite();
      }
    }
  }, [id, user]);

  const fetchPlace = async () => {
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      setPlace(data as Place);
    }
    setLoading(false);
  };

  const checkFavorite = async () => {
    const { data } = await supabase
      .from("user_favorites")
      .select("id")
      .eq("user_id", user!.id)
      .eq("place_id", id)
      .single();

    setIsFavorite(!!data);
  };

  const toggleFavorite = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (isFavorite) {
      await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("place_id", id);
      setIsFavorite(false);
    } else {
      await supabase
        .from("user_favorites")
        .insert({ user_id: user.id, place_id: id });
      setIsFavorite(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-32 bg-muted rounded" />
            <div className="aspect-video bg-muted rounded-xl" />
            <div className="h-10 w-3/4 bg-muted rounded" />
            <div className="h-4 w-1/2 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Place not found</h1>
          <Button onClick={() => navigate("/explore")} className="mt-4">
            Back to Explore
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </motion.button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image & Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-elevated">
              <img
                src={place.image_url || "/placeholder.svg"}
                alt={place.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={toggleFavorite}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-all hover:bg-background",
                    isFavorite && "text-accent"
                  )}
                >
                  <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-all hover:bg-background">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center rounded-full bg-background/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-foreground">
                  {place.category}
                </span>
              </div>
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {place.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-accent">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="font-semibold">{place.rating?.toFixed(1) || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>{place.address || place.city}</span>
                </div>
                {place.opening_hours && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-5 w-5" />
                    <span>{place.opening_hours}</span>
                  </div>
                )}
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {place.description || "No description available."}
              </p>

              <div className="flex gap-4 mt-8">
                <Button
                  className="flex-1 gradient-primary text-primary-foreground"
                  onClick={() => {
                    if (place.latitude && place.longitude) {
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`,
                        "_blank"
                      );
                    }
                  }}
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  Get Directions
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/route-planner?place=${place.id}`)}
                >
                  Add to Route
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <RouteMap places={[place]} className="h-[400px] lg:h-full lg:min-h-[500px]" />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
