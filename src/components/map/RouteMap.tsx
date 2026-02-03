import { lazy, Suspense } from "react";
import type { Place } from "@/lib/supabase";

// Lazy load the map component to avoid React 18 context consumer issues
const RouteMapInner = lazy(() => import("./RouteMapInner"));

interface RouteMapProps {
  places: Place[];
  showRoute?: boolean;
  className?: string;
}

export function RouteMap({ places, showRoute = false, className = "" }: RouteMapProps) {
  return (
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
  );
}
