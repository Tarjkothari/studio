"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings, Users, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "Admin")) {
      router.replace("/login");
    }
  }, [user, loading, router]);
  
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading || !user || user.role !== "Admin") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="/admin/users" tooltip="User Management">
                  <Users />
                  <span>Users</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/admin/settings" tooltip="System Settings">
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center gap-3 p-2">
              <Avatar>
                <AvatarImage
                  src="https://placehold.co/40x40"
                  alt="Admin Avatar"
                />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-sm">
                <span className="font-semibold text-sidebar-foreground">
                  {user.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                  <LogOut />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1">
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Admin Panel</h1>
            </div>
          </header>
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
