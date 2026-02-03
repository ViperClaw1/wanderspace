import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Route, Plus, Trash2, MapPin, Calendar, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Route as RouteType, Place } from "@/lib/supabase";
import { Header } from "@/components/layout/Header";
import { RouteMap } from "@/components/map/RouteMap";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function MyRoutes() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [routes, setRoutes] = useState<RouteType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<RouteType | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchRoutes();
    }
  }, [user]);

  const fetchRoutes = async () => {
    const { data, error } = await supabase
      .from("routes")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRoutes(data as RouteType[]);
      if (data.length > 0 && !selectedRoute) {
        setSelectedRoute(data[0] as RouteType);
      }
    }
    setLoading(false);
  };

  const deleteRoute = async (routeId: string) => {
    const { error } = await supabase
      .from("routes")
      .delete()
      .eq("id", routeId);

    if (error) {
      toast({
        title: "Error deleting route",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Route deleted",
        description: "Your route has been removed.",
      });
      setRoutes((prev) => prev.filter((r) => r.id !== routeId));
      if (selectedRoute?.id === routeId) {
        setSelectedRoute(routes.find((r) => r.id !== routeId) || null);
      }
    }
  };

  if (authLoading || loading) {
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
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              My Routes
            </h1>
            <p className="text-muted-foreground">
              View and manage your saved routes
            </p>
          </div>
          <Button
            onClick={() => navigate("/route-planner")}
            className="gradient-primary text-primary-foreground"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Route
          </Button>
        </motion.div>

        {routes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Route className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No routes yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Create your first personalized route
            </p>
            <Button
              onClick={() => navigate("/route-planner")}
              className="gradient-primary text-primary-foreground"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Route
            </Button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Routes List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              {routes.map((route, index) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedRoute(route)}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    selectedRoute?.id === route.id
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-card shadow-card hover:shadow-elevated"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {route.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {(route.route_data as Place[])?.length || 0} stops
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(route.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete route?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete
                            your route "{route.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteRoute(route.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Route Details & Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              {selectedRoute ? (
                <div className="space-y-4">
                  <div className="bg-card rounded-xl shadow-card p-6">
                    <h2 className="text-xl font-bold text-foreground mb-4">
                      {selectedRoute.name}
                    </h2>
                    <div className="space-y-3">
                      {(selectedRoute.route_data as Place[])?.map((place, index) => (
                        <div
                          key={place.id}
                          className="flex items-center gap-3 p-3 bg-secondary rounded-lg"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-primary-foreground text-sm font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{place.name}</p>
                            <p className="text-xs text-muted-foreground">{place.category}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <RouteMap
                    places={(selectedRoute.route_data as Place[]) || []}
                    showRoute={true}
                    className="h-[400px]"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full bg-card rounded-xl">
                  <p className="text-muted-foreground">Select a route to view details</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
