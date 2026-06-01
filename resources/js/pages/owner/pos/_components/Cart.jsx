import { useState } from "react";
import {
    ShoppingCart,
    Trash2,
    Minus,
    Plus,
    X,
    Tag,
    Percent,
    Bike,
    Store,
    Zap,
} from "lucide-react";

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
import { toast } from "sonner";
import { qtyInputSchema } from "@/schemas/posSchema";
import { cn } from "@/lib/utils";

const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price);

const parseNumberInput = (value) => {
    if (!value) return 0;
    const clean = String(value).replace(/[^0-9]/g, "");
    return clean ? parseInt(clean, 10) : 0;
};

const formatNumberInput = (value) => {
    if (!value || value === 0) return "";
    return new Intl.NumberFormat("id-ID").format(value);
};

// ─── Channel config ──────────────────────────────────────────────────────────
export const CHANNELS = [
    {
        id: "dine_in",
        label: "Dine In",
        shortLabel: "Dine In",
        icon: Store,
        color: "text-slate-600",
        bgActive: "bg-slate-800 text-white border-slate-800",
        bgInactive:
            "bg-background text-muted-foreground border-border hover:bg-accent",
        online: false,
    },
    {
        id: "grabfood",
        label: "GrabFood",
        shortLabel: "Grab",
        icon: Bike,
        color: "text-green-600",
        bgActive: "bg-green-600 text-white border-green-600",
        bgInactive:
            "bg-background text-green-700 border-green-200 hover:bg-green-50",
        online: true,
    },
    {
        id: "shopeefood",
        label: "ShopeFood",
        shortLabel: "Shopee",
        icon: Bike,
        color: "text-orange-500",
        bgActive: "bg-orange-500 text-white border-orange-500",
        bgInactive:
            "bg-background text-orange-600 border-orange-200 hover:bg-orange-50",
        online: true,
    },
    {
        id: "gobiz",
        label: "GoBiz",
        shortLabel: "Gojek",
        icon: Zap,
        color: "text-emerald-600",
        bgActive: "bg-emerald-600 text-white border-emerald-600",
        bgInactive:
            "bg-background text-emerald-700 border-emerald-200 hover:bg-emerald-50",
        online: true,
    },
];

