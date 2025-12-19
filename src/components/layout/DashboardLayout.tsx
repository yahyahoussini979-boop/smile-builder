import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  Users,
  Trophy,
  Calendar,
  User,
  LogOut,
  Settings,
  FileText,
  Award,
  ChevronDown,
} from 'lucide-react';
import logo from '@/assets/logo.png';

function DashboardContent() {
  const { t } = useLanguage();
  const location = useLocation();
  const { user, profile, role, hasElevatedRole, signOut } = useAuth();
  const { setOpenMobile, isMobile } = useSidebar();

  const menuItems = [
    { to: '/dashboard', icon: Home, label: t('dashboard.feed'), end: true },
    { to: '/dashboard/leaderboard', icon: Trophy, label: t('dashboard.leaderboard') },
    { to: '/dashboard/members', icon: Users, label: t('dashboard.members') },
    { to: '/dashboard/meetings', icon: Calendar, label: t('dashboard.meetings') },
    { to: '/dashboard/profile', icon: User, label: t('dashboard.profile') },
  ];

  const adminItems = [
    { to: '/dashboard/admin/points', icon: Award, label: t('dashboard.points') },
    { to: '/dashboard/admin/blog', icon: FileText, label: 'Blog' },
  ];

  const isActive = (path: string, end?: boolean) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  const getRoleLabel = () => {
    if (!role) return 'Membre';
    const labels: Record<string, string> = {
      bureau: 'Bureau',
      admin: 'Admin',
      respo: 'Responsable',
      member: 'Membre',
      embesa: 'Embesa',
    };
    return labels[role] || 'Membre';
  };

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar className="border-e border-sidebar-border">
        <SidebarHeader className="p-4">
          <Link to="/dashboard" className="flex items-center gap-2" onClick={handleNavClick}>
            <img src={logo} alt="Logo" className="h-8 w-auto" />
            <span className="font-semibold text-sidebar-foreground">Al Basma</span>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.to, item.end)}
                    >
                      <Link to={item.to} onClick={handleNavClick}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Admin section - only visible to elevated roles */}
          {hasElevatedRole && (
            <SidebarGroup>
              <SidebarGroupLabel>Administration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.to)}
                      >
                        <Link to={item.to} onClick={handleNavClick}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 h-auto p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-start text-sm">
                  <p className="font-medium">{profile?.full_name || user?.email}</p>
                  <p className="text-xs text-muted-foreground">{getRoleLabel()}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/dashboard/profile" className="gap-2" onClick={handleNavClick}>
                  <User className="h-4 w-4" />
                  {t('dashboard.profile')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Settings className="h-4 w-4" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive">
                <LogOut className="h-4 w-4" />
                {t('dashboard.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 sticky top-0 z-10">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Button variant="outline" size="sm" asChild>
              <Link to="/">{t('nav.home')}</Link>
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function DashboardLayout() {
  const { user, isLoading } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  );
}
