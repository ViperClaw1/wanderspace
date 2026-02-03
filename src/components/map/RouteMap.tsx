import { lazy, Suspense } from "react";
import type { Place } from "@/lib/supabase";
import { MapErrorBoundary } from "./MapErrorBoundary";

// Lazy load the map component
const RouteMapInner = lazy(() => import("./RouteMapInner"));

interface RouteMapProps {
  places: Place[];
  showRoute?: boolean;
  className?: string;
}

export function RouteMap({ places, showRoute = false, className = "" }: RouteMapProps) {
  return (
    <MapErrorBoundary className={className}>
      <Suspense
        fallback={
          <div 
            className={`flex items-center justify-center bg-muted rounded-xl ${className}`} 
            style={{ minHeight: "300px" }}
          >
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        }
      >
        <RouteMapInner places={places} showRoute={showRoute} className={className} />
      </Suspense>
    </MapErrorBoundary>
  );
}
