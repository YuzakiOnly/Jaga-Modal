import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar-v1/AppSidebar";
import { AppHeader } from "@/layouts/dashboard/AppHeader";

export default function SidebarLayout({
    children,
    appName,
    navItems,
    projects,
    user,
}) {
    return (
        <SidebarProvider>
            <AppSidebar
                appName={appName}
                navItems={navItems}
                projects={projects}
                user={user}
            />
            <SidebarInset className="bg-sidebar overflow-hidden">
                <div className="flex min-h-screen flex-col md:mt-2.5 md:mr-2.5 md:rounded-tl-xl md:rounded-tr-xl bg-background overflow-hidden">
                    <AppHeader />
                    <main className="flex-1 overflow-hidden">{children}</main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
