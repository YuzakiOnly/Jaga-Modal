// sidebar-data.js
import {
    LayoutDashboard,
    Users,
    Settings,
    ShieldCheck,
    Package,
    ShoppingCart,
    ShoppingBag,
    BarChart2,
    Store,
    Wallet,
    Receipt,
    History,
    Tags,
    Boxes,
    Banknote,
    ClipboardList,
    CreditCard,
    TrendingUp,
    SlidersHorizontal,
    UserPlus,
} from "lucide-react";

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

export const superAdminItems = [
    {
        title: "Administration",
        permission: ["super_admin"],
        items: [
            {
                title: "Users Management",
                href: "/admin/users",
                icon: Users,
                permission: ["super_admin"],
                description: "Manage system users"
            },
            {
                title: "User Analytics",
                href: "/admin/analytics",
                icon: BarChart2,
                permission: ["super_admin"],
                description: "View user analytics"
            },
            {
                title: "System Reports",
                href: "/admin/reports",
                icon: ClipboardList,
                permission: ["super_admin"],
                description: "System wide reports"
            },
            {
                title: "Invite Codes",
                href: "/admin/invite-codes",
                icon: ShieldCheck,
                permission: ["super_admin"],
                description: "Manage invite codes"
            },
            {
                title: "Stores Management",
                href: "/admin/stores",
                icon: Store,
                permission: ["super_admin"],
                description: "Manage all stores"
            },
            {
                title: "Security Settings",
                href: "/admin/security",
                icon: ShieldCheck,
                permission: ["super_admin"],
                description: "System security"
            },
        ],
    },
];

export const ownerItems = [
    {
        title: "Overview",
        permission: ["owner", "super_admin"],
        items: [
            {
                title: "Dashboard",
                routeName: "owner.dashboard",
                icon: LayoutDashboard,
                permission: ["owner", "super_admin"],
                description: "Business overview"
            },
            {
                title: "POS Cashier",
                routeName: "cashier.pos",
                icon: ShoppingBag,
                permission: ["owner", "super_admin"],
                description: "Point of Sale cashier system"
            },
        ],
    },
    {
        title: "Store Management",
        permission: ["owner", "super_admin"],
        items: [
            {
                title: "Categories",
                routeName: "owner.categories",
                icon: Tags,
                permission: ["owner", "super_admin"],
                description: "Manage product categories"
            },
            {
                title: "Products",
                routeName: "owner.products",
                icon: Boxes,
                permission: ["owner", "super_admin"],
                description: "Manage your products"
            },
            {
                title: "Variant Groups",
                routeName: "owner.variant-groups",
                icon: SlidersHorizontal,
                permission: ["owner", "super_admin"],
                description: "Manage product variant options"
            },
            {
                title: "Employees",
                routeName: "owner.employees",
                icon: UserPlus,
                permission: ["owner", "super_admin"],
                description: "Manage cashier and staff accounts"
            },
            {
                title: "Capital Prices (HPP)",
                routeName: "owner.capital-prices",
                icon: Banknote,
                permission: ["owner", "super_admin"],
                description: "Manage capital prices"
            },
            {
                title: "Point of Sale",
                routeName: "owner.pos",
                icon: ShoppingCart,
                permission: ["owner", "super_admin"],
                description: "Process sales",
                items: [
                    {
                        title: "Cashier",
                        routeName: "owner.pos",
                        icon: Receipt,
                        permission: ["owner", "super_admin"],
                        description: "Make a sale"
                    },
                    {
                        title: "Transaction History",
                        routeName: "owner.transactions.history",
                        icon: History,
                        permission: ["owner", "super_admin"],
                        description: "View transaction history"
                    },
                ],
            },
            {
                title: "Expenses",
                routeName: "owner.expenses",
                icon: Wallet,
                permission: ["owner", "super_admin"],
                description: "Manage expenses"
            },
        ],
    },
    {
        title: "Finance",
        permission: ["owner", "super_admin"],
        items: [
            {
                title: "Wallet",
                routeName: "owner.wallet",
                icon: CreditCard,
                permission: ["owner", "super_admin"],
                description: "Manage your wallet"
            },
            {
                title: "Financial Reports",
                href: "/owner/reports",
                icon: TrendingUp,
                permission: ["owner", "super_admin"],
                description: "View financial reports"
            },
        ],
    },
    {
        title: "Account",
        permission: ["owner", "super_admin"],
        items: [
            {
                title: "Settings",
                href: "/settings",
                icon: Settings,
                permission: ["owner", "super_admin"],
                description: "Account settings"
            },
            {
                title: "Profile",
                href: "/profile",
                icon: Users,
                permission: ["owner", "super_admin"],
                description: "Manage your profile"
            },
        ],
    },
];

export const baseNavItems = ownerItems;

export function getNavItemsByRole(role) {
    let items = [];

    if (role === "super_admin") {
        items.push(...superAdminItems);
        items.push(...ownerItems);
    } else if (role === "owner") {
        items.push(...ownerItems);
    } else if (role === "cashier") {
        items = [];
    }

    return items;
}

export const navItems = [
    ...ownerItems,
    ...superAdminItems,
];