import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar-v1/AppSidebar";
import { AppHeader } from "@/components/navbar/header/AppHeader";

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
            <SidebarInset className="bg-sidebar">
                <div className="flex flex-col h-full md:mt-2.5 md:mr-2.5 md:rounded-tl-xl md:rounded-tr-xl bg-background overflow-hidden">
                    <AppHeader />
                    <main className="flex-1 overflow-auto">{children}</main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
