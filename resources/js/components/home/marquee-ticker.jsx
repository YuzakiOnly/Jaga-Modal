const ITEMS = [
    "🍜 Warung Makan",
    "🏪 Toko Kelontong",
    "📦 Online Shop",
    "🧁 Bakery",
    "💈 Barbershop",
    "💻 Jasa Printing",
    "🐟 Pedagang Ikan",
    "☕ Kafe",
    "🌸 Toko Bunga",
    "📚 Toko Buku",
];

const TICKER = [...ITEMS, ...ITEMS];

export default function MarqueeTicker() {
    return (
        <div className="overflow-hidden border-y border-warm-200 bg-warm-100 py-3.5">
            <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
                {TICKER.map((item, i) => (
                    <span
                        key={i}
                        className="inline-flex items-center gap-2 text-sm font-medium text-warm-500"
                    >
                        {item}
                        <span className="ml-3 text-warm-300">·</span>
                    </span>
                ))}
            </div>
        </div>
    );
}
