import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar-v1/AppSidebar";
import { AppHeader } from "../dashboard/AppHeader";

export default function PosLayout({
    children,
    appName,
    navItems,
    projects,
    user,
}) {
    return (
        <SidebarProvider className="overflow-hidden h-screen">
            <AppSidebar
                appName={appName}
                navItems={navItems}
                projects={projects}
                user={user}
            />
            <SidebarInset className="bg-sidebar overflow-hidden">
                <div className="flex flex-col h-screen md:mt-2.5 md:mr-2.5 md:rounded-tl-xl md:rounded-tr-xl bg-background">
                    <AppHeader />
                    <main className="flex-1 min-h-0 overflow-hidden">
                        {children}
                    </main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
