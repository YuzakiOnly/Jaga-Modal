import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar-v1/AppSidebar";
import { AppHeader } from "@/layouts/dashboard/AppHeader";

export default function SidebarLayout({
    children,
    navItems = [],
    projects = [],
    appName = "Dashboard Panel",
    user = null,
}) {
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
                appName={appName}
                navItems={navItems}
                projects={projects}
                user={user}
                variant="inset"
            />
            <SidebarInset>
                <AppHeader />   
                <div className="flex flex-1 flex-col">
                    <div className="@container/main p-[var(--content-padding)]">
                        {children}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
