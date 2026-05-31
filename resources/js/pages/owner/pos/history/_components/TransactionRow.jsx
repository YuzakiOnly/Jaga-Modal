import { useState } from "react";
import {
    Banknote,
    QrCode,
    ChevronDown,
    ChevronRight,
    Receipt,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

export function TransactionRow({ transaction }) {
    const [open, setOpen] = useState(false);

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger className="w-full text-left">
                <div className="flex items-center justify-between px-3 sm:px-4 py-3 hover:bg-muted/40 transition-colors rounded-lg cursor-pointer gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Receipt className="h-4 w-4" />
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
                    <div className="flex items-center gap-2 shrink-0">
                        <Badge
                            variant={
                                transaction.payment_method === "cash"
                                    ? "secondary"
                                    : "outline"
                            }
                            className="text-xs gap-1 hidden sm:flex"
                        >
                            {transaction.payment_method === "cash" ? (
                                <Banknote className="h-3 w-3" />
                            ) : (
                                <QrCode className="h-3 w-3" />
                            )}
                            {transaction.payment_method.toUpperCase()}
                        </Badge>
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
                    <div className="flex items-center gap-1 sm:hidden mb-2">
                        <Badge
                            variant={
                                transaction.payment_method === "cash"
                                    ? "secondary"
                                    : "outline"
                            }
                            className="text-xs gap-1"
                        >
                            {transaction.payment_method === "cash" ? (
                                <Banknote className="h-3 w-3" />
                            ) : (
                                <QrCode className="h-3 w-3" />
                            )}
                            {transaction.payment_method.toUpperCase()}
                        </Badge>
                    </div>

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
