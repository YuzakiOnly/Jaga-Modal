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
            left: dir === "left" ? -220 : 220,
            behavior: "smooth",
        });
    };

    return (
        <div className="relative flex items-center">
            {showLeft && (
                <button
                    onClick={() => scroll("left")}
                    className="absolute left-0 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-slate-200 shadow-md hover:bg-slate-50 transition-all"
                >
                    <ChevronLeft className="h-4 w-4 text-slate-600" />
                </button>
            )}

            <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex gap-6 overflow-x-auto scrollbar-hide w-full"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {categories.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                        <button
                            key={cat.id ?? "all"}
                            onClick={() => onSelectCategory(cat.id)}
                            className={`relative shrink-0 pb-3 text-sm font-semibold whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                                isActive
                                    ? "text-orange-600"
                                    : "text-slate-400 hover:text-slate-700"
                            }`}
                        >
                            {cat.name}
                            <span
                                className={`absolute left-0 right-0 -bottom-px h-[2.5px] rounded-full bg-orange-500 transition-all duration-200 ${
                                    isActive ? "opacity-100" : "opacity-0"
                                }`}
                            />
                        </button>
                    );
                })}
            </div>

            {showRight && (
                <button
                    onClick={() => scroll("right")}
                    className="absolute right-0 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-slate-200 shadow-md hover:bg-slate-50 transition-all"
                >
                    <ChevronRight className="h-4 w-4 text-slate-600" />
                </button>
            )}
        </div>
    );
}
