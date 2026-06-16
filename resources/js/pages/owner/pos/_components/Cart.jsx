import { useState } from "react";
import {
    ShoppingCart,
    Trash2,
    Minus,
    Plus,
    X,
    Tag,
    Percent,
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

function CartItem({ item, onUpdateQty, onUpdateDiscount, onRemove }) {
    const subtotal =
        item.subtotal || (item.unit_price - item.discount) * item.qty;
    const [discountInput, setDiscountInput] = useState(
        item.discount ? formatNumberInput(item.discount) : "",
    );
    const [discountError, setDiscountError] = useState("");
    const [qtyInput, setQtyInput] = useState(item.qty.toString());
    const [isEditingQty, setIsEditingQty] = useState(false);

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
            setQtyInput(newQty.toString());
        } catch (error) {
            toast.error(error.errors[0]?.message || "Quantity tidak valid");
        }
    };

    const handleQtyInputChange = (e) => {
        const rawValue = e.target.value;
        if (rawValue === "") {
            setQtyInput("");
            return;
        }
        const numericValue = parseNumberInput(rawValue);
        setQtyInput(numericValue.toString());
    };

    const handleQtyInputBlur = () => {
        if (qtyInput === "") {
            handleQtyChange(1);
        } else {
            const newQty = parseInt(qtyInput, 10);
            if (newQty >= 1) {
                handleQtyChange(newQty);
            } else {
                handleQtyChange(1);
            }
        }
        setIsEditingQty(false);
    };

    const handleQtyInputKeyDown = (e) => {
        if (e.key === "Enter") {
            e.currentTarget.blur();
        }
    };

    const handleQtyClick = () => {
        setIsEditingQty(true);
        setQtyInput(item.qty.toString());
    };

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
                    {isEditingQty ? (
                        <input
                            type="text"
                            inputMode="numeric"
                            value={qtyInput}
                            onChange={handleQtyInputChange}
                            onBlur={handleQtyInputBlur}
                            onKeyDown={handleQtyInputKeyDown}
                            className="w-12 text-center text-sm tabular-nums font-medium border rounded-md px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            autoFocus
                        />
                    ) : (
                        <span
                            onClick={handleQtyClick}
                            className="w-12 text-center text-sm tabular-nums font-medium cursor-pointer hover:bg-accent rounded-md px-1 py-0.5 transition-colors"
                        >
                            {item.qty}
                        </span>
                    )}
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
}) {
    const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
    const [globalDiscountInput, setGlobalDiscountInput] = useState(
        globalDiscount ? formatNumberInput(globalDiscount) : "",
    );
    const [globalDiscountError, setGlobalDiscountError] = useState("");

    const computedSubtotal =
        subtotalAfterItemDiscount ||
        items.reduce(
            (sum, item) =>
                sum +
                (item.subtotal ||
                    (item.unit_price - (item.discount || 0)) * item.qty),
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
        <div className="flex flex-col h-full bg-card w-full min-w-0">
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
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
                        <span className="hidden sm:inline">Kosongkan</span>
                    </button>
                )}
            </div>

            <ScrollArea className="flex-1 min-h-0 px-4">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-2 text-muted-foreground">
                        <ShoppingCart className="h-8 w-8 opacity-30" />
                        <p className="text-sm">Keranjang masih kosong</p>
                        <p className="text-xs opacity-60">
                            Klik produk untuk menambahkan
                        </p>
                    </div>
                ) : (
                    <div className="divide-y pb-2">
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

            <div className="border-t px-4 py-4 space-y-3 shrink-0 bg-card">
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