// ─── CartItem ─────────────────────────────────────────────────────────────────
function CartItem({ item, onUpdateQty, onUpdateDiscount, onRemove, isOnline }) {
    const subtotal = (item.unit_price - item.discount) * item.qty;
    const profitPerItem = item.unit_price - item.capital_price;
    const [discountInput, setDiscountInput] = useState(
        item.discount ? formatNumberInput(item.discount) : "",
    );
    const [discountError, setDiscountError] = useState("");

    const handleDiscountChange = (e) => {
        const rawValue = e.target.value;
        const numericValue = parseNumberInput(rawValue);

        if (rawValue !== "" && numericValue > item.unit_price) {
            setDiscountError(`Diskon maksimal ${formatPrice(item.unit_price)}`);
            return;
        }

        setDiscountError("");

        if (rawValue === "") {
            setDiscountInput("");
            onUpdateDiscount(item._key, 0);
        } else {
            setDiscountInput(formatNumberInput(numericValue));
            onUpdateDiscount(item._key, numericValue);
        }
    };

    const handleDiscountBlur = () => {
        if (discountInput === "") {
            setDiscountInput("");
            onUpdateDiscount(item._key, 0);
        }
    };

    const handleQtyChange = (newQty) => {
        if (newQty < 1) {
            onRemove(item._key);
            return;
        }

        try {
            qtyInputSchema.parse({ qty: newQty });
            onUpdateQty(item._key, newQty);
        } catch (error) {
            toast.error(error.errors[0]?.message || "Quantity tidak valid");
        }
    };

    return (
        <div className="flex flex-col gap-1.5 py-3">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-medium leading-tight line-clamp-1">
                            {item.name}
                        </p>
                        {isOnline && !item.is_custom && (
                            <Badge
                                variant="outline"
                                className="text-[10px] px-1 py-0 border-orange-300 text-orange-600 bg-orange-50 shrink-0"
                            >
                                +20%
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {formatPrice(item.unit_price)}
                        {/* Tampilkan harga asli jika online */}
                        {isOnline &&
                            !item.is_custom &&
                            item.base_unit_price && (
                                <span className="ml-1 text-muted-foreground/60 line-through text-[10px]">
                                    {formatPrice(item.base_unit_price)}
                                </span>
                            )}
                        {item.discount > 0 && (
                            <span className="ml-1 text-destructive">
                                − {formatPrice(item.discount)}
                            </span>
                        )}
                    </p>
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
                    className="text-muted-foreground hover:text-destructive transition-colors mt-0.5 shrink-0"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleQtyChange(item.qty - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md border hover:bg-accent transition-colors"
                    >
                        <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm tabular-nums font-medium">
                        {item.qty}
                    </span>
                    <button
                        onClick={() => handleQtyChange(item.qty + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md border hover:bg-accent transition-colors"
                    >
                        <Plus className="h-3 w-3" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
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
                                    type="text"
                                    inputMode="numeric"
                                    value={discountInput}
                                    onChange={handleDiscountChange}
                                    onBlur={handleDiscountBlur}
                                    placeholder="0"
                                    className={`h-8 text-sm ${discountError ? "border-red-500" : ""}`}
                                />
                                {discountError && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {discountError}
                                    </p>
                                )}
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

// ─── ChannelSelector ──────────────────────────────────────────────────────────
function ChannelSelector({ orderChannel, onChannelChange }) {
    return (
        <div className="px-4 pt-3 pb-2 space-y-1.5 shrink-0">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Channel Pesanan
            </p>
            <div className="grid grid-cols-4 gap-1">
                {CHANNELS.map((ch) => {
                    const Icon = ch.icon;
                    const isActive = orderChannel === ch.id;
                    return (
                        <button
                            key={ch.id}
                            onClick={() => onChannelChange(ch.id)}
                            className={cn(
                                "flex flex-col items-center gap-1 rounded-lg border py-2 px-1 text-[10px] font-semibold transition-all",
                                isActive ? ch.bgActive : ch.bgInactive,
                            )}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            <span>{ch.shortLabel}</span>
                        </button>
                    );
                })}
            </div>
            {CHANNELS.find((c) => c.id === orderChannel)?.online && (
                <p className="text-[10px] text-orange-600 bg-orange-50 border border-orange-200 rounded-md px-2 py-1 text-center">
                    Harga produk otomatis +20% untuk channel online
                </p>
            )}
        </div>
    );
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export function Cart({
    items,
    onUpdateQty,
    onUpdateDiscount,
    onRemoveItem,
    onClearCart,
    onCheckout,
    globalDiscount = 0,
    onGlobalDiscountChange,
    subtotalAfterItemDiscount = 0,
    finalTotal = 0,
    orderChannel = "dine_in",
    onChannelChange,
}) {
    const isOnline =
        CHANNELS.find((c) => c.id === orderChannel)?.online ?? false;
    const activeChannel = CHANNELS.find((c) => c.id === orderChannel);

    const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
    const [globalDiscountInput, setGlobalDiscountInput] = useState(
        globalDiscount ? formatNumberInput(globalDiscount) : "",
    );
    const [globalDiscountError, setGlobalDiscountError] = useState("");

    const computedSubtotal =
        subtotalAfterItemDiscount ||
        items.reduce(
            (sum, item) => sum + (item.unit_price - item.discount) * item.qty,
            0,
        );
    const computedFinalTotal =
        finalTotal || Math.max(0, computedSubtotal - globalDiscount);

    const handleGlobalDiscountChange = (e) => {
        const rawValue = e.target.value;
        const numericValue = parseNumberInput(rawValue);

        if (rawValue !== "" && numericValue > computedSubtotal) {
            setGlobalDiscountError(
                `Diskon maksimal ${formatPrice(computedSubtotal)}`,
            );
            return;
        }

        setGlobalDiscountError("");

        if (rawValue === "") {
            setGlobalDiscountInput("");
            onGlobalDiscountChange(0);
        } else {
            setGlobalDiscountInput(formatNumberInput(numericValue));
            onGlobalDiscountChange(numericValue);
        }
    };

    const handleGlobalDiscountBlur = () => {
        if (globalDiscountInput === "") {
            setGlobalDiscountInput("");
            onGlobalDiscountChange(0);
        }
    };

    return (
        <div className="flex flex-col h-full bg-card border-l w-full min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="font-semibold text-sm">Keranjang</span>
                    {totalItems > 0 && (
                        <Badge className="h-5 min-w-5 px-1.5 text-xs">
                            {totalItems}
                        </Badge>
                    )}
                    {/* Channel badge */}
                    {activeChannel && (
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-[10px] px-1.5 py-0 h-5",
                                isOnline
                                    ? "border-orange-300 text-orange-600 bg-orange-50"
                                    : "border-slate-300 text-slate-600",
                            )}
                        >
                            {activeChannel.label}
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

            {/* Channel selector */}
            {onChannelChange && (
                <>
                    <ChannelSelector
                        orderChannel={orderChannel}
                        onChannelChange={onChannelChange}
                    />
                    <Separator />
                </>
            )}

            {/* Items */}
            <ScrollArea className="flex-1 min-h-0 px-4">
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
                                isOnline={isOnline}
                            />
                        ))}
                    </div>
                )}
            </ScrollArea>

            {/* Summary & checkout */}
            <div className="border-t px-4 py-4 space-y-3 shrink-0">
                <div className="space-y-1.5">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Subtotal ({totalItems} item)</span>
                        <span className="tabular-nums">
                            {formatPrice(computedSubtotal)}
                        </span>
                    </div>

                    {onGlobalDiscountChange && (
                        <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Percent className="h-3.5 w-3.5" />
                                    <span>Diskon Total</span>
                                </div>
                                <div className="relative w-32">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                        Rp
                                    </span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={globalDiscountInput}
                                        onChange={handleGlobalDiscountChange}
                                        onBlur={handleGlobalDiscountBlur}
                                        placeholder="0"
                                        className={`w-full pl-7 pr-2 py-1.5 text-right text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-transparent ${
                                            globalDiscountError
                                                ? "border-red-500"
                                                : "border-border"
                                        }`}
                                    />
                                </div>
                            </div>
                            {globalDiscountError && (
                                <p className="text-xs text-red-500 text-right">
                                    {globalDiscountError}
                                </p>
                            )}
                        </div>
                    )}

                    {globalDiscount > 0 && (
                        <div className="flex justify-between text-sm text-destructive">
                            <span>Diskon Total</span>
                            <span className="tabular-nums">
                                − {formatPrice(globalDiscount)}
                            </span>
                        </div>
                    )}

                    <Separator />
                    <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="tabular-nums text-primary text-lg">
                            {formatPrice(computedFinalTotal)}
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
