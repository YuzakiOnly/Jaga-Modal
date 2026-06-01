import { useState } from "react";
import {
    Banknote,
    QrCode,
    ChevronDown,
    ChevronRight,
    Receipt,
    Bike,
    Zap,
    Store,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price);

const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

// Config per channel
const CHANNEL_CONFIG = {
    dine_in: {
        label: "Dine In",
        icon: Store,
        badgeClass: "border-slate-200 bg-slate-50 text-slate-600",
    },
    grabfood: {
        label: "GrabFood",
        icon: Bike,
        badgeClass: "border-green-200 bg-green-50 text-green-700",
    },
    shopeefood: {
        label: "ShopeFood",
        icon: Bike,
        badgeClass: "border-orange-200 bg-orange-50 text-orange-600",
    },
    gobiz: {
        label: "GoBiz",
        icon: Zap,
        badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
};

// Badge metode pembayaran (untuk dine_in)
const PAYMENT_METHOD_CONFIG = {
    cash: { label: "Cash", icon: Banknote, variant: "secondary" },
    qris: { label: "QRIS", icon: QrCode, variant: "outline" },
    // online channel — tidak tampil payment method badge terpisah
    grabfood: null,
    shopeefood: null,
    gobiz: null,
};

export function TransactionRow({ transaction }) {
    const [open, setOpen] = useState(false);

    const orderChannel = transaction.order_channel ?? "dine_in";
    const channelCfg = CHANNEL_CONFIG[orderChannel] ?? CHANNEL_CONFIG.dine_in;
    const ChannelIcon = channelCfg.icon;
    const isOnline = orderChannel !== "dine_in";

    const paymentCfg = PAYMENT_METHOD_CONFIG[transaction.payment_method];

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger className="w-full text-left">
                <div className="flex items-center justify-between px-3 sm:px-4 py-3 hover:bg-muted/40 transition-colors rounded-lg cursor-pointer gap-2">
                    {/* Left: icon + info */}
                    <div className="flex items-center gap-3 min-w-0">
                        <div
                            className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                                isOnline
                                    ? "bg-orange-100 text-orange-600"
                                    : "bg-primary/10 text-primary",
                            )}
                        >
                            {isOnline ? (
                                <ChannelIcon className="h-4 w-4" />
                            ) : (
                                <Receipt className="h-4 w-4" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">
                                {transaction.transaction_number}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatDate(transaction.transacted_at)}
                            </p>
                        </div>
                    </div>

                    {/* Right: badges + total */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Channel badge — selalu tampil */}
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-xs gap-1 hidden sm:flex",
                                channelCfg.badgeClass,
                            )}
                        >
                            <ChannelIcon className="h-3 w-3" />
                            {channelCfg.label}
                        </Badge>

                        {/* Payment method badge — hanya untuk dine_in cash/qris */}
                        {!isOnline && paymentCfg && (
                            <Badge
                                variant={paymentCfg.variant}
                                className="text-xs gap-1 hidden sm:flex"
                            >
                                <paymentCfg.icon className="h-3 w-3" />
                                {paymentCfg.label}
                            </Badge>
                        )}

                        <span className="text-sm font-bold tabular-nums text-primary">
                            {formatPrice(transaction.total)}
                        </span>
                        {open ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                    </div>
                </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
                <div className="mx-3 sm:mx-4 mb-3 rounded-lg border bg-muted/30 p-3 space-y-2">
                    {/* Badges mobile */}
                    <div className="flex items-center gap-1.5 sm:hidden mb-2 flex-wrap">
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-xs gap-1",
                                channelCfg.badgeClass,
                            )}
                        >
                            <ChannelIcon className="h-3 w-3" />
                            {channelCfg.label}
                        </Badge>
                        {!isOnline && paymentCfg && (
                            <Badge
                                variant={paymentCfg.variant}
                                className="text-xs gap-1"
                            >
                                <paymentCfg.icon className="h-3 w-3" />
                                {paymentCfg.label}
                            </Badge>
                        )}
                    </div>

                    {/* Info online channel */}
                    {isOnline && (
                        <div
                            className={cn(
                                "text-xs rounded-md px-2.5 py-1.5 mb-2",
                                channelCfg.badgeClass,
                                "border",
                            )}
                        >
                            Pendapatan masuk ke saldo{" "}
                            <strong>{channelCfg.label}</strong> (harga +20%)
                        </div>
                    )}

                    {/* Item list */}
                    <div className="space-y-1.5">
                        {transaction.items?.map((item) => (
                            <div
                                key={item.id}
                                className="flex justify-between text-xs"
                            >
                                <span className="text-muted-foreground">
                                    {item.name}
                                    {item.is_custom && (
                                        <Badge
                                            variant="outline"
                                            className="ml-1 px-1 py-0 text-[10px]"
                                        >
                                            Custom
                                        </Badge>
                                    )}{" "}
                                    × {item.qty}
                                    {item.discount > 0 && (
                                        <span className="text-destructive ml-1">
                                            (− {formatPrice(item.discount)}
                                            /item)
                                        </span>
                                    )}
                                </span>
                                <span className="font-medium tabular-nums">
                                    {formatPrice(item.subtotal)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <Separator />

                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Subtotal</span>
                        <span className="tabular-nums">
                            {formatPrice(transaction.subtotal)}
                        </span>
                    </div>
                    {parseFloat(transaction.discount) > 0 && (
                        <div className="flex justify-between text-xs text-destructive">
                            <span>Diskon</span>
                            <span className="tabular-nums">
                                − {formatPrice(transaction.discount)}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm font-bold">
                        <span>Total</span>
                        <span className="tabular-nums text-primary">
                            {formatPrice(transaction.total)}
                        </span>
                    </div>

                    {/* Cash detail — hanya untuk dine_in cash */}
                    {transaction.payment_method === "cash" && (
                        <>
                            <Separator />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Dibayar</span>
                                <span className="tabular-nums">
                                    {formatPrice(transaction.amount_paid)}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Kembalian</span>
                                <span className="tabular-nums">
                                    {formatPrice(transaction.change_amount)}
                                </span>
                            </div>
                        </>
                    )}

                    {transaction.notes && (
                        <p className="text-xs text-muted-foreground italic border-t pt-2 mt-2">
                            {transaction.notes}
                        </p>
                    )}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
