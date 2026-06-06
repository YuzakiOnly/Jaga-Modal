import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar-v1/AppSidebar";
import { PosHeader } from "./PosHeader";

export default function PosLayout({
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
            <SidebarInset className="bg-sidebar overflow-x-hidden">
                <div className="flex flex-col h-screen md:mt-2.5 md:mr-2.5 md:rounded-tl-xl md:rounded-tr-xl bg-background">
                    <PosHeader />
                    <main className="flex-1 min-h-0 overflow-hidden">
                        {children}
                    </main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
