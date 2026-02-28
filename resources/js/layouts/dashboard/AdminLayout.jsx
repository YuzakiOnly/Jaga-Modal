import SidebarLayout from "@/layouts/sidebar-v1/SidebarLayout";
import { adminNavItems, sharedProjects } from "@/lib/sidebar-data";
import { usePage } from "@inertiajs/react";

export default function AdminLayout({ children }) {
    const { auth } = usePage().props;

    return (
        <SidebarLayout
            navItems={adminNavItems}
            projects={sharedProjects}
            appName="Admin Panel"
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
