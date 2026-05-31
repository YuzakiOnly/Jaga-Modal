// pages/owner/pos/_components/ProductGrid.jsx
import { useState, useRef, useEffect } from "react";
import {
    Search,
    Plus,
    PackagePlus,
    X,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function ProductGrid({
    products,
    categories,
    onAddProduct,
    onAddCustom,
}) {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [customOpen, setCustomOpen] = useState(false);
    const [customName, setCustomName] = useState("");
    const [customSellingPrice, setCustomSellingPrice] = useState("");
    const [customCapitalPrice, setCustomCapitalPrice] = useState("");
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const scrollRef = useRef(null);

    const filtered = products.filter((p) => {
        const matchSearch =
            search === "" ||
            p.name.toLowerCase().includes(search.toLowerCase());
        const matchCategory =
            activeCategory === "all" ||
            String(p.category_id) === String(activeCategory);
        return matchSearch && matchCategory && p.is_active;
    });

    const handleAddCustom = () => {
        if (!customName.trim() || !customSellingPrice) return;
        onAddCustom({
            name: customName.trim(),
            selling_price: parseFloat(customSellingPrice),
            capital_price: parseFloat(customCapitalPrice) || 0,
        });
        setCustomName("");
        setCustomSellingPrice("");
        setCustomCapitalPrice("");
        setCustomOpen(false);
    };

    const formatPrice = (price) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeftArrow(scrollLeft > 5);
            setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 5);
        }
    };

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = direction === "left" ? -200 : 200;
            scrollRef.current.scrollBy({
                left: scrollAmount,
                behavior: "smooth",
            });
        }
    };

    useEffect(() => {
        checkScroll();
        const handleResize = () => checkScroll();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [categories]);

    return (
        <div className="flex flex-col gap-4 h-full overflow-hidden">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari produk..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 shadow-none ring-0"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <Button
                    variant="outline"
                    className="gap-2 shrink-0"
                    onClick={() => setCustomOpen(true)}
                >
                    <PackagePlus className="h-4 w-4" />
                    Item Custom
                </Button>
            </div>

            <div className="relative shrink-0">
                {showLeftArrow && (
                    <button
                        onClick={() => scroll("left")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background border shadow-md hover:bg-accent transition-all"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                )}

                <div
                    ref={scrollRef}
                    onScroll={checkScroll}
                    className="flex gap-2 pb-2 overflow-x-auto"
                    style={{
                        scrollbarWidth: "thin",
                        msOverflowStyle: "auto",
                    }}
                >
                    <button
                        onClick={() => setActiveCategory("all")}
                        className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors border whitespace-nowrap ${
                            activeCategory === "all"
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-muted-foreground border-border hover:bg-accent"
                        }`}
                    >
                        Semua
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(String(cat.id))}
                            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors border whitespace-nowrap ${
                                activeCategory === String(cat.id)
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background text-muted-foreground border-border hover:bg-accent"
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {showRightArrow && (
                    <button
                        onClick={() => scroll("right")}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background border shadow-md hover:bg-accent transition-all"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                )}
            </div>

            {filtered.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
                    Tidak ada produk ditemukan.
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 overflow-y-auto pb-2">
                    {filtered.map((product) => {
                        const isOutOfStock =
                            product.stock_type === "limited" &&
                            product.stock <= 0;

                        return (
                            <button
                                key={product.id}
                                onClick={() =>
                                    !isOutOfStock && onAddProduct(product)
                                }
                                disabled={isOutOfStock}
                                className={`group relative flex flex-col rounded-xl border bg-card text-left transition-all overflow-hidden
                                    ${
                                        isOutOfStock
                                            ? "opacity-50 cursor-not-allowed"
                                            : "hover:border-primary/50 hover:shadow-md active:scale-[0.98] cursor-pointer"
                                    }`}
                            >
                                <div className="relative h-28 w-full bg-muted flex items-center justify-center overflow-hidden">
                                    {product.image ? (
                                        <img
                                            src={`/storage/${product.image}`}
                                            alt={product.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-3xl font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                            {product.name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    )}

                                    {!isOutOfStock && (
                                        <>
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                            <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-primary opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                                <Plus className="h-3.5 w-3.5" />
                                            </div>
                                        </>
                                    )}

                                    {isOutOfStock && (
                                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                                            <span className="text-xs font-semibold text-destructive bg-background/90 px-2 py-0.5 rounded-full border border-destructive/30">
                                                Habis
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1 p-3">
                                    <p className="text-sm font-medium line-clamp-2 leading-tight">
                                        {product.name}
                                    </p>
                                    <p className="text-xs font-semibold text-primary">
                                        {formatPrice(product.selling_price)}
                                    </p>
                                    {product.capital_price > 0 &&
                                        product.selling_price > 0 && (
                                            <p className="text-[10px] text-emerald-600">
                                                Laba:{" "}
                                                {formatPrice(
                                                    product.selling_price -
                                                        product.capital_price,
                                                )}
                                            </p>
                                        )}
                                    {product.stock_type === "unlimited" ? (
                                        <span className="mt-1 w-fit text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border">
                                            Unlimited
                                        </span>
                                    ) : product.stock > 0 ? (
                                        <span className="mt-1 w-fit text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border">
                                            Stok: {product.stock}
                                        </span>
                                    ) : null}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            <Dialog open={customOpen} onOpenChange={setCustomOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Tambah Item Custom</DialogTitle>
                        <DialogDescription>
                            Tambahkan item dengan nama, harga jual, dan harga
                            modal ke keranjang
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>Nama Item</Label>
                            <Input
                                placeholder="e.g. Es batu tambah"
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleAddCustom()
                                }
                                autoFocus
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Harga Jual</Label>
                            <Input
                                type="number"
                                min={0}
                                step={1000}
                                placeholder="0"
                                value={customSellingPrice}
                                onChange={(e) =>
                                    setCustomSellingPrice(e.target.value)
                                }
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleAddCustom()
                                }
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Harga Modal (HPP)</Label>
                            <Input
                                type="number"
                                min={0}
                                step={1000}
                                placeholder="0 (isi jika ada modal)"
                                value={customCapitalPrice}
                                onChange={(e) =>
                                    setCustomCapitalPrice(e.target.value)
                                }
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleAddCustom()
                                }
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Kosongkan jika tidak ada modal (laba = harga
                                jual)
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCustomOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleAddCustom}
                            disabled={!customName.trim() || !customSellingPrice}
                        >
                            Tambah ke Keranjang
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
