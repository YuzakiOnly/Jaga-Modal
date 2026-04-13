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

// Super Admin nav
export const adminNavItems = [
    {
        title: "Overview",
        items: [
            { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
            { title: "Analytics", href: "/admin/analytics", icon: BarChart2 },
            { title: "Reports", href: "/admin/reports", icon: FileText },
        ],
    },
    {
        title: "Management",
        items: [
            {
                title: "Users",
                icon: Users,
                items: [
                    { title: "All Users", href: "/admin/users" },
                    { title: "Roles & Permissions", href: "/admin/users/roles", isNew: true },
                ],
            },
            {
                title: "Products",
                href: "/admin/products",
                icon: Package,
            },
            {
                title: "Orders",
                href: "/admin/orders",
                icon: ShoppingCart,
                isDataBadge: "12",
            },
        ],
    },
    {
        title: "System",
        items: [
            { title: "Security", href: "/admin/security", icon: ShieldCheck },
            { title: "Settings", href: "/admin/settings", icon: Settings },
        ],
    },
];

// Owner nav 
export const ownerNavItems = [
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
            {
                title: "Products",
                href: "/products",
                icon: Package,
                isDataBadge: "5",
            },
            {
                title: "Orders",
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

// Admin as Owner nav
export const adminAsOwnerNavItems = [
    {
        title: "Overview",
        items: [
            { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { title: "My Store", href: "/store", icon: Store },
        ],
    },
    {
        title: "Store",
        items: [
            {
                title: "Products",
                href: "/products",
                icon: Package,
                isDataBadge: "5",
            },
            {
                title: "Orders",
                icon: ShoppingCart,
                items: [
                    { title: "All Orders", href: "/orders" },
                    { title: "Pending", href: "/orders/pending", isDataBadge: "5" },
                    { title: "Completed", href: "/orders/completed" },
                ],
            },
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