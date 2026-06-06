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
    User,
    Phone,
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

const CHANNEL_CONFIG = {
    dine_in: {
        label: "Dine In",
        icon: Store,
        badgeClass: "border-slate-200 bg-slate-50 text-slate-600",
        feeBox: "bg-slate-50 border-slate-200 text-slate-700",
        netColor: "text-slate-700",
    },
    grabfood: {
        label: "GrabFood",
        icon: Bike,
        badgeClass: "border-green-200 bg-green-50 text-green-700",
        feeBox: "bg-green-50 border-green-200 text-green-800",
        netColor: "text-green-700",
    },
    shopeefood: {
        label: "ShopeeFood",
        icon: Bike,
        badgeClass: "border-orange-200 bg-orange-50 text-orange-600",
        feeBox: "bg-orange-50 border-orange-200 text-orange-800",
        netColor: "text-orange-600",
    },
    gobiz: {
        label: "GoBiz",
        icon: Zap,
        badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
        feeBox: "bg-emerald-50 border-emerald-200 text-emerald-800",
        netColor: "text-emerald-700",
    },
};

const PAYMENT_METHOD_CONFIG = {
    cash: { label: "Cash", icon: Banknote, variant: "secondary" },
    qris: { label: "QRIS", icon: QrCode, variant: "outline" },
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

    const platformFee = parseFloat(transaction.platform_fee ?? 0);
    const netRevenue = parseFloat(transaction.net_revenue ?? 0);
    const total = parseFloat(transaction.total ?? 0);

    // Customer info
    const customer = transaction.customer;
    const customerLabel = customer
        ? customer.name
            ? customer.name
            : `Pelanggan #${customer.customer_number}`
        : null;

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
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-xs text-muted-foreground">
                                    {formatDate(transaction.transacted_at)}
                                </p>
                                {/* Customer label inline */}
                                {customerLabel && (
                                    <>
                                        <span className="text-muted-foreground/40 text-xs">
                                            ·
                                        </span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                            <User className="h-3 w-3 shrink-0" />
                                            {customerLabel}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: badges + total */}
                    <div className="flex items-center gap-2 shrink-0">
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

                        {!isOnline && paymentCfg && (
                            <Badge
                                variant={paymentCfg.variant}
                                className="text-xs gap-1 hidden sm:flex"
                            >
                                <paymentCfg.icon className="h-3 w-3" />
                                {paymentCfg.label}
                            </Badge>
                        )}

                        {isOnline ? (
                            <div className="text-right">
                                <span
                                    className={cn(
                                        "text-sm font-bold tabular-nums",
                                        channelCfg.netColor,
                                    )}
                                >
                                    {formatPrice(netRevenue)}
                                </span>
                                <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                                    setelah fee
                                </p>
                            </div>
                        ) : (
                            <span className="text-sm font-bold tabular-nums text-primary">
                                {formatPrice(total)}
                            </span>
                        )}

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

                    {/* Customer detail box */}
                    {customer && (
                        <div className="flex items-center gap-2 rounded-md bg-background border px-3 py-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                                #{customer.customer_number}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium">
                                    {customer.name ?? (
                                        <span className="text-muted-foreground italic">
                                            Pelanggan #
                                            {customer.customer_number}
                                        </span>
                                    )}
                                </p>
                                {customer.phone && (
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                                        <Phone className="h-2.5 w-2.5" />
                                        {customer.phone}
                                    </p>
                                )}
                            </div>
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
                        <span>Total Transaksi</span>
                        <span className="tabular-nums text-primary">
                            {formatPrice(total)}
                        </span>
                    </div>

                    {/* Fee platform breakdown */}
                    {isOnline && platformFee > 0 && (
                        <>
                            <Separator />
                            <div
                                className={cn(
                                    "rounded-md border p-2.5 space-y-1.5",
                                    channelCfg.feeBox,
                                )}
                            >
                                <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
                                    Rincian {channelCfg.label}
                                </p>
                                <div className="flex justify-between text-xs">
                                    <span className="opacity-80">
                                        Harga ke pelanggan
                                    </span>
                                    <span className="tabular-nums font-medium">
                                        {formatPrice(total)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="opacity-80">
                                        Fee platform (20%)
                                    </span>
                                    <span className="tabular-nums font-medium text-destructive">
                                        − {formatPrice(platformFee)}
                                    </span>
                                </div>
                                <Separator className="opacity-30" />
                                <div className="flex justify-between text-sm font-bold">
                                    <span>Pendapatan bersih</span>
                                    <span
                                        className={cn(
                                            "tabular-nums",
                                            channelCfg.netColor,
                                        )}
                                    >
                                        {formatPrice(netRevenue)}
                                    </span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Cash detail */}
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
