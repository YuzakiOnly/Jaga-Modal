const STATS = [
    { value: "10rb+", label: "UMKM Aktif" },
    { value: "99.9%", label: "Uptime Sistem" },
    { value: "Rp 2M+", label: "Transaksi Diproses" },
    { value: "4.9★", label: "Rating Pengguna" },
];

export default function StatsBar() {
    return (
        <section className="bg-warm-950 py-14 px-6">
            <div className="mx-auto max-w-4xl grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                {STATS.map((s) => (
                    <div key={s.label}>
                        <p className="font-serif text-[clamp(1.8rem,3vw,2.4rem)] font-bold tracking-tight text-white mb-1.5">
                            {s.value}
                        </p>
                        <p className="text-[0.75rem] font-semibold uppercase tracking-widest text-warm-500">
                            {s.label}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
