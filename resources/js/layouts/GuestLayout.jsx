import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import { Menu, X, Store, ArrowRight } from "lucide-react";

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
    const [open, setOpen] = useState(false);
    const { auth } = usePage().props;

    const navLinks = [
        { label: "Fitur", href: "#fitur" },
        { label: "Kenapa Kami", href: "#kenapa-kami" },
        { label: "Tim", href: "#tim" },
        { label: "Harga", href: "#harga" },
    ];

    return (
        <header className="sticky top-0 z-50 bg-warm-50/90 backdrop-blur-md border-b border-warm-100">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 no-underline"
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-teal-500 rounded-[10px] flex items-center justify-center shrink-0">
                            <Store size={16} className="text-white" />
                        </div>
                        <span className="font-extrabold text-[1.05rem] text-warm-950 tracking-tight">
                            jaga modal
                        </span>
                        <span className="text-[0.65rem] font-bold text-brand-600 bg-brand-100 border border-brand-200 px-2 py-0.5 rounded-full leading-none">
                            umkm
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((l) => (
                            <a
                                key={l.label}
                                href={l.href}
                                className="text-sm font-medium text-warm-500 hover:text-brand-600 transition-colors no-underline"
                            >
                                {l.label}
                            </a>
                        ))}
                    </nav>

                    {/* Auth Buttons — desktop */}
                    <div className="hidden md:flex items-center gap-3">
                        {auth?.user ? (
                            <Link
                                href={
                                    auth.user.role === "super_admin"
                                        ? "/admin/dashboard"
                                        : "/dashboard"
                                }
                                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-brand-600/30 no-underline"
                            >
                                Ke Dashboard <ArrowRight size={15} />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-sm font-semibold text-warm-600 hover:text-warm-900 px-4 py-2 transition-colors no-underline"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href="/register"
                                    className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-brand-600/30 no-underline"
                                >
                                    Daftar Gratis
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <button
                        className="md:hidden p-2 text-warm-500 hover:text-warm-900 transition-colors"
                        onClick={() => setOpen(!open)}
                        aria-label="Toggle menu"
                    >
                        {open ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {/* Mobile menu */}
                {open && (
                    <div className="md:hidden py-4 border-t border-warm-100 space-y-1">
                        {navLinks.map((l) => (
                            <a
                                key={l.label}
                                href={l.href}
                                onClick={() => setOpen(false)}
                                className="block px-3 py-2.5 text-warm-700 hover:bg-warm-100 rounded-xl font-medium text-sm transition-colors no-underline"
                            >
                                {l.label}
                            </a>
                        ))}
                        <div className="flex flex-col gap-2 pt-3">
                            {auth?.user ? (
                                <Link
                                    href={
                                        auth.user.role === "admin"
                                            ? "/admin/dashboard"
                                            : "/owner/dashboard"
                                    }
                                    className="bg-brand-600 text-white text-center py-2.5 rounded-xl font-bold text-sm no-underline"
                                >
                                    Ke Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-center border border-warm-200 py-2.5 rounded-xl font-semibold text-sm text-warm-700 no-underline"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="bg-brand-600 text-white text-center py-2.5 rounded-xl font-bold text-sm no-underline"
                                    >
                                        Daftar Gratis
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

const FOOTER_PRODUCT = [
    "Fitur Kasir",
    "Manajemen Stok",
    "Laporan Keuangan",
    "Analytics",
    "HPP & Laba",
];

const FOOTER_COMPANY = [
    "Tentang Kami",
    "Blog",
    "Karir",
    "Kontak",
    "Kebijakan Privasi",
];

function Footer() {
    return (
        <footer className="bg-warm-950 text-warm-500">
            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="grid md:grid-cols-4 gap-10 mb-12">
                    {/* Brand */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-teal-500 rounded-[10px] flex items-center justify-center">
                                <Store size={16} className="text-white" />
                            </div>
                            <span className="font-extrabold text-white tracking-tight">
                                jaga modal
                            </span>
                            <span className="text-[0.6rem] font-bold text-brand-300 bg-brand-900/60 px-2 py-0.5 rounded-full leading-none">
                                umkm
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed max-w-sm text-warm-500">
                            Platform manajemen bisnis untuk UMKM Indonesia.
                            Kasir, stok, keuangan, dan laporan dalam satu
                            aplikasi.
                        </p>
                        <p className="text-xs text-warm-700">
                            Dibuat dengan ❤️ untuk UMKM Indonesia
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <p className="text-white font-bold text-sm mb-4 tracking-wide">
                            Produk
                        </p>
                        <ul className="space-y-3 text-sm">
                            {FOOTER_PRODUCT.map((item) => (
                                <li key={item}>
                                    <a
                                        href="#fitur"
                                        className="text-warm-500 hover:text-white transition-colors no-underline"
                                    >
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <p className="text-white font-bold text-sm mb-4 tracking-wide">
                            Perusahaan
                        </p>
                        <ul className="space-y-3 text-sm">
                            {FOOTER_COMPANY.map((item) => (
                                <li key={item}>
                                    <a
                                        href="#"
                                        className="text-warm-500 hover:text-white transition-colors no-underline"
                                    >
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-warm-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-warm-700">
                        © {new Date().getFullYear()} jaga modal. Seluruh hak
                        cipta dilindungi.
                    </p>
                    <div className="flex items-center gap-1.5 text-xs">
                        <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
                        <span className="text-warm-600">
                            Semua sistem berjalan normal
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col font-sans">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
