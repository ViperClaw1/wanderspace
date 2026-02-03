import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Place } from "@/lib/supabase";

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const createNumberedIcon = (number: number) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background: linear-gradient(135deg, hsl(174, 62%, 40%) 0%, hsl(174, 72%, 50%) 100%);
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    ">${number}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

interface MapBoundsUpdaterProps {
  places: Place[];
}

function MapBoundsUpdater({ places }: MapBoundsUpdaterProps) {
  const map = useMap();

  useEffect(() => {
    if (places.length > 0) {
      const validPlaces = places.filter((p) => p.latitude && p.longitude);
      if (validPlaces.length > 0) {
        const bounds = L.latLngBounds(
          validPlaces.map((p) => [p.latitude!, p.longitude!])
        );
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [places, map]);

  return null;
}

interface RouteMapProps {
  places: Place[];
  showRoute?: boolean;
  className?: string;
}

export function RouteMap({ places, showRoute = false, className = "" }: RouteMapProps) {
  const validPlaces = places.filter((p) => p.latitude && p.longitude);

  if (validPlaces.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-xl ${className}`}>
        <p className="text-muted-foreground">No location data available</p>
      </div>
    );
  }

  const center: [number, number] = [
    validPlaces[0].latitude!,
    validPlaces[0].longitude!,
  ];

  const routeCoordinates: [number, number][] = validPlaces.map((p) => [
    p.latitude!,
    p.longitude!,
  ]);

  return (
    <div className={`rounded-xl overflow-hidden shadow-card ${className}`}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBoundsUpdater places={validPlaces} />

        {validPlaces.map((place, index) => (
          <Marker
            key={place.id}
            position={[place.latitude!, place.longitude!]}
            icon={showRoute ? createNumberedIcon(index + 1) : undefined}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-semibold text-sm">{place.name}</h3>
                <p className="text-xs text-muted-foreground">{place.category}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {showRoute && validPlaces.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            color="hsl(174, 62%, 40%)"
            weight={4}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}
      </MapContainer>
    </div>
  );
}
