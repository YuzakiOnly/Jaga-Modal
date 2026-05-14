import {
    LayoutDashboard,
    Users,
    Settings,
    ShieldCheck,
    Package,
    ShoppingCart,
    BarChart2,
    FileText,
    Store,
    Wallet,
} from "lucide-react";

// all role
export const baseNavItems = [
    {
        title: "Overview",
        items: [
            { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { title: "My Store", href: "/store", icon: Store },
            { title: "Revenue", href: "/revenue", icon: Wallet },
        ],
    },
    {
        title: "Store",
        items: [
            { title: "Categories", href: "/categories", icon: Package },
            { title: "Products", href: "/products", icon: Package },
            {
                title: "Orders",
                href: "/orders",
                icon: ShoppingCart,
                items: [
                    { title: "All Orders", href: "/orders" },
                    { title: "Pending", href: "/orders/pending", isDataBadge: "5" },
                    { title: "Completed", href: "/orders/completed" },
                ],
            },
        ],
    },
    {
        title: "Account",
        items: [
            { title: "Settings", href: "/settings", icon: Settings },
        ],
    },
];

// super_admin
export const superAdminExtraItems = [
    {
        title: "Administration",
        items: [
            { title: "Admin Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
            { title: "Analytics", href: "/admin/analytics", icon: BarChart2 },
            { title: "Reports", href: "/admin/reports", icon: FileText },
            {
                title: "Users",
                href: "/admin/users",
                icon: Users,
            },
            { title: "Security", href: "/admin/security", icon: ShieldCheck },
        ],
    },
];

// Projects
export const sharedProjects = [
    {
        id: 1,
        name: "Main Store",
        icon: Store,
        status: "Active",
        statusColor: "text-green-500",
    },
    {
        id: 2,
        name: "Warehouse",
        icon: Package,
        status: "Maintenance",
        statusColor: "text-yellow-500",
    },
];

// Combined navItems for use in search and other components
export const navItems = [...baseNavItems, ...superAdminExtraItems];