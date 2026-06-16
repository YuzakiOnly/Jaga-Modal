import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar-v1/AppSidebar";
import { AppHeader } from "@/layouts/dashboard/AppHeader";
import { getNavItemsByRole } from "@/lib/sidebar-data";
import { usePage } from "@inertiajs/react";

export default function SidebarLayout({
    children,
    appName,
    navItems,
    projects,
    user,
}) {
    const { props } = usePage();
    const userRole = props.auth?.user?.role || "owner";

    const finalNavItems = navItems || getNavItemsByRole(userRole);

    return (
        <SidebarProvider
            className="h-screen overflow-hidden"
            style={{
                "--sidebar-width": "16rem",
                "--sidebar-width-icon": "3rem",
                "--sidebar-transition-duration": "0s", // DISABLE TRANSISI
            }}
        >
            <AppSidebar
                appName={appName}
                navItems={finalNavItems}
                projects={projects}
                user={user}
            />
            <SidebarInset className="bg-sidebar flex flex-col h-screen min-w-0 overflow-hidden">
                <div className="flex flex-col flex-1 min-h-0 md:mt-2.5 md:mr-2.5 md:rounded-tl-xl md:rounded-tr-xl bg-background overflow-hidden">
                    <AppHeader />
                    <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                        {children}
                    </main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
