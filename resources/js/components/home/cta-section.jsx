import { Link } from "@inertiajs/react";
import { ArrowRight, Shield } from "lucide-react";

export default function CtaSection() {
    return (
        <section className="relative overflow-hidden bg-warm-950 py-24 px-6">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="size-[600px] rounded-full bg-brand-600/10" />
            </div>

            <div className="relative mx-auto max-w-2xl text-center">
                {/* Badge */}
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-warm-400">
                    <Shield size={13} className="text-brand-400" />
                    Aman & Terpercaya
                </div>

                <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] font-bold leading-tight tracking-tight text-white mb-5">
                    Siap jaga modal dan{" "}
                    <em className="italic text-brand-400">tumbuhkan</em> bisnis
                    Anda?
                </h2>

                <p className="mb-10 text-lg leading-relaxed text-warm-500">
                    Bergabung dengan ribuan pelaku UMKM yang sudah lebih mudah
                    mengelola bisnis bersama jaga modal.
                </p>

                <Link
                    href="/register"
                    className="inline-flex items-center gap-2.5 rounded-xl bg-brand-600 px-10 py-4 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-xl hover:shadow-brand-600/40 no-underline"
                >
                    Mulai Gratis Sekarang <ArrowRight size={18} />
                </Link>

                <p className="mt-5 text-xs text-warm-700">
                    Gratis 30 hari · Tidak perlu kartu kredit · Batalkan kapan
                    saja
                </p>
            </div>
        </section>
    );
}
