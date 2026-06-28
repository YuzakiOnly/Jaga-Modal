import { Link, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { Store, User, Menu, X, Settings, HelpCircle } from "lucide-react";
import { NAV_ITEMS } from "@/lib/navigation";

export default function CashierLayout({ children, title }) {
    const { auth } = usePage().props;
    const storeName = auth?.user?.store?.name ?? "Toko Saya";
    const userName = auth?.user?.name ?? "Kasir";
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [menuOpen]);

    function isActive(routeName) {
        try {
            return route().current(routeName);
        } catch {
            return false;
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <aside className="hidden lg:flex w-16 shrink-0 bg-neutral-800 flex-col items-center py-4 gap-2">
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center mb-3 shadow-lg shadow-orange-900/40">
                    <Store className="h-5 w-5 text-white" />
                </div>

                <div className="w-8 h-px bg-orange-800 mb-2" />

                <nav className="flex flex-col gap-1.5 flex-1">
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={route(item.href)}
                                title={item.label}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                    active
                                        ? "bg-orange-500 text-white shadow-md shadow-orange-900/40"
                                        : "text-white hover:bg-orange-900 hover:text-white"
                                }`}
                            >
                                <Icon className="h-5 w-5" />
                            </Link>
                        );
                    })}
                </nav>

                <button
                    title="Bantuan"
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white hover:bg-orange-900 hover:text-white transition-colors cursor-pointer"
                >
                    <HelpCircle className="h-5 w-5" />
                </button>
                <button
                    title="Pengaturan"
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white hover:bg-orange-900 hover:text-white transition-colors cursor-pointer"
                >
                    <Settings className="h-5 w-5" />
                </button>
                <div className="w-9 h-9 rounded-full bg-orange-900 flex items-center justify-center mt-1">
                    <User className="h-4 w-4 text-orange-200" />
                </div>
            </aside>

            <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200">
                <div className="flex items-center justify-between h-14 px-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMenuOpen(true)}
                            className="p-1.5 -ml-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                            <Menu className="h-5 w-5 text-slate-600" />
                        </button>
                        <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center">
                            <Store className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <div className="text-[10px] font-semibold text-orange-600 uppercase tracking-wide">
                                JagaModal
                            </div>
                            <div className="text-sm font-medium text-slate-700">
                                {storeName}
                            </div>
                        </div>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-slate-600" />
                    </div>
                </div>
            </header>

            <div
                className={`fixed inset-0 bg-slate-900/50 z-50 transition-all duration-300 ${
                    menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
                onClick={() => setMenuOpen(false)}
            />

            <div
                className={`fixed left-0 top-0 bottom-0 w-72 bg-white shadow-xl z-50 flex flex-col transition-transform duration-300 ease-out ${
                    menuOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center">
                            <Store className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <div className="text-[10px] font-semibold text-orange-600 uppercase">
                                JagaModal
                            </div>
                            <div className="text-sm font-medium text-slate-700">
                                {storeName}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setMenuOpen(false)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <X className="h-5 w-5 text-slate-500" />
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
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                                    active
                                        ? "bg-orange-50 text-orange-700 border-r-2 border-orange-600"
                                        : "text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-700">
                                {userName}
                            </div>
                            <div className="text-xs text-slate-400">Kasir</div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 flex flex-col overflow-hidden h-screen pt-14 lg:pt-0">
                {children}
            </main>
        </div>
    );
}
