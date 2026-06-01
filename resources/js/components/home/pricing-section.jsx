import { Link } from "@inertiajs/react";
import { CheckCircle2 } from "lucide-react";

const PLANS = [
    {
        name: "Gratis",
        price: "Rp 0",
        period: "selamanya",
        desc: "Untuk memulai dan mencoba semua fitur dasar.",
        features: ["1 toko", "Kasir digital", "Laporan harian", "Stok dasar"],
        cta: "Mulai Gratis",
        href: "/register",
        highlight: false,
    },
    {
        name: "Pro",
        price: "Rp 99rb",
        period: "/ bulan",
        desc: "Untuk UMKM yang ingin tumbuh lebih cepat.",
        features: [
            "3 toko",
            "Semua fitur Gratis",
            "HPP & Laba otomatis",
            "Laporan bulanan",
            "Multi kasir",
            "Ekspor data",
        ],
        cta: "Coba 30 Hari Gratis",
        href: "/register",
        highlight: true,
    },
    {
        name: "Bisnis",
        price: "Rp 249rb",
        period: "/ bulan",
        desc: "Untuk usaha dengan banyak cabang dan tim.",
        features: [
            "Tidak terbatas",
            "Semua fitur Pro",
            "Multi cabang",
            "Akses API",
            "Support prioritas",
        ],
        cta: "Hubungi Kami",
        href: "/register",
        highlight: false,
    },
];

export default function PricingSection() {
    return (
        <section id="harga" className="bg-white py-24 px-6">
            <div className="mx-auto max-w-4xl">
                <div className="mb-14 text-center">
                    <p className="text-xs font-bold tracking-widest uppercase text-brand-600 mb-3">
                        Harga
                    </p>
                    <h2 className="font-serif text-[clamp(1.8rem,3vw,2.4rem)] font-bold leading-tight tracking-tight text-warm-950">
                        Mulai gratis, upgrade kapan saja
                    </h2>
                    <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-warm-500">
                        Tidak ada biaya tersembunyi. Coba semua fitur selama 30
                        hari, lalu pilih paket yang cocok.
                    </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.name}
                            className={`rounded-2xl border p-7 transition-all hover:-translate-y-1.5 ${
                                plan.highlight
                                    ? "border-brand-500 bg-gradient-to-b from-brand-50 to-emerald-50/60 shadow-xl shadow-brand-600/12"
                                    : "border-warm-100 bg-white hover:shadow-lg hover:shadow-warm-900/8"
                            }`}
                        >
                            {plan.highlight && (
                                <span className="mb-4 inline-block rounded-full bg-brand-600 px-3 py-1 text-[0.7rem] font-bold text-white">
                                    Paling Populer
                                </span>
                            )}

                            <p className="mb-1 text-[1.05rem] font-extrabold text-warm-950">
                                {plan.name}
                            </p>

                            <div className="mb-1.5 flex items-baseline gap-1">
                                <span className="font-serif text-[1.8rem] font-bold tracking-tight text-warm-950">
                                    {plan.price}
                                </span>
                                <span className="text-xs text-warm-400">
                                    {plan.period}
                                </span>
                            </div>

                            <p className="mb-5 text-sm leading-relaxed text-warm-500">
                                {plan.desc}
                            </p>

                            <ul className="mb-7 space-y-2.5">
                                {plan.features.map((f) => (
                                    <li
                                        key={f}
                                        className="flex items-center gap-2 text-sm text-warm-700"
                                    >
                                        <CheckCircle2
                                            size={14}
                                            className="shrink-0 text-brand-500"
                                        />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={plan.href}
                                className={`flex w-full items-center justify-center rounded-xl py-3 text-sm font-bold transition-all no-underline ${
                                    plan.highlight
                                        ? "bg-brand-600 text-white hover:bg-brand-700 hover:shadow-md hover:shadow-brand-600/30"
                                        : "border border-warm-200 text-warm-700 hover:border-brand-300 hover:bg-brand-50"
                                }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
