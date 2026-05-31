import { Link, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { Store, User, Clock, Menu, X } from "lucide-react";
import { NAV_ITEMS } from "@/lib/navigation";

export default function CashierLayout({ children, title }) {
    const { auth } = usePage().props;
    const storeName = auth?.user?.store?.name ?? "Toko Saya";
    const userName = auth?.user?.name ?? "Kasir";
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const formatted = now.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            });
            setCurrentTime(formatted);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [mobileMenuOpen]);

    function isActive(routeName) {
        try {
            return route().current(routeName);
        } catch {
            return false;
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="flex items-center justify-between h-14 px-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <Menu className="h-5 w-5 text-gray-600" />
                        </button>

                        <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center">
                            <Store className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">
                                JagaModal
                            </div>
                            <div className="text-sm font-medium text-gray-700 hidden sm:block">
                                {storeName}
                            </div>
                        </div>
                    </div>

                    <nav className="hidden lg:flex items-center gap-1">
                        {NAV_ITEMS.map((item) => {
                            const active = isActive(item.href);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={route(item.href)}
                                    className={`
                                        flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                                        ${active
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "text-gray-600 hover:bg-gray-100"
                                        }
                                    `}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Clock className="h-3.5 w-3.5" />
                            <span className="font-mono hidden sm:inline">{currentTime}</span>
                        </div>

                        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                                <User className="h-3.5 w-3.5 text-gray-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 hidden md:inline">
                                {userName.split(" ")[0]}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <div
                className={`
                    fixed inset-0 bg-black/50 z-50 lg:hidden transition-all duration-300
                    ${mobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}
                `}
                onClick={() => setMobileMenuOpen(false)}
            />

            <div
                className={`
                    fixed left-0 top-0 bottom-0 w-72 bg-white shadow-xl z-50 lg:hidden flex flex-col
                    transition-transform duration-300 ease-out
                    ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center">
                            <Store className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <div className="text-[10px] font-semibold text-emerald-600 uppercase">
                                JagaModal
                            </div>
                            <div className="text-sm font-medium text-gray-700">
                                {storeName}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-2">
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={route(item.href)}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`
                                    flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200
                                    ${active
                                        ? "bg-emerald-50 text-emerald-700 border-r-2 border-emerald-600"
                                        : "text-gray-600 hover:bg-gray-50"
                                    }
                                `}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-700">
                                {userName}
                            </div>
                            <div className="text-xs text-gray-400">Kasir</div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 flex flex-col overflow-hidden h-[calc(100vh-56px)] lg:h-[calc(100vh-56px)]">
                {children}
            </main>
        </div>
    );
}