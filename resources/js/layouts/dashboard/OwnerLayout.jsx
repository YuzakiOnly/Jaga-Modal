import SidebarLayout from "@/layouts/sidebar-v1/SidebarLayout";
import { ownerNavItems, sharedProjects } from "@/lib/sidebar-data";
import { usePage } from "@inertiajs/react";

export default function OwnerLayout({ children }) {
    const { auth } = usePage().props;

    return (
        <SidebarLayout
            navItems={ownerNavItems}
            projects={sharedProjects}
            appName="My Store"
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
