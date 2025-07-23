
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
import { FileUp, LogOut, Settings, Briefcase, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
  email: string;
  name: string;
  fallback: string;
  avatar: string;
  role: string;
};

export default function SeekerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkUser = () => {
      try {
        const userString = localStorage.getItem('loggedInUser');
        if (userString) {
          const user = JSON.parse(userString);
          if (user.role === 'Job Seeker') {
            if (isMounted) {
              setLoggedInUser(user);
            }
          } else {
            // Wrong role, redirect
            router.push('/login');
          }
        } else {
          // No user, redirect
          router.push('/login');
        }
      } catch (e) {
        console.error("Could not retrieve user from localStorage", e);
        router.push('/login');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkUser();

    // Listen for storage changes to update user info across tabs
    const handleStorageChange = () => {
        checkUser();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);


  if (isLoading) {
     return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin" />
        </div>
     )
  }

  if (!loggedInUser) {
    // This state should ideally not be reached if logic is correct,
    // but as a fallback, it prevents rendering the layout while redirecting.
    return null;
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
                  tooltip="Job Listings"
                  isActive={pathname.startsWith('/seeker/jobs')}
                  asChild
                >
                  <Link href="/seeker/jobs">
                    <Briefcase />
                    <span>Job Listings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Resume Improver"
                  isActive={pathname.startsWith('/seeker/improve-resume')}
                  asChild
                >
                  <Link href="/seeker/improve-resume">
                    <FileUp />
                    <span>Resume Improver</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Account"
                  isActive={pathname.startsWith('/seeker/account')}
                  asChild
                >
                  <Link href="/seeker/account">
                    <Settings />
                    <span>Account</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            {loggedInUser && <div className="flex items-center gap-3 p-2">
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
            </div>}
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
              <h1 className="text-lg font-semibold">Job Seeker Dashboard</h1>
            </div>
          </header>
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
