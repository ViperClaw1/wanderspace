import { motion } from "framer-motion";
import { MapPin, Compass, Route, Star, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Compass,
    title: "Discover Places",
    description: "Find the best spots in your city ranked by popularity",
  },
  {
    icon: Route,
    title: "Plan Routes",
    description: "Create personalized tours based on your interests",
  },
  {
    icon: Star,
    title: "Save Favorites",
    description: "Bookmark places you love for quick access later",
  },
];

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="container relative py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6"
            >
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">Discover your city</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Your Personal
              <span className="text-gradient block">Travel Guide</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Explore amazing places, create custom routes, and discover hidden gems 
              tailored to your interests. Your next adventure starts here.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                onClick={() => navigate(user ? "/explore" : "/signup")}
                className="gradient-primary text-primary-foreground text-lg px-8 h-14 shadow-glow"
              >
                {user ? "Start Exploring" : "Get Started Free"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              {!user && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="text-lg px-8 h-14"
                >
                  Sign In
                </Button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Plan your perfect trip with our comprehensive set of tools
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-8 shadow-card hover:shadow-elevated transition-all duration-300"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-primary mb-6">
                  <feature.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl gradient-primary p-12 md:p-16 text-center"
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary-foreground/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-primary-foreground/10 blur-3xl" />
            </div>

            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Explore?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
                Join thousands of travelers discovering amazing places every day.
              </p>
              <Button
                size="lg"
                onClick={() => navigate(user ? "/explore" : "/signup")}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-lg px-8 h-14"
              >
                {user ? "Go to Explore" : "Create Free Account"}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <MapPin className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Wanderly</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Wanderly. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
