import { Link } from "@inertiajs/react";
import { Store } from "lucide-react";

const NAV_LINKS = [
    { label: "Fitur", href: "#fitur" },
    { label: "Kenapa Kami", href: "#kenapa-kami" },
    { label: "Tim", href: "#tim" },
    { label: "Harga", href: "#harga" },
];

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 bg-warm-50/90 backdrop-blur-md border-b border-warm-100">
            <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2.5 no-underline"
                >
                    <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-brand-600 to-teal-500 flex items-center justify-center shrink-0">
                        <Store size={16} className="text-white" />
                    </div>
                    <span className="font-extrabold text-[1.05rem] text-warm-950 tracking-tight">
                        jaga modal
                    </span>
                    <span className="text-[0.65rem] font-bold text-brand-600 bg-brand-100 border border-brand-200 px-2 py-0.5 rounded-full leading-none">
                        umkm
                    </span>
                </Link>

                {/* Nav links — hidden on mobile */}
                <nav className="hidden md:flex items-center gap-8">
                    {NAV_LINKS.map((l) => (
                        <a
                            key={l.label}
                            href={l.href}
                            className="text-sm font-medium text-warm-500 hover:text-brand-600 transition-colors no-underline"
                        >
                            {l.label}
                        </a>
                    ))}
                </nav>

                {/* Auth actions */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/login"
                        className="text-sm font-semibold text-warm-600 hover:text-warm-900 transition-colors no-underline"
                    >
                        Masuk
                    </Link>
                    <Link
                        href="/register"
                        className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-brand-600/30"
                    >
                        Mulai Gratis
                    </Link>
                </div>
            </div>
        </header>
    );
}
