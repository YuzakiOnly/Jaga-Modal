export default function CategoryFilter({
    categories,
    activeCategory,
    onSelectCategory,
}) {
    return (
        <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2">
                {categories.map((cat) => (
                    <button
                        key={cat.id ?? "all"}
                        onClick={() => onSelectCategory(cat.id)}
                        className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                            activeCategory === cat.id
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-700"
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
