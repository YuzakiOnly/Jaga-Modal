import {
    LayoutDashboard,
    Users,
    Settings,
    ShieldCheck,
    Package,
    ShoppingCart,
    BarChart2,
    Store,
    Wallet,
    Receipt,
    History,
    Tags,
    Boxes,
    Banknote,
    ClipboardList,
    FolderKanban,
} from "lucide-react";

// all role
export const baseNavItems = [
    {
        title: "Overview",
        items: [
            {
                title: "Dashboard",
                href: "/owner/dashboard",
                icon: LayoutDashboard,
            },
            {
                title: "Cashier Store",
                href: "/cashier",
                icon: ShoppingCart,
            }
        ],
    },

    {
        title: "Store",
        items: [
            {
                title: "Categories",
                href: "/owner/categories",
                icon: Tags,
            },

            {
                title: "Products",
                href: "/owner/products",
                icon: Boxes,
            },

            {
                title: "Capital (HPP)",
                href: "/owner/capital-prices",
                icon: Banknote,
            },

            {
                title: "POS",
                href: "/owner/pos",
                icon: ShoppingCart,
                items: [
                    {
                        title: "Cashier",
                        href: "/owner/pos",
                        icon: Receipt,
                    },
                    {
                        title: "Transaction History",
                        href: "/owner/pos/history",
                        icon: History,
                    },
                ],
            },

            {
                title: "Expenses",
                href: "/owner/expenses",
                icon: Wallet,
            },
        ],
    },

    {
        title: "Pribadi",
        items: [
            {
                title: "Wallet",
                href: "/owner/wallet",
                icon: Wallet,
            },
        ],
    },

    {
        title: "Account",
        items: [
            {
                title: "Settings",
                href: "/settings",
                icon: Settings,
            },
        ],
    },
];

// super_admin
export const superAdminExtraItems = [
    {
        title: "Administration",
        items: [
            {
                title: "Admin Dashboard",
                href: "/admin/dashboard",
                icon: LayoutDashboard,
            },

            {
                title: "Analytics",
                href: "/admin/analytics",
                icon: BarChart2,
            },

            {
                title: "Reports",
                href: "/admin/reports",
                icon: ClipboardList,
            },

            {
                title: "Users",
                href: "/admin/users",
                icon: Users,
            },

            {
                title: "Security",
                href: "/admin/security",
                icon: ShieldCheck,
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

// Combined navItems for use in search and other components
export const navItems = [
    ...baseNavItems,
    ...superAdminExtraItems,
];