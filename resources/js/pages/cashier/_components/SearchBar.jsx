import { Search, X, SlidersHorizontal } from "lucide-react";

export default function SearchBar({
    value,
    onChange,
    onOpenFilter,
    filterActive,
}) {
    return (
        <div className="flex items-stretch gap-2">
            <div className="relative w-56 lg:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    id="search-input"
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Cari produk..."
                    className="w-full pl-10 pr-9 py-2.5 text-sm border border-slate-200 rounded-full bg-slate-50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
                {value && (
                    <button
                        onClick={() => onChange("")}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2"
                    >
                        <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                    </button>
                )}
            </div>

            {onOpenFilter && (
                <button
                    onClick={onOpenFilter}
                    className={`relative shrink-0 flex items-center justify-center w-10 rounded-full border transition-all duration-200 cursor-pointer ${
                        filterActive
                            ? "bg-orange-600 border-orange-600 text-white"
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700"
                    }`}
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    {filterActive && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white" />
                    )}
                </button>
            )}
        </div>
    );
}
