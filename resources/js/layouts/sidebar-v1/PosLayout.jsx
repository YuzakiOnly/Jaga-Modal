import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar-v1/AppSidebar";
import { AppHeader } from "../dashboard/AppHeader";
import { getNavItemsByRole, sharedProjects } from "@/lib/sidebar-data";
import { usePage } from "@inertiajs/react";

export default function PosLayout({ children }) {
    const { auth } = usePage().props;
    const userRole = auth.user?.role || "owner";

    const navItems = getNavItemsByRole(userRole);

    return (
        <SidebarProvider
            defaultOpen={true}
            style={{
                "--sidebar-width": "16rem",
                "--sidebar-width-icon": "3rem",
                "--header-height": "3.5rem",
                "--content-padding": "1rem",
                "--content-margin": "0.625rem",
            }}
        >
            <AppSidebar
                appName="Dashboard Panel"
                navItems={navItems}
                projects={sharedProjects}
                user={{
                    name: auth.user.name,
                    email: auth.user.email,
                    avatar: auth.user.avatar ?? null,
                    fallback: auth.user.name?.charAt(0).toUpperCase(),
                }}
                variant="inset"
            />
            <SidebarInset className="flex flex-1 flex-col">
                <AppHeader />
                <div className="flex flex-col flex-1">
                    <div className="@container/main p-[var(--content-padding)] flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                        {children}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
