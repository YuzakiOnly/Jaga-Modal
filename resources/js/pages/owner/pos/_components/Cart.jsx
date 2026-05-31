import { ShoppingCart, Trash2, Minus, Plus, X, Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price);

function CartItem({ item, onUpdateQty, onUpdateDiscount, onRemove }) {
     const subtotal = (item.unit_price - item.discount) * item.qty;
     const profitPerItem = item.unit_price - item.capital_price;
     const totalProfit = profitPerItem * item.qty;

    return (
        <div className="flex flex-col gap-1.5 py-3">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight line-clamp-1">
                        {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {formatPrice(item.unit_price)}
                        {item.discount > 0 && (
                            <span className="ml-1 text-destructive">
                                − {formatPrice(item.discount)}
                            </span>
                        )}
                    </p>
                    {/* Tampilkan estimasi laba untuk item custom */}
                    {item.is_custom && item.capital_price > 0 && (
                        <p className="text-[10px] text-emerald-600 mt-0.5">
                            Modal: {formatPrice(item.capital_price)} |
                            Laba/item: {formatPrice(profitPerItem)}
                        </p>
                    )}
                    {item.is_custom && item.capital_price === 0 && (
                        <p className="text-[10px] text-amber-600 mt-0.5">
                            Modal: 0 (laba penuh)
                        </p>
                    )}
                    {item.is_custom && (
                        <Badge
                            variant="outline"
                            className="mt-0.5 text-xs px-1.5 py-0"
                        >
                            Custom
                        </Badge>
                    )}
                </div>
                <button
                    onClick={() => onRemove(item._key)}
                    className="text-muted-foreground hover:text-destructive transition-colors mt-0.5"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>

            <div className="flex items-center justify-between">
                {/* Qty control */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onUpdateQty(item._key, item.qty - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md border hover:bg-accent transition-colors"
                    >
                        <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm tabular-nums font-medium">
                        {item.qty}
                    </span>
                    <button
                        onClick={() => onUpdateQty(item._key, item.qty + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md border hover:bg-accent transition-colors"
                    >
                        <Plus className="h-3 w-3" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {/* Diskon per item */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                className={`flex h-6 w-6 items-center justify-center rounded-md border transition-colors hover:bg-accent ${
                                    item.discount > 0
                                        ? "border-amber-400 text-amber-500"
                                        : "text-muted-foreground"
                                }`}
                            >
                                <Tag className="h-3 w-3" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-52 p-3" align="end">
                            <div className="space-y-1.5">
                                <Label className="text-xs">
                                    Diskon per item (Rp)
                                </Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={item.unit_price}
                                    value={item.discount || ""}
                                    onChange={(e) =>
                                        onUpdateDiscount(
                                            item._key,
                                            e.target.value,
                                        )
                                    }
                                    placeholder="0"
                                    className="h-8 text-sm"
                                />
                            </div>
                        </PopoverContent>
                    </Popover>

                    <span className="text-sm font-semibold tabular-nums">
                        {formatPrice(subtotal)}
                    </span>
                </div>
            </div>
        </div>
    );
}

export function Cart({
    items,
    onUpdateQty,
    onUpdateDiscount,
    onRemoveItem,
    onClearCart,
    onCheckout,
}) {
    const subtotal = items.reduce(
        (sum, item) => sum + (item.unit_price - item.discount) * item.qty,
        0,
    );
    const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

    return (
        <div className="flex flex-col h-full bg-card border-l">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="font-semibold text-sm">Keranjang</span>
                    {totalItems > 0 && (
                        <Badge className="h-5 min-w-5 px-1.5 text-xs">
                            {totalItems}
                        </Badge>
                    )}
                </div>
                {items.length > 0 && (
                    <button
                        onClick={onClearCart}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Kosongkan
                    </button>
                )}
            </div>

            {/* Items */}
            <ScrollArea className="flex-1 px-4">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
                        <ShoppingCart className="h-8 w-8 opacity-30" />
                        <p className="text-sm">Keranjang masih kosong</p>
                        <p className="text-xs opacity-60">
                            Klik produk untuk menambahkan
                        </p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {items.map((item) => (
                            <CartItem
                                key={item._key}
                                item={item}
                                onUpdateQty={onUpdateQty}
                                onUpdateDiscount={onUpdateDiscount}
                                onRemove={onRemoveItem}
                            />
                        ))}
                    </div>
                )}
            </ScrollArea>

            {/* Summary + checkout */}
            <div className="border-t px-4 py-4 space-y-3">
                <div className="space-y-1.5">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Subtotal ({totalItems} item)</span>
                        <span className="tabular-nums">
                            {formatPrice(subtotal)}
                        </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="tabular-nums text-primary">
                            {formatPrice(subtotal)}
                        </span>
                    </div>
                </div>

                <Button
                    className="w-full"
                    size="lg"
                    disabled={items.length === 0}
                    onClick={onCheckout}
                >
                    Bayar Sekarang
                </Button>
            </div>
        </div>
    );
}
