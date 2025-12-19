
-- Create enums
CREATE TYPE public.app_role AS ENUM ('bureau', 'admin', 'respo', 'member', 'embesa');
CREATE TYPE public.committee_type AS ENUM ('Sponsoring', 'Communication', 'Event', 'Technique', 'Media', 'Bureau');
CREATE TYPE public.user_status AS ENUM ('active', 'embesa', 'banned');
CREATE TYPE public.post_visibility AS ENUM ('public', 'internal_all', 'committee_only');
CREATE TYPE public.event_type AS ENUM ('online', 'presential');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  committee committee_type,
  status user_status NOT NULL DEFAULT 'active',
  avatar_url TEXT,
  total_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'member',
  UNIQUE (user_id, role)
);

-- Create points_log table
CREATE TABLE public.points_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_description TEXT NOT NULL,
  complexity_score INTEGER NOT NULL CHECK (complexity_score > 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  admin_comment TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create posts table
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visibility post_visibility NOT NULL DEFAULT 'internal_all',
  committee_tag committee_type,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  location TEXT,
  type event_type NOT NULL DEFAULT 'presential',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user has elevated role (bureau, admin, or respo)
CREATE OR REPLACE FUNCTION public.has_elevated_role(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('bureau', 'admin', 'respo')
  )
$$;

-- Function to get user's committee
CREATE OR REPLACE FUNCTION public.get_user_committee(_user_id UUID)
RETURNS committee_type
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT committee FROM public.profiles WHERE id = _user_id
$$;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own role"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id OR public.has_elevated_role(auth.uid()));

CREATE POLICY "Only bureau/admin can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'bureau') OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for points_log
CREATE POLICY "Users can view own points"
ON public.points_log FOR SELECT
USING (member_id = auth.uid() OR public.has_elevated_role(auth.uid()));

CREATE POLICY "Elevated roles can insert points"
ON public.points_log FOR INSERT
WITH CHECK (public.has_elevated_role(auth.uid()));

CREATE POLICY "Elevated roles can update points"
ON public.points_log FOR UPDATE
USING (public.has_elevated_role(auth.uid()));

CREATE POLICY "Elevated roles can delete points"
ON public.points_log FOR DELETE
USING (public.has_elevated_role(auth.uid()));

-- RLS Policies for posts
CREATE POLICY "Public posts viewable by anyone"
ON public.posts FOR SELECT
USING (visibility = 'public');

CREATE POLICY "Internal posts viewable by authenticated users"
ON public.posts FOR SELECT
USING (
  visibility = 'internal_all' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Committee posts viewable by committee members"
ON public.posts FOR SELECT
USING (
  visibility = 'committee_only'
  AND (
    public.get_user_committee(auth.uid()) = committee_tag
    OR public.has_elevated_role(auth.uid())
  )
);

CREATE POLICY "Elevated roles can create posts"
ON public.posts FOR INSERT
WITH CHECK (public.has_elevated_role(auth.uid()));

CREATE POLICY "Authors and elevated roles can update posts"
ON public.posts FOR UPDATE
USING (author_id = auth.uid() OR public.has_elevated_role(auth.uid()));

CREATE POLICY "Elevated roles can delete posts"
ON public.posts FOR DELETE
USING (public.has_elevated_role(auth.uid()));

-- RLS Policies for events
CREATE POLICY "Events viewable by authenticated users"
ON public.events FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Elevated roles can manage events"
ON public.events FOR ALL
USING (public.has_elevated_role(auth.uid()));

-- Trigger to update total_points when points_log changes
CREATE OR REPLACE FUNCTION public.update_member_total_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles
    SET total_points = (
      SELECT COALESCE(SUM(complexity_score), 0)
      FROM public.points_log
      WHERE member_id = NEW.member_id
    )
    WHERE id = NEW.member_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
    SET total_points = (
      SELECT COALESCE(SUM(complexity_score), 0)
      FROM public.points_log
      WHERE member_id = OLD.member_id
    )
    WHERE id = OLD.member_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.profiles
    SET total_points = (
      SELECT COALESCE(SUM(complexity_score), 0)
      FROM public.points_log
      WHERE member_id = NEW.member_id
    )
    WHERE id = NEW.member_id;
    
    IF OLD.member_id != NEW.member_id THEN
      UPDATE public.profiles
      SET total_points = (
        SELECT COALESCE(SUM(complexity_score), 0)
        FROM public.points_log
        WHERE member_id = OLD.member_id
      )
      WHERE id = OLD.member_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_points_log_change
AFTER INSERT OR UPDATE OR DELETE ON public.points_log
FOR EACH ROW
EXECUTE FUNCTION public.update_member_total_points();

-- Trigger to create profile and default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();
