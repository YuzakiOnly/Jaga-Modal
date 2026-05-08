import { Link } from "@inertiajs/react";
import {
    Smartphone,
    Globe,
    Lock,
    Zap,
    Users,
    Heart,
    ArrowRight,
} from "lucide-react";

const WHY_US = [
    {
        icon: Smartphone,
        title: "Mobile-First",
        desc: "Dirancang untuk layar HP. Bisa dipakai sambil berjualan.",
    },
    {
        icon: Globe,
        title: "Berbasis Web",
        desc: "Tidak perlu install apapun. Buka browser, langsung pakai.",
    },
    {
        icon: Lock,
        title: "Data Aman",
        desc: "Data terenkripsi dan di-backup otomatis setiap hari.",
    },
    {
        icon: Zap,
        title: "Super Cepat",
        desc: "Antarmuka ringan dan responsif, bahkan di jaringan lambat.",
    },
    {
        icon: Users,
        title: "Multi Pengguna",
        desc: "Tambah kasir atau karyawan dengan kontrol akses fleksibel.",
    },
    {
        icon: Heart,
        title: "Dukungan Lokal",
        desc: "Tim support berbahasa Indonesia siap membantu kapanpun.",
    },
];

export default function WhyUsSection() {
    return (
        <section id="kenapa-kami" className="bg-warm-50 py-24 px-6">
            <div className="mx-auto max-w-6xl">
                <div className="grid items-center gap-16 lg:grid-cols-2">
                    {/* Left text */}
                    <div>
                        <p className="text-xs font-bold tracking-widest uppercase text-brand-600 mb-3">
                            Kenapa Kami
                        </p>
                        <h2 className="font-serif text-[clamp(1.8rem,3vw,2.4rem)] font-bold leading-tight tracking-tight text-warm-950 mb-5">
                            Dibuat{" "}
                            <em className="italic text-brand-600">bersama</em>{" "}
                            pelaku UMKM, bukan hanya untuk mereka
                        </h2>
                        <p className="text-base leading-relaxed text-warm-500 mb-8">
                            Kami berbicara langsung dengan ratusan pemilik
                            warung, toko, dan usaha kecil sebelum menulis satu
                            baris kode. Hasilnya adalah aplikasi yang
                            benar-benar sesuai kebutuhan lapangan.
                        </p>
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-7 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/30 no-underline"
                        >
                            Coba Sekarang <ArrowRight size={17} />
                        </Link>
                    </div>

                    {/* Right grid */}
                    <div className="grid grid-cols-2 gap-3.5">
                        {WHY_US.map((w) => {
                            const Icon = w.icon;
                            return (
                                <div
                                    key={w.title}
                                    className="rounded-2xl border border-warm-100 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-md hover:shadow-warm-900/6"
                                >
                                    <div className="mb-3 inline-flex size-9 items-center justify-center rounded-xl bg-brand-50">
                                        <Icon
                                            size={17}
                                            className="text-brand-600"
                                        />
                                    </div>
                                    <h4 className="mb-1.5 text-sm font-bold text-warm-900">
                                        {w.title}
                                    </h4>
                                    <p className="text-xs leading-relaxed text-warm-500">
                                        {w.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
