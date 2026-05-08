import { Sparkles, Coffee, BookOpen } from "lucide-react";

const PERKS = [
    {
        icon: Sparkles,
        title: "Akses Lebih Awal",
        desc: "Jadilah yang pertama mencoba semua fitur baru sebelum dirilis ke publik.",
    },
    {
        icon: Coffee,
        title: "Harga Spesial Pendiri",
        desc: "Pengguna early access mendapatkan harga terbaik yang tidak akan naik selamanya.",
    },
    {
        icon: BookOpen,
        title: "Feedback Langsung",
        desc: "Anda berpengaruh langsung terhadap fitur yang kami bangun selanjutnya.",
    },
];

export default function EarlyAccessSection() {
    return (
        <section className="bg-white py-24 px-6">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-14 text-center">
                    <p className="text-xs font-bold tracking-widest uppercase text-brand-600 mb-3">
                        Early Access
                    </p>
                    <h2 className="font-serif text-[clamp(1.8rem,3vw,2.4rem)] font-bold leading-tight tracking-tight text-warm-950">
                        Bergabung lebih awal,
                        <br />
                        dapatkan lebih banyak
                    </h2>
                </div>

                {/* Cards */}
                <div className="grid gap-5 sm:grid-cols-3">
                    {PERKS.map((p) => {
                        const Icon = p.icon;
                        return (
                            <div
                                key={p.title}
                                className="rounded-2xl border border-warm-100 bg-warm-50 p-7 transition-all hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-lg hover:shadow-warm-900/8"
                            >
                                <div className="mb-5 inline-flex size-11 items-center justify-center rounded-[12px] bg-warm-950">
                                    <Icon
                                        size={20}
                                        className="text-brand-300"
                                    />
                                </div>
                                <h3 className="mb-2 font-bold text-warm-900">
                                    {p.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-warm-500">
                                    {p.desc}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
