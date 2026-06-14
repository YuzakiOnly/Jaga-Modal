import { useRef, useEffect, useState } from "react";
import {
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

export default function CategoryFilter({
    categories,
    activeCategory,
    onSelectCategory,
}) {
    const scrollRefVertical = useRef(null);
    const scrollRefHorizontal = useRef(null);
    const [showUp, setShowUp] = useState(false);
    const [showDown, setShowDown] = useState(false);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(false);

    const checkVertical = () => {
        if (!scrollRefVertical.current) return;
        const { scrollTop, scrollHeight, clientHeight } =
            scrollRefVertical.current;
        setShowUp(scrollTop > 5);
        setShowDown(scrollTop + clientHeight < scrollHeight - 5);
    };

    const checkHorizontal = () => {
        if (!scrollRefHorizontal.current) return;
        const { scrollLeft, scrollWidth, clientWidth } =
            scrollRefHorizontal.current;
        setShowLeft(scrollLeft > 5);
        setShowRight(scrollLeft + clientWidth < scrollWidth - 5);
    };

    useEffect(() => {
        checkVertical();
        checkHorizontal();

        const handleResize = () => {
            checkVertical();
            checkHorizontal();
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [categories]);

    const scrollV = (dir) => {
        scrollRefVertical.current?.scrollBy({
            top: dir === "up" ? -120 : 120,
            behavior: "smooth",
        });
    };

    const scrollH = (dir) => {
        scrollRefHorizontal.current?.scrollBy({
            left: dir === "left" ? -200 : 200,
            behavior: "smooth",
        });
    };

    return (
        <>
            {/* Desktop Sidebar - Vertical */}
            <div className="hidden lg:flex relative flex-col h-full w-full bg-white">
                <div className="p-4 border-b border-gray-100 shrink-0">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                        Filter
                    </p>
                    <h2 className="text-sm font-bold text-gray-800">
                        Category Products
                    </h2>
                </div>

                {showUp && (
                    <button
                        onClick={() => scrollV("up")}
                        className="absolute top-16 left-1/2 -translate-x-1/2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-gray-200 shadow-md hover:bg-gray-50 transition-all"
                    >
                        <ChevronUp className="h-3.5 w-3.5 text-gray-600" />
                    </button>
                )}

                <div
                    ref={scrollRefVertical}
                    onScroll={checkVertical}
                    className="flex-1 overflow-y-auto py-2"
                >
                    {categories.map((cat) => (
                        <button
                            key={cat.id ?? "all"}
                            onClick={() => onSelectCategory(cat.id)}
                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer ${
                                activeCategory === cat.id
                                    ? "bg-emerald-50 text-emerald-700 border-r-2 border-emerald-600"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div className="flex-1" />

                {showDown && (
                    <button
                        onClick={() => scrollV("down")}
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-gray-200 shadow-md hover:bg-gray-50 transition-all"
                    >
                        <ChevronDown className="h-3.5 w-3.5 text-gray-600" />
                    </button>
                )}
            </div>

            {/* Mobile & Tablet - Horizontal Scroll (tanpa judul karena sudah ada di parent) */}
            <div className="lg:hidden relative px-4 py-3">
                {showLeft && (
                    <button
                        onClick={() => scrollH("left")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-gray-200 shadow-md hover:bg-gray-50 transition-all"
                    >
                        <ChevronLeft className="h-4 w-4 text-gray-600" />
                    </button>
                )}

                <div
                    ref={scrollRefHorizontal}
                    onScroll={checkHorizontal}
                    className="flex gap-2 overflow-x-auto scrollbar-hide"
                    style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                    }}
                >
                    {categories.map((cat) => (
                        <button
                            key={cat.id ?? "all"}
                            onClick={() => onSelectCategory(cat.id)}
                            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
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
                        onClick={() => scrollH("right")}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-gray-200 shadow-md hover:bg-gray-50 transition-all"
                    >
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                    </button>
                )}
            </div>
        </>
    );
}
