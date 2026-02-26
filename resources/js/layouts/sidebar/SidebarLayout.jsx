import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/sidebar/AppSidebar";
import { AppHeader } from "@/components/admin/header/AppHeader";

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
                <div className="flex flex-col h-full mt-2.5 mr-2.5 rounded-tl-xl rounded-tr-xl bg-background overflow-hidden">
                    <AppHeader />
                    <main className="flex-1 overflow-auto">{children}</main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
