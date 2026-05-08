import {
    ShoppingCart,
    Wallet,
    BarChart2,
    TrendingUp,
    ClipboardList,
    Package,
} from "lucide-react";

const FEATURES = [
    {
        icon: ShoppingCart,
        title: "Kasir Digital",
        desc: "Proses transaksi cepat & mudah. Dukung tunai, transfer, dan QRIS.",
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
    },
    {
        icon: Wallet,
        title: "Pencatatan Keuangan",
        desc: "Catat pemasukan & pengeluaran otomatis dari setiap transaksi. Tidak perlu buku lagi.",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
    },
    {
        icon: BarChart2,
        title: "Dashboard Harian & Bulanan",
        desc: "Pantau performa bisnis setiap hari. Grafik mudah dibaca, bukan angka membingungkan.",
        iconBg: "bg-violet-50",
        iconColor: "text-violet-600",
    },
    {
        icon: TrendingUp,
        title: "Laba per Produk",
        desc: "Tahu persis produk mana paling menguntungkan dan mana yang perlu dievaluasi.",
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
    },
    {
        icon: ClipboardList,
        title: "HPP Otomatis",
        desc: "Hitung Harga Pokok Penjualan otomatis. Tentukan harga jual yang tepat.",
        iconBg: "bg-rose-50",
        iconColor: "text-rose-600",
    },
    {
        icon: Package,
        title: "Manajemen Stok",
        desc: "Pantau stok barang real-time. Notifikasi otomatis saat stok hampir habis.",
        iconBg: "bg-cyan-50",
        iconColor: "text-cyan-600",
    },
];

export default function FeaturesSection() {
    return (
        <section id="fitur" className="bg-white py-24 px-6">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-14 text-center">
                    <p className="text-xs font-bold tracking-widest uppercase text-brand-600 mb-3">
                        Fitur Unggulan
                    </p>
                    <h2 className="font-serif text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold leading-tight tracking-tight text-warm-950">
                        Semua yang Anda butuhkan,
                        <br />
                        dalam satu tempat
                    </h2>
                    <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-warm-500">
                        Dirancang khusus untuk UMKM Indonesia — simpel, cepat,
                        dan tidak butuh pelatihan teknis.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {FEATURES.map((f) => {
                        const Icon = f.icon;
                        return (
                            <div
                                key={f.title}
                                className="group rounded-2xl border border-warm-100 bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-xl hover:shadow-warm-900/8"
                            >
                                <div
                                    className={`mb-5 inline-flex size-12 items-center justify-center rounded-[14px] ${f.iconBg}`}
                                >
                                    <Icon size={22} className={f.iconColor} />
                                </div>
                                <h3 className="mb-2 font-bold text-warm-900">
                                    {f.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-warm-500">
                                    {f.desc}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
