
"use client";

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
import { BarChart2, LogOut, Scale, Settings, Send, Loader2, Briefcase } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

type User = {
  email: string;
  name: string;
  fallback: string;
  avatar: string;
};


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

   const updateUser = () => {
    try {
        const userString = localStorage.getItem('loggedInUser');
        if (userString) {
            const user = JSON.parse(userString);
            if (user.role === 'Job Provider') {
              setLoggedInUser(user);
            } else {
              router.push('/login');
            }
        } else {
          router.push('/login');
        }
    } catch(e) {
      console.error("Could not retrieve logged in user from localStorage", e);
      router.push('/login');
    }
  };

  useEffect(() => {
    updateUser();
    
    const handleStorageChange = () => updateUser();
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]);

  if (!loggedInUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
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
                  <SidebarMenuButton
                    tooltip="Candidate Ranker"
                    isActive={pathname.startsWith('/dashboard/ranker')}
                    asChild
                  >
                    <Link href="/dashboard/ranker">
                      <BarChart2 />
                      <span>Candidate Ranker</span>
                    </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="My Jobs"
                  isActive={pathname.startsWith('/dashboard/my-jobs')}
                  asChild
                >
                  <Link href="/dashboard/my-jobs">
                    <Briefcase />
                    <span>My Jobs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Post a Job"
                  isActive={pathname.startsWith('/dashboard/post-job')}
                  asChild
                >
                  <Link href="/dashboard/post-job">
                    <Send />
                    <span>Post a Job</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Bias Checker"
                    isActive={pathname.startsWith('/dashboard/bias-checker')}
                    asChild
                  >
                     <Link href="/dashboard/bias-checker">
                        <Scale />
                        <span>Bias Checker</span>
                     </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Account"
                    isActive={pathname.startsWith('/dashboard/account')}
                    asChild
                  >
                    <Link href="/dashboard/account">
                      <Settings />
                      <span>Account</span>
                    </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center gap-3 p-2">
              <Avatar>
                <AvatarImage
                  src={loggedInUser.avatar}
                  alt="User Avatar"
                  data-ai-hint="avatar"
                />
                <AvatarFallback>{loggedInUser.fallback}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-sm">
                <span className="font-semibold text-sidebar-foreground">
                  {loggedInUser.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {loggedInUser.email}
                </span>
              </div>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                 <SidebarMenuButton tooltip="Logout" asChild>
                    <Link href="/login">
                        <LogOut />
                        <span>Logout</span>
                    </Link>
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
              <h1 className="text-lg font-semibold">Job Provider Dashboard</h1>
            </div>
          </header>
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
