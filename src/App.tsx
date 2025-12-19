import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Layouts
import { PublicLayout } from "@/components/layout/PublicLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Public Pages
import Home from "@/pages/Home";
import About from "@/pages/About";
import Team from "@/pages/Team";
import Contact from "@/pages/Contact";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";

// Dashboard Pages
import Feed from "@/pages/dashboard/Feed";
import Leaderboard from "@/pages/dashboard/Leaderboard";
import Members from "@/pages/dashboard/Members";
import MemberProfile from "@/pages/dashboard/MemberProfile";
import Meetings from "@/pages/dashboard/Meetings";
import Profile from "@/pages/dashboard/Profile";
import AdminPoints from "@/pages/dashboard/AdminPoints";
import AdminBlog from "@/pages/dashboard/AdminBlog";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/team" element={<Team />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />
              </Route>
              
              {/* Auth Route (standalone) */}
              <Route path="/auth" element={<Auth />} />

              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Feed />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="members" element={<Members />} />
                <Route path="members/:id" element={<MemberProfile />} />
                <Route path="meetings" element={<Meetings />} />
                <Route path="profile" element={<Profile />} />
                <Route path="admin/points" element={<AdminPoints />} />
                <Route path="admin/blog" element={<AdminBlog />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
