import { ShieldCheck, Crown, Receipt } from "lucide-react";

// ─── Role badge config ────────────────────────────────────────────────────────
export const roleConfig = {
    super_admin: {
        label: "Super Admin",
        icon: ShieldCheck,
        variant: "outline",
        className:
            "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
    },
    owner: {
        label: "Owner",
        icon: Crown,
        variant: "outline",
        className:
            "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    },
    cashier: {
        label: "Cashier",
        icon: Receipt,
        variant: "outline",
        className:
            "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
    },
};

// ─── Role filter options ──────────────────────────────────────────────────────
export const roleOptions = [
    { value: "all", label: "All roles", color: "gray" },
    { value: "super_admin", label: "Super Admin", color: "violet" },
    { value: "owner", label: "Owner", color: "amber" },
    { value: "cashier", label: "Cashier", color: "sky" },
];

// ─── Role dot color map (inline style fallback for Tailwind purge) ────────────
export const roleColorMap = {
    violet: "rgb(139, 92, 246)",
    amber: "rgb(245, 158, 11)",
    sky: "rgb(14, 165, 233)",
    gray: "rgb(107, 114, 128)",
};