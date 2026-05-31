import { Search, X } from "lucide-react";

export default function SearchBar({ value, onChange }) {
    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
                id="search-input"
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Cari produk..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:py-2.5 sm:text-sm border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
            />
            {value && (
                <button
                    onClick={() => onChange("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
            )}
        </div>
    );
}
