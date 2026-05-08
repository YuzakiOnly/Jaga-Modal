import { Link } from "@inertiajs/react";
import { ArrowRight, ChevronRight, CheckCircle2, Package } from "lucide-react";

const TRUST_BADGES = ["Gratis 30 hari", "Tanpa kartu kredit", "Setup 5 menit"];

const PRODUCTS = [
    { name: "Nasi Ayam Spesial", pct: 85, sales: "Rp 420rb" },
    { name: "Es Teh Manis", pct: 60, sales: "Rp 186rb" },
    { name: "Mie Goreng", pct: 44, sales: "Rp 144rb" },
];

const BAR_HEIGHTS = [40, 65, 45, 80, 55, 90, 100];
const DAY_LABELS = ["S", "M", "S", "R", "K", "J", "S"];

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-warm-50 py-20 lg:py-28">
            {/* Ambient blobs */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-32 -right-32 size-[600px] rounded-full bg-brand-500/8" />
                <div className="absolute -bottom-20 -left-20 size-[400px] rounded-full bg-blue-400/6" />
            </div>

            <div className="relative mx-auto max-w-6xl px-6">
                <div className="grid items-center gap-16 lg:grid-cols-2">
                    {/* ── Left copy ─────────────────────────────────────── */}
                    <div>
                        {/* Badge */}
                        <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700">
                            <span className="size-2 animate-pulse rounded-full bg-brand-500" />
                            Khusus untuk UMKM Indonesia
                        </div>

                        {/* Heading */}
                        <h1 className="animate-fade-up delay-100 font-serif text-[clamp(2.4rem,4.5vw,3.6rem)] font-bold leading-[1.12] tracking-tight text-warm-950 mb-5">
                            Jaga modal,{" "}
                            <em className="italic text-brand-600">tumbuhkan</em>{" "}
                            bisnis Anda
                        </h1>

                        {/* Sub */}
                        <p className="animate-fade-up delay-200 text-lg leading-relaxed text-warm-500 mb-9 max-w-[460px]">
                            Platform manajemen bisnis lengkap untuk UMKM. Kasir,
                            stok, keuangan, dan laporan — semua dalam satu
                            aplikasi yang mudah digunakan.
                        </p>

                        {/* CTA buttons */}
                        <div className="animate-fade-up delay-300 flex flex-wrap gap-3 mb-8">
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-7 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/35 no-underline"
                            >
                                Mulai Gratis <ArrowRight size={17} />
                            </Link>
                            <a
                                href="#fitur"
                                className="inline-flex items-center gap-2 rounded-xl border-1.5 border-warm-200 px-7 py-3.5 text-sm font-semibold text-warm-700 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 no-underline"
                            >
                                Lihat Fitur <ChevronRight size={16} />
                            </a>
                        </div>

                        {/* Trust badges */}
                        <div className="animate-fade-up delay-400 flex flex-wrap gap-5">
                            {TRUST_BADGES.map((t) => (
                                <span
                                    key={t}
                                    className="flex items-center gap-1.5 text-sm text-warm-500"
                                >
                                    <CheckCircle2
                                        size={14}
                                        className="text-brand-500 shrink-0"
                                    />
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* ── Right — Dashboard mockup ───────────────────────── */}
                    <div className="animate-fade-in delay-200 relative">
                        {/* Main card */}
                        <div className="rounded-3xl border border-warm-100 bg-white p-6 shadow-2xl shadow-warm-900/10">
                            {/* KPI header */}
                            <div className="mb-5 flex items-start justify-between">
                                <div>
                                    <p className="mb-1 text-xs text-warm-400">
                                        Pendapatan Hari Ini
                                    </p>
                                    <p className="font-serif text-[1.75rem] font-bold tracking-tight text-warm-950">
                                        Rp 1.248.500
                                    </p>
                                </div>
                                <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
                                    ▲ 14%
                                </span>
                            </div>

                            {/* Bar chart */}
                            <div className="flex items-end gap-1.5 h-16 mb-3">
                                {BAR_HEIGHTS.map((h, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 rounded-md transition-all"
                                        style={{
                                            height: `${h}%`,
                                            background:
                                                i === 6
                                                    ? "linear-gradient(180deg,#059669,#0d9488)"
                                                    : "#f0fdf4",
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between mb-5">
                                {DAY_LABELS.map((d, i) => (
                                    <span
                                        key={i}
                                        className="flex-1 text-center text-[0.65rem] text-warm-300"
                                    >
                                        {d}
                                    </span>
                                ))}
                            </div>

                            <hr className="border-warm-100 mb-5" />

                            {/* Top products */}
                            <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-wider text-warm-500">
                                Produk Terlaris
                            </p>
                            <div className="space-y-3">
                                {PRODUCTS.map((p) => (
                                    <div key={p.name}>
                                        <div className="mb-1 flex justify-between text-xs">
                                            <span className="font-semibold text-warm-800">
                                                {p.name}
                                            </span>
                                            <span className="text-warm-400">
                                                {p.sales}
                                            </span>
                                        </div>
                                        <div className="h-1.5 overflow-hidden rounded-full bg-warm-100">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-teal-400"
                                                style={{ width: `${p.pct}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Floating: stock warning */}
                        <div className="animate-float absolute -bottom-4 -left-5 flex items-center gap-3 rounded-2xl border border-warm-100 bg-white px-4 py-3 shadow-xl shadow-warm-900/10">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-100 shrink-0">
                                <Package size={16} className="text-amber-600" />
                            </div>
                            <div>
                                <p className="text-[0.65rem] text-warm-400 mb-0.5">
                                    Stok Hampir Habis
                                </p>
                                <p className="text-[0.8rem] font-bold text-warm-900">
                                    Minyak Goreng — 3 sisa
                                </p>
                            </div>
                        </div>

                        {/* Floating: profit */}
                        <div className="animate-float-delayed absolute -top-3 -right-3 rounded-2xl bg-gradient-to-br from-brand-600 to-teal-500 px-4 py-3 shadow-xl shadow-brand-600/30">
                            <p className="text-[0.65rem] text-white/75 mb-0.5">
                                Laba hari ini
                            </p>
                            <p className="text-lg font-extrabold text-white">
                                Rp 380rb ↑
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
