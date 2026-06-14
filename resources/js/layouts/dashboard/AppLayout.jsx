import SidebarLayout from "@/layouts/sidebar-v1/SidebarLayout";
import { getNavItemsByRole, sharedProjects } from "@/lib/sidebar-data";
import { usePage } from "@inertiajs/react";

export default function AppLayout({ children }) {
    const { auth } = usePage().props;
    const userRole = auth.user?.role || "owner";

    const navItems = getNavItemsByRole(userRole);

    return (
        <SidebarLayout
            navItems={navItems}
            projects={sharedProjects}
            appName="Dashboard Panel"
            user={{
                name: auth.user.name,
                email: auth.user.email,
                avatar: auth.user.avatar ?? null,
                fallback: auth.user.name?.charAt(0).toUpperCase(),
            }}
        >
            {children}
        </SidebarLayout>
    );
}
