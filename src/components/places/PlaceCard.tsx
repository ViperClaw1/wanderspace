import { motion } from "framer-motion";
import { Star, MapPin, Clock, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import type { Place } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface PlaceCardProps {
  place: Place;
  index?: number;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function PlaceCard({ place, index = 0, isFavorite, onToggleFavorite }: PlaceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="group"
    >
      <Link to={`/place/${place.id}`}>
        <div className="relative overflow-hidden rounded-xl bg-card shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
          {/* Image */}
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={place.image_url || "/placeholder.svg"}
              alt={place.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
          </div>

          {/* Favorite button */}
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleFavorite();
              }}
              className={cn(
                "absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-all hover:bg-background",
                isFavorite && "text-accent"
              )}
            >
              <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
            </button>
          )}

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center rounded-full bg-background/80 backdrop-blur-sm px-3 py-1 text-xs font-medium text-foreground">
              {place.category}
            </span>
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-primary-foreground">
            <h3 className="text-lg font-semibold mb-1 line-clamp-1">{place.name}</h3>
            <div className="flex items-center gap-3 text-sm opacity-90">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span>{place.rating?.toFixed(1) || "N/A"}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="line-clamp-1">{place.city}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function PlaceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-card">
      <div className="aspect-[4/3] bg-muted animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
}
