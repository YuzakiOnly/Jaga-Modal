const TEAM = [
    {
        name: "Arya Pratama",
        role: "Founder & Full-stack Developer",
        bio: "Lulusan Teknik Informatika yang punya passion membantu UMKM Indonesia lebih melek teknologi.",
        avatar: "AP",
        avatarBg: "from-emerald-400 to-teal-500",
        tags: ["Laravel", "React", "UI/UX"],
    },
    {
        name: "Dewi Kusuma",
        role: "Co-founder & Business Analyst",
        bio: "Mantan konsultan bisnis yang paham betul masalah pencatatan dan pelaporan UMKM.",
        avatar: "DK",
        avatarBg: "from-violet-400 to-purple-500",
        tags: ["Strategi", "Keuangan", "UMKM"],
    },
    {
        name: "Fariz Abdillah",
        role: "UI/UX & Frontend Developer",
        bio: "Desainer yang percaya software bagus seharusnya bisa dipakai siapa saja tanpa belajar dulu.",
        avatar: "FA",
        avatarBg: "from-blue-400 to-indigo-500",
        tags: ["Design", "React", "Tailwind"],
    },
];

export default function TeamSection() {
    return (
        <section id="tim" className="bg-warm-50 py-24 px-6">
            <div className="mx-auto max-w-6xl">
                <div className="mb-14 text-center">
                    <p className="text-xs font-bold tracking-widest uppercase text-brand-600 mb-3">
                        Tim Kami
                    </p>
                    <h2 className="font-serif text-[clamp(1.8rem,3vw,2.4rem)] font-bold leading-tight tracking-tight text-warm-950">
                        Orang-orang di balik{" "}
                        <em className="italic text-brand-600">jaga modal</em>
                    </h2>
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                    {TEAM.map((m) => (
                        <div
                            key={m.name}
                            className="rounded-2xl border border-warm-100 bg-white p-8 text-center transition-all hover:-translate-y-1.5 hover:shadow-xl hover:shadow-warm-900/10"
                        >
                            <div
                                className={`mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-gradient-to-br ${m.avatarBg} text-lg font-extrabold text-white`}
                            >
                                {m.avatar}
                            </div>

                            <h3 className="mb-1 font-bold text-warm-950">
                                {m.name}
                            </h3>
                            <p className="mb-3 text-xs font-semibold text-brand-600">
                                {m.role}
                            </p>
                            <p className="mb-5 text-sm leading-relaxed text-warm-500">
                                {m.bio}
                            </p>

                            <div className="flex flex-wrap justify-center gap-1.5">
                                {m.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-full bg-warm-100 px-3 py-1 text-xs font-semibold text-warm-600"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
