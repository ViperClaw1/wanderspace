import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, X, GripVertical, Save, Loader2, Sparkles, Route } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Place } from "@/lib/supabase";
import { Header } from "@/components/layout/Header";
import { RouteMap } from "@/components/map/RouteMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RoutePlanner() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [availablePlaces, setAvailablePlaces] = useState<Place[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([]);
  const [routeName, setRouteName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchPlaces();
    }
  }, [user, profile?.city]);

  useEffect(() => {
    const placeId = searchParams.get("place");
    if (placeId && availablePlaces.length > 0) {
      const place = availablePlaces.find((p) => p.id === placeId);
      if (place && !selectedPlaces.find((p) => p.id === placeId)) {
        setSelectedPlaces((prev) => [...prev, place]);
      }
    }
  }, [searchParams, availablePlaces]);

  const fetchPlaces = async () => {
    let query = supabase
      .from("places")
      .select("*")
      .order("popularity_score", { ascending: false });

    if (profile?.city) {
      query = query.eq("city", profile.city);
    }

    const { data, error } = await query;

    if (!error && data) {
      setAvailablePlaces(data as Place[]);
    }
    setLoading(false);
  };

  const addPlace = (placeId: string) => {
    const place = availablePlaces.find((p) => p.id === placeId);
    if (place && !selectedPlaces.find((p) => p.id === placeId)) {
      setSelectedPlaces((prev) => [...prev, place]);
    }
  };

  const removePlace = (placeId: string) => {
    setSelectedPlaces((prev) => prev.filter((p) => p.id !== placeId));
  };

  const movePlace = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedPlaces.length) return;

    const newPlaces = [...selectedPlaces];
    [newPlaces[index], newPlaces[newIndex]] = [newPlaces[newIndex], newPlaces[index]];
    setSelectedPlaces(newPlaces);
  };

  const generateRoute = async () => {
    if (!profile?.preferences?.length) {
      toast({
        title: "Set your preferences first",
        description: "Go to your profile to set your interests for personalized recommendations.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);

    // Filter places by user preferences
    const matchingPlaces = availablePlaces.filter((place) =>
      profile.preferences.some(
        (pref) =>
          place.category.toLowerCase().includes(pref.toLowerCase()) ||
          place.description?.toLowerCase().includes(pref.toLowerCase())
      )
    );

    // Take top 5 matching places sorted by popularity
    const recommended = matchingPlaces.slice(0, 5);

    if (recommended.length === 0) {
      toast({
        title: "No matching places found",
        description: "Try updating your preferences or explore all available places.",
      });
    } else {
      setSelectedPlaces(recommended);
      setRouteName(`${profile.city || "City"} Adventure`);
      toast({
        title: "Route generated!",
        description: `We found ${recommended.length} places matching your interests.`,
      });
    }

    setGenerating(false);
  };

  const saveRoute = async () => {
    if (!routeName.trim()) {
      toast({
        title: "Name your route",
        description: "Please enter a name for your route.",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlaces.length < 2) {
      toast({
        title: "Add more places",
        description: "Your route needs at least 2 places.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("routes").insert({
      user_id: user!.id,
      name: routeName,
      route_data: selectedPlaces,
    });

    if (error) {
      toast({
        title: "Error saving route",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Route saved!",
        description: "You can find it in My Routes.",
      });
      navigate("/routes");
    }

    setSaving(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const unselectedPlaces = availablePlaces.filter(
    (p) => !selectedPlaces.find((sp) => sp.id === p.id)
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Plan Your Route
          </h1>
          <p className="text-muted-foreground">
            Create a personalized tour based on your preferences
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Route Builder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="bg-card rounded-2xl shadow-card p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="routeName">Route Name</Label>
                  <Input
                    id="routeName"
                    placeholder="My Amazing Tour"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                  />
                </div>

                <Button
                  onClick={generateRoute}
                  variant="outline"
                  className="w-full"
                  disabled={generating}
                >
                  {generating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate from My Preferences
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or add manually</span>
                  </div>
                </div>

                <Select onValueChange={addPlace}>
                  <SelectTrigger>
                    <Plus className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Add a place" />
                  </SelectTrigger>
                  <SelectContent>
                    {unselectedPlaces.map((place) => (
                      <SelectItem key={place.id} value={place.id}>
                        {place.name} - {place.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Places */}
              <div className="mt-6 space-y-3">
                <Label>Your Route ({selectedPlaces.length} stops)</Label>
                {selectedPlaces.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Route className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No places added yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedPlaces.map((place, index) => (
                      <motion.div
                        key={place.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-center gap-3 p-3 bg-secondary rounded-lg"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-primary-foreground text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{place.name}</p>
                          <p className="text-xs text-muted-foreground">{place.category}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => movePlace(index, "up")}
                            disabled={index === 0}
                            className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                          >
                            <GripVertical className="h-4 w-4 rotate-90" />
                          </button>
                          <button
                            onClick={() => removePlace(place.id)}
                            className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={saveRoute}
                className="w-full mt-6 gradient-primary text-primary-foreground"
                disabled={saving || selectedPlaces.length < 2}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Route
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          {/* Map Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <RouteMap
              places={selectedPlaces}
              showRoute={selectedPlaces.length > 1}
              className="h-[400px] lg:h-full lg:min-h-[600px]"
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
