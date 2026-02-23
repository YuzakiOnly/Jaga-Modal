import {
    Activity,
    BadgeDollarSign,
    Building2,
    ChartBarDecreasing,
    ChartPie,
    CreditCard,
    Folder,
    FolderDot,
    Gauge,
    GraduationCap,
    ShoppingBag,
    UserCircle2,
    WalletMinimal,
} from "lucide-react";


export const userData = {
    name: "Toby Belhome",
    email: "hello@tobybelhome.com",
    avatar: "/images/avatars/01.png",
    fallback: "TB",
};


export const projects = [
    {
        id: 1,
        name: "E-commerce",
        status: "Active",
        statusColor: "text-green-600",
        icon: ShoppingBag,
    },
    {
        id: 2,
        name: "Blog Platform",
        status: "Inactive",
        statusColor: "text-muted-foreground",
        icon: UserCircle2,
    },
];


export const navItems = [
    {
        title: "Dashboards",
        items: [
            { title: "Default", href: "/dashboard/default", icon: ChartPie },
            {
                title: "E-commerce",
                href: "#",
                icon: ShoppingBag,
                items: [
                    { title: "Dashboard", href: "/dashboard/ecommerce" },
                    { title: "Product List", href: "/dashboard/pages/products" },
                    { title: "Product Detail", href: "/dashboard/pages/products/1" },
                    { title: "Add Product", href: "/dashboard/pages/products/create" },
                    { title: "Order List", href: "/dashboard/pages/orders" },
                    { title: "Order Detail", href: "/dashboard/pages/orders/detail" },
                ],
            },
            { title: "Sales", href: "/dashboard/sales", icon: BadgeDollarSign },
            { title: "CRM", href: "/dashboard/crm", icon: ChartBarDecreasing },
            { title: "Website Analytics", href: "/dashboard/website-analytics", icon: Gauge },
            {
                title: "Project Management",
                href: "/dashboard/project-management",
                icon: FolderDot,
                items: [
                    { title: "Dashboard", href: "/dashboard/project-management" },
                    { title: "Project List", href: "/dashboard/project-list" },
                ],
            },
            { title: "File Manager", href: "/dashboard/file-manager", icon: Folder },
            { title: "Crypto", href: "/dashboard/crypto", icon: WalletMinimal },
            { title: "Academy/School", href: "/dashboard/academy", icon: GraduationCap },
            { title: "Hospital Management", href: "/dashboard/hospital-management", icon: Activity },
            {
                title: "Hotel Dashboard",
                href: "/dashboard/hotel",
                icon: Building2,
                items: [
                    { title: "Dashboard", href: "/dashboard/hotel" },
                    { title: "Bookings", href: "/dashboard/hotel/bookings" },
                ],
            },
            { title: "Finance Dashboard", href: "/dashboard/finance", icon: WalletMinimal },
            {
                title: "Payment Dashboard",
                href: "/dashboard/payment",
                icon: CreditCard,
                items: [
                    { title: "Dashboard", href: "/dashboard/payment" },
                    { title: "Transactions", href: "/dashboard/payment/transactions" },
                ],
            },
        ],
    },
];