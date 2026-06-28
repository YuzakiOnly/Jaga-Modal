import { Button } from "@/Components/ui/button";
import { Receipt, PackageSearch, Wallet, BarChart3, Store } from "lucide-react";

export function AuthHeader({ title, description, showDescription = true }) {
    return (
        <div className="space-y-1.5">
            <h1 className="text-[1.7rem] font-semibold leading-tight text-[#1a1110] font-inter">
                {title}
            </h1>
            {showDescription && (
                <p className="text-sm text-[#8a6a62] font-inter">
                    {description}
                </p>
            )}
        </div>
    );
}

const PANEL_CONTENT = {
    login: {
        eyebrow: "Buku Kas Digital",
        heading: "Tutup buku hari ini dalam hitungan detik.",
        body: "Catat transaksi, pantau stok, dan lihat untung-rugi tanpa buka kalkulator atau buku tulis lagi.",
    },
    register: {
        eyebrow: "Mulai Gratis",
        heading: "Dari warung kecil jadi usaha yang tercatat rapi.",
        body: "Ribuan UMKM sudah pindah dari catatan manual ke JagaModal. Daftar pakai kode undangan dari tim kami.",
    },
    setup: {
        eyebrow: "Langkah Terakhir",
        heading: "Tinggal satu langkah lagi, toko Anda siap.",
        body: "Lengkapi data toko supaya kasir, laporan, dan stok langsung tersambung dengan benar.",
    },
};

const FEATURES = [
    { icon: Receipt, label: "Kasir & struk" },
    { icon: PackageSearch, label: "Stok barang" },
    { icon: Wallet, label: "Kas masuk-keluar" },
    { icon: BarChart3, label: "Laporan untung" },
];

export function BrandPanel({ type }) {
    const content = PANEL_CONTENT[type] ?? PANEL_CONTENT.login;

    return (
        <div className="relative hidden h-full min-h-0 bg-[#1a1110] lg:flex lg:flex-col font-inter">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-90"
                    style={{
                        backgroundImage:
                            "repeating-linear-gradient(135deg, #fe5e0010 0px, #fe5e0010 1px, transparent 1px, transparent 26px)",
                    }}
                />
                <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#fe5e00] opacity-20 blur-3xl" />
                <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-[#fdba74] opacity-10 blur-3xl" />
            </div>

            <div className="relative z-10 flex h-full flex-col justify-between gap-10 overflow-y-auto p-12">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fe5e00]">
                        <Store
                            className="h-5 w-5 text-white"
                            strokeWidth={2.25}
                        />
                    </div>
                    <span className="text-lg font-semibold text-white font-inter">
                        JagaModal
                    </span>
                </div>

                <div className="max-w-md">
                    <span className="inline-block rounded-full border border-[#fe5e00]/40 bg-[#fe5e00]/10 px-3 py-1 text-xs font-medium tracking-wide text-[#fdba74] font-inter">
                        {content.eyebrow}
                    </span>
                    <h2 className="mt-5 text-[2rem] font-semibold leading-[1.2] text-white font-inter">
                        {content.heading}
                    </h2>
                    <p className="mt-4 text-[15px] leading-relaxed text-white/55 font-inter">
                        {content.body}
                    </p>

                    <div className="mt-9 grid grid-cols-2 gap-3">
                        {FEATURES.map(({ icon: Icon, label }) => (
                            <div
                                key={label}
                                className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3"
                            >
                                <Icon className="h-4 w-4 shrink-0 text-[#fe5e00]" />
                                <span className="text-sm text-white/70 font-inter">
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-xs text-white/30 font-inter">
                    &copy; 2026 JagaModal. Dibuat untuk pelaku UMKM Indonesia.
                </p>
            </div>
        </div>
    );
}
