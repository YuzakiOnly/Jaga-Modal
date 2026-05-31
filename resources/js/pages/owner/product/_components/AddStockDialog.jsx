import { useState } from "react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { PackagePlus, Plus, Minus, Search, X, Loader2 } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AddStockDialog({ open, onOpenChange, products = [] }) {
    const [search, setSearch] = useState("");
    const [adjustments, setAdjustments] = useState({});
    const [processing, setProcessing] = useState(false);

    const limitedProducts = products.filter((p) => p.stock_type === "limited");

    const filtered = limitedProducts.filter((p) => {
        const q = search.toLowerCase();
        return (
            p.name.toLowerCase().includes(q) ||
            (p.sku && p.sku.toLowerCase().includes(q))
        );
    });

    const selectedIds = Object.keys(adjustments).filter(
        (id) => (adjustments[id] ?? 0) !== 0,
    );

    const getQty = (id) => adjustments[String(id)] ?? 0;

    const setQty = (id, val) => {
        const parsed = parseInt(val, 10);
        setAdjustments((prev) => ({
            ...prev,
            [String(id)]: isNaN(parsed) ? 0 : parsed,
        }));
    };

    const increment = (id) => setQty(id, getQty(id) + 1);
    const decrement = (id) => setQty(id, Math.max(0, getQty(id) - 1));

    const removeProduct = (id) => {
        setAdjustments((prev) => {
            const next = { ...prev };
            delete next[String(id)];
            return next;
        });
    };

    const handleClose = () => {
        setSearch("");
        setAdjustments({});
        onOpenChange(false);
    };

    const handleSubmit = () => {
        const items = selectedIds
            .map((id) => ({ id: parseInt(id, 10), qty: adjustments[id] }))
            .filter((item) => item.qty > 0);

        if (items.length === 0) return;

        setProcessing(true);
        router.post(
            route("owner.products.stock-adjust"),
            { items },
            {
                preserveScroll: true,
                onSuccess: () => {
                    handleClose();
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const totalItems = selectedIds.length;
    const totalQty = selectedIds.reduce(
        (sum, id) => sum + (adjustments[id] ?? 0),
        0,
    );

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-xl gap-0 p-0 overflow-hidden">
                <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b">
                    <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <PackagePlus className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        Tambah Stok Produk
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">
                        Pilih produk dan masukkan jumlah stok yang ingin
                        ditambahkan.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama produk atau SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 sm:pl-9 pr-8 text-sm"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                        )}
                    </div>

                    <ScrollArea className="h-48 sm:h-56 md:h-64 -mx-1 px-1">
                        {filtered.length === 0 ? (
                            <div className="flex items-center justify-center h-20 text-xs sm:text-sm text-muted-foreground text-center px-4">
                                {limitedProducts.length === 0
                                    ? "Tidak ada produk dengan stok terbatas."
                                    : "Produk tidak ditemukan."}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filtered.map((product) => {
                                    const qty = getQty(product.id);
                                    const isLow =
                                        product.minimum_stock != null &&
                                        product.stock != null &&
                                        product.stock <= product.minimum_stock;

                                    return (
                                        <div
                                            key={product.id}
                                            className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 rounded-lg border px-2 sm:px-3 py-2 transition-colors hover:bg-muted/50"
                                        >
                                            {product.image ? (
                                                <img
                                                    src={`/storage/${product.image}`}
                                                    alt={product.name}
                                                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-md object-cover border shrink-0"
                                                />
                                            ) : (
                                                <span className="h-8 w-8 sm:h-9 sm:w-9 rounded-md bg-muted flex items-center justify-center text-xs font-bold border shrink-0 text-muted-foreground">
                                                    {product.name
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            )}

                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs sm:text-sm font-medium truncate">
                                                    {product.name}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-1 mt-0.5">
                                                    <span
                                                        className={`text-xs ${isLow ? "text-destructive font-medium" : "text-muted-foreground"}`}
                                                    >
                                                        Stok:{" "}
                                                        {product.stock ?? 0}{" "}
                                                        {product.unit}
                                                        {isLow && " ⚠"}
                                                    </span>
                                                    {product.sku && (
                                                        <span className="text-xs text-muted-foreground/60 font-mono hidden xs:inline">
                                                            · {product.sku}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0 ml-auto sm:ml-0">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-6 w-6 sm:h-7 sm:w-7"
                                                    onClick={() =>
                                                        decrement(product.id)
                                                    }
                                                    disabled={qty <= 0}
                                                >
                                                    <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                                </Button>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={qty || ""}
                                                    placeholder="0"
                                                    onChange={(e) =>
                                                        setQty(
                                                            product.id,
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-6 w-12 sm:h-7 sm:w-14 text-center text-xs sm:text-sm px-1 tabular-nums"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-6 w-6 sm:h-7 sm:w-7"
                                                    onClick={() =>
                                                        increment(product.id)
                                                    }
                                                >
                                                    <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </ScrollArea>

                    {totalItems > 0 && (
                        <div className="rounded-lg bg-muted/60 border px-3 sm:px-4 py-2 sm:py-3 space-y-1.5">
                            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Ringkasan
                            </p>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                {selectedIds.map((id) => {
                                    const p = products.find(
                                        (x) => String(x.id) === id,
                                    );
                                    if (!p || !adjustments[id]) return null;
                                    return (
                                        <div
                                            key={id}
                                            className="flex items-center justify-between gap-2 text-xs sm:text-sm"
                                        >
                                            <span className="truncate flex-1">
                                                {p.name}
                                            </span>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[10px] sm:text-xs tabular-nums"
                                                >
                                                    +{adjustments[id]} {p.unit}
                                                </Badge>
                                                <button
                                                    onClick={() =>
                                                        removeProduct(id)
                                                    }
                                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                                >
                                                    <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground pt-1 border-t">
                                {totalItems} produk · total +{totalQty} item
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 gap-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={processing}
                        size="sm"
                        className="flex-1 sm:flex-none"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={totalItems === 0 || processing}
                        className="gap-2 flex-1 sm:flex-none"
                        size="sm"
                    >
                        {processing && (
                            <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                        )}
                        Simpan Stok
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
