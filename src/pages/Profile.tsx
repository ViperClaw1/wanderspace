import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, MapPin, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const CITIES = [
  "New York",
  "Paris",
  "Rome",
  "London",
  "Barcelona",
  "Tokyo",
  "Sydney",
  "Dubai",
];

const PREFERENCES = [
  "Museums",
  "Parks",
  "Historical",
  "Entertainment",
  "Food & Dining",
  "Shopping",
  "Nightlife",
  "Religious Sites",
  "Nature",
  "Adventure",
];

export default function Profile() {
  const { user, profile, updateProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [city, setCity] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setCity(profile.city || "");
      setPreferences(profile.preferences || []);
    }
  }, [profile]);

  const togglePreference = (pref: string) => {
    setPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const handleSave = async () => {
    setSaving(true);

    const { error } = await updateProfile({
      display_name: displayName,
      city,
      preferences,
    });

    if (error) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated!",
        description: "Your preferences have been saved.",
      });
    }

    setSaving(false);
  };

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-card rounded-2xl shadow-card p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-primary">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Your Profile</h1>
                <p className="text-muted-foreground">Personalize your experience</p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="displayName"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* City Selection */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Your City
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CITIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCity(c)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        city === c
                          ? "gradient-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-muted"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-3">
                <Label>What are you interested in?</Label>
                <div className="flex flex-wrap gap-2">
                  {PREFERENCES.map((pref) => (
                    <button
                      key={pref}
                      onClick={() => togglePreference(pref)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                        preferences.includes(pref)
                          ? "gradient-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-muted"
                      )}
                    >
                      {preferences.includes(pref) && <Check className="h-3 w-3" />}
                      {pref}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleSave}
                className="w-full gradient-primary text-primary-foreground"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
