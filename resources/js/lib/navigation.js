// resources/js/lib/navigation.js
import {
    ShoppingCart,
    History,
    Receipt,
    LayoutDashboard,
} from "lucide-react";

export const NAV_ITEMS = [
    {
        label: "Dashboard",
        href: "cashier.dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Kasir",
        href: "cashier.pos",
        icon: ShoppingCart,
    },
    {
        label: "Riwayat",
        href: "cashier.history",
        icon: History,
    },
    {
        label: "Pengeluaran",
        href: "cashier.expenses",
        icon: Receipt,
    },
    {
        label: "Owner",
        href: "owner.dashboard",
        icon: LayoutDashboard,
    },
];