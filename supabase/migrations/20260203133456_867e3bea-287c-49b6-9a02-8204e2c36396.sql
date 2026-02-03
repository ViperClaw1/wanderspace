-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  city TEXT,
  preferences TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create places table
CREATE TABLE public.places (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  city TEXT NOT NULL,
  category TEXT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  popularity_score INTEGER DEFAULT 0,
  image_url TEXT,
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  opening_hours TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_favorites table
CREATE TABLE public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, place_id)
);

-- Create routes table
CREATE TABLE public.routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  route_data JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Places RLS policies (publicly viewable)
CREATE POLICY "Anyone can view places"
  ON public.places FOR SELECT
  USING (true);

-- User favorites RLS policies
CREATE POLICY "Users can view their own favorites"
  ON public.user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
  ON public.user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Routes RLS policies
CREATE POLICY "Users can view their own routes"
  ON public.routes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own routes"
  ON public.routes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routes"
  ON public.routes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routes"
  ON public.routes FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for profile auto-creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_routes_updated_at
  BEFORE UPDATE ON public.routes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample places data
INSERT INTO public.places (name, description, city, category, rating, popularity_score, image_url, address, latitude, longitude, opening_hours) VALUES
('Central Park', 'A sprawling urban oasis with walking paths, lakes, and iconic landmarks', 'New York', 'Park', 4.8, 9500, 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800', 'Central Park, New York, NY', 40.7829, -73.9654, '6:00 AM - 1:00 AM'),
('Statue of Liberty', 'Iconic copper statue symbolizing freedom and democracy', 'New York', 'Monument', 4.7, 8900, 'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?w=800', 'Liberty Island, New York, NY', 40.6892, -74.0445, '9:00 AM - 5:00 PM'),
('Times Square', 'The bustling heart of Manhattan with bright lights and theaters', 'New York', 'Entertainment', 4.5, 9200, 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800', 'Times Square, Manhattan, NY', 40.7580, -73.9855, '24 Hours'),
('Brooklyn Bridge', 'Historic suspension bridge with stunning city views', 'New York', 'Landmark', 4.6, 8700, 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800', 'Brooklyn Bridge, New York, NY', 40.7061, -73.9969, '24 Hours'),
('Empire State Building', 'Iconic Art Deco skyscraper with observation decks', 'New York', 'Landmark', 4.7, 8800, 'https://images.unsplash.com/photo-1555109307-f7d9da25c244?w=800', '350 5th Ave, New York, NY', 40.7484, -73.9857, '10:00 AM - 12:00 AM'),
('Eiffel Tower', 'Iconic iron lattice tower and symbol of Paris', 'Paris', 'Monument', 4.9, 9800, 'https://images.unsplash.com/photo-1511739001486-6bfe10ce65f4?w=800', 'Champ de Mars, Paris, France', 48.8584, 2.2945, '9:00 AM - 11:45 PM'),
('Louvre Museum', 'World-famous art museum home to the Mona Lisa', 'Paris', 'Museum', 4.8, 9400, 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800', 'Rue de Rivoli, Paris, France', 48.8606, 2.3376, '9:00 AM - 6:00 PM'),
('Notre-Dame Cathedral', 'Medieval Catholic cathedral with Gothic architecture', 'Paris', 'Religious', 4.7, 8500, 'https://images.unsplash.com/photo-1478391679764-b2d8b3cd1e94?w=800', '6 Parvis Notre-Dame, Paris, France', 48.8530, 2.3499, '8:00 AM - 6:45 PM'),
('Colosseum', 'Ancient Roman amphitheater and iconic symbol of Rome', 'Rome', 'Historical', 4.9, 9600, 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800', 'Piazza del Colosseo, Rome, Italy', 41.8902, 12.4922, '8:30 AM - 7:00 PM'),
('Vatican Museums', 'Vast collection of art and historical artifacts', 'Rome', 'Museum', 4.8, 9300, 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800', 'Viale Vaticano, Rome, Italy', 41.9065, 12.4536, '9:00 AM - 6:00 PM'),
('Big Ben', 'Iconic clock tower and symbol of London', 'London', 'Landmark', 4.6, 8600, 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=800', 'Westminster, London, UK', 51.5007, -0.1246, 'External viewing only'),
('Tower of London', 'Historic castle and former royal residence', 'London', 'Historical', 4.7, 8800, 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800', 'St Katharine & Wapping, London, UK', 51.5081, -0.0759, '9:00 AM - 5:30 PM'),
('British Museum', 'World-renowned museum of human history and culture', 'London', 'Museum', 4.8, 9200, 'https://images.unsplash.com/photo-1590166152236-c5e5c0e64988?w=800', 'Great Russell St, London, UK', 51.5194, -0.1270, '10:00 AM - 5:00 PM'),
('Sagrada Familia', 'Gaudis unfinished masterpiece basilica', 'Barcelona', 'Religious', 4.9, 9500, 'https://images.unsplash.com/photo-1583422409516-2895a77efed6?w=800', 'Carrer de Mallorca, Barcelona, Spain', 41.4036, 2.1744, '9:00 AM - 8:00 PM'),
('Park Güell', 'Colorful mosaic park designed by Gaudí', 'Barcelona', 'Park', 4.7, 8900, 'https://images.unsplash.com/photo-1583422409516-2895a77efed6?w=800', 'Carrer dOlot, Barcelona, Spain', 41.4145, 2.1527, '9:30 AM - 7:30 PM');
