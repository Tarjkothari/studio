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
import { BarChart2, LogOut, Scale, Settings, User } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
                <SidebarMenuButton href="/dashboard/ranker" tooltip="Candidate Ranker">
                  <BarChart2 />
                  <span>Candidate Ranker</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/dashboard/bias-checker" tooltip="Bias Checker">
                  <Scale />
                  <span>Bias Checker</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/dashboard/account" tooltip="Account">
                  <Settings />
                  <span>Account</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center gap-3 p-2">
              <Avatar>
                <AvatarImage src="https://placehold.co/40x40" alt="User Avatar" />
                <AvatarFallback>JP</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-sm">
                <span className="font-semibold text-sidebar-foreground">
                  Hiring Manager
                </span>
                <span className="text-xs text-muted-foreground">
                  manager@company.com
                </span>
              </div>
            </div>
             <SidebarMenu>
                 <SidebarMenuItem>
                    <SidebarMenuButton href="/login" tooltip="Logout">
                        <LogOut/>
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
              <h1 className="text-lg font-semibold">Job Provider Dashboard</h1>
            </div>
          </header>
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
