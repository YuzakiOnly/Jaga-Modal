import { Store } from "lucide-react";

const FOOTER_LINKS = ["Privasi", "Syarat", "Kontak"];

export default function Footer() {
    return (
        <footer className="bg-warm-950 border-t border-warm-900 py-10 px-6">
            <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-5">
                {/* Brand */}
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-brand-600 to-teal-500 flex items-center justify-center">
                        <Store size={13} className="text-white" />
                    </div>
                    <span className="font-extrabold text-white text-sm tracking-tight">
                        jaga modal
                    </span>
                    <span className="text-[0.6rem] font-bold text-brand-300 bg-brand-900/60 px-2 py-0.5 rounded-full leading-none">
                        umkm
                    </span>
                </div>

                {/* Copyright */}
                <p className="text-xs text-warm-600">
                    © {new Date().getFullYear()} jaga modal. Dibuat dengan ❤️
                    untuk UMKM Indonesia.
                </p>

                {/* Links */}
                <div className="flex items-center gap-6">
                    {FOOTER_LINKS.map((l) => (
                        <a
                            key={l}
                            href="#"
                            className="text-xs text-warm-600 hover:text-warm-300 transition-colors no-underline"
                        >
                            {l}
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
}
