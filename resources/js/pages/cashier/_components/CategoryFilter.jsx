import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CategoryFilter({
    categories,
    activeCategory,
    onSelectCategory,
}) {
    const scrollRef = useRef(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(false);

    const checkScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeft(scrollLeft > 5);
        setShowRight(scrollLeft + clientWidth < scrollWidth - 5);
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
    }, [categories]);

    const scroll = (dir) => {
        scrollRef.current?.scrollBy({
            left: dir === "left" ? -200 : 200,
            behavior: "smooth",
        });
    };

    return (
        <div className="relative px-4 pb-3">
            {showLeft && (
                <button
                    onClick={() => scroll("left")}
                    className="absolute left-1 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-gray-200 shadow-md hover:bg-gray-50 transition-all"
                >
                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
            )}

            <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex gap-2 overflow-x-auto"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
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

            {showRight && (
                <button
                    onClick={() => scroll("right")}
                    className="absolute right-1 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-gray-200 shadow-md hover:bg-gray-50 transition-all"
                >
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
            )}
        </div>
    );
}
