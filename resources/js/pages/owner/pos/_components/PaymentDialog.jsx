import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Banknote, QrCode, CheckCircle2, Loader2 } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price);

const QUICK_AMOUNTS = [5000, 10000, 20000, 50000, 100000];

export function PaymentDialog({ open, onOpenChange, cartItems, onSuccess }) {
    const [method, setMethod] = useState("cash");
    const [amountPaid, setAmountPaid] = useState("");
    const [processing, setProcessing] = useState(false);
    const [qrisConfirmed, setQrisConfirmed] = useState(false);
    const [error, setError] = useState(null);

    const total = cartItems.reduce(
        (sum, item) =>
            sum + (item.unit_price - (item.discount || 0)) * item.qty,
        0,
    );

    const paid = parseFloat(amountPaid) || 0;
    const change = paid - total;
    const cashValid = paid >= total;
    const canSubmit =
        cartItems.length > 0 && (method === "qris" ? qrisConfirmed : cashValid);

    useEffect(() => {
        if (open) {
            setMethod("cash");
            setAmountPaid("");
            setQrisConfirmed(false);
            setProcessing(false);
            setError(null);
        }
    }, [open]);

    const handleQuickAmount = (amount) => {
        setAmountPaid(String(amount));
    };

    const handleSubmit = () => {
        setProcessing(true);
        setError(null);

        const payload = {
            payment_method: method,
            amount_paid: method === "cash" ? paid : total,
            change_amount: method === "cash" ? Math.max(change, 0) : 0,
            subtotal: total,
            discount: 0,
            total: total,
            notes: null,
            transacted_at: null,
            items: cartItems.map((item) => ({
                product_id: item.product_id || null,
                name: item.name,
                unit_price: parseFloat(item.unit_price),
                capital_price: parseFloat(item.capital_price || 0),
                qty: parseInt(item.qty),
                discount: parseFloat(item.discount || 0),
                subtotal: parseFloat(
                    (item.unit_price - (item.discount || 0)) * item.qty,
                ),
                is_custom: item.is_custom || false,
            })),
        };

        router.post(route("owner.transactions.store"), payload, {
            preserveScroll: true,
            onSuccess: () => {
                setProcessing(false);
                onSuccess();
                onOpenChange(false);
            },
            onError: (errors) => {
                setProcessing(false);

                let errorMessage =
                    "Terjadi kesalahan saat memproses transaksi.";

                if (errors && typeof errors === "object") {
                    if (errors.errors) {
                        const validationErrors = Object.values(
                            errors.errors,
                        ).flat();
                        if (validationErrors.length > 0) {
                            errorMessage = validationErrors.join(", ");
                        }
                    } else if (errors.message) {
                        errorMessage = errors.message;
                    } else if (errors.error) {
                        errorMessage = errors.error;
                    }
                }

                setError(errorMessage);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Pembayaran</DialogTitle>
                    <DialogDescription>
                        Masukkan detail pembayaran untuk menyelesaikan transaksi
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5">
                    {error && (
                        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                            <p className="text-sm text-destructive font-medium">
                                Error:
                            </p>
                            <p className="text-sm text-destructive mt-1">
                                {error}
                            </p>
                        </div>
                    )}

                    <div className="rounded-lg bg-muted/50 px-4 py-3 text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                            Total Pembayaran
                        </p>
                        <p className="text-3xl font-bold tabular-nums text-primary">
                            {formatPrice(total)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {cartItems.reduce((s, i) => s + i.qty, 0)} item
                        </p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { value: "cash", label: "Cash", icon: Banknote },
                            { value: "qris", label: "QRIS", icon: QrCode },
                        ].map(({ value, label, icon: Icon }) => (
                            <button
                                key={value}
                                onClick={() => setMethod(value)}
                                className={cn(
                                    "flex flex-col items-center gap-2 rounded-xl border-2 py-4 transition-all",
                                    method === value
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-border bg-background text-muted-foreground hover:border-muted-foreground/40",
                                )}
                            >
                                <Icon className="h-6 w-6" />
                                <span className="text-sm font-semibold">
                                    {label}
                                </span>
                            </button>
                        ))}
                    </div>

                    <Separator />

                    {method === "cash" && (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>Uang Diterima</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    step={1000}
                                    placeholder="0"
                                    value={amountPaid}
                                    onChange={(e) =>
                                        setAmountPaid(e.target.value)
                                    }
                                    className="text-lg font-semibold tabular-nums"
                                    autoFocus
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {QUICK_AMOUNTS.filter(
                                    (a) =>
                                        a >= total ||
                                        a ===
                                            QUICK_AMOUNTS[
                                                QUICK_AMOUNTS.length - 1
                                            ],
                                )
                                    .slice(0, 4)
                                    .map((amount) => (
                                        <button
                                            key={amount}
                                            onClick={() =>
                                                handleQuickAmount(amount)
                                            }
                                            className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                                        >
                                            {formatPrice(amount)}
                                        </button>
                                    ))}
                                <button
                                    onClick={() => handleQuickAmount(total)}
                                    className="rounded-lg border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                                >
                                    Uang Pas
                                </button>
                            </div>

                            {paid > 0 && (
                                <div
                                    className={cn(
                                        "flex justify-between rounded-lg px-4 py-3",
                                        cashValid
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-destructive/10 text-destructive",
                                    )}
                                >
                                    <span className="text-sm font-medium">
                                        {cashValid ? "Kembalian" : "Kurang"}
                                    </span>
                                    <span className="font-bold tabular-nums">
                                        {formatPrice(Math.abs(change))}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {method === "qris" && (
                        <div className="space-y-4">
                            <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/30 py-6 px-4">
                                <QrCode className="h-12 w-12 text-muted-foreground/50" />
                                <div className="text-center">
                                    <p className="text-sm font-medium">
                                        Tampilkan QR Code ke pelanggan
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Pastikan pembayaran sebesar{" "}
                                        <strong>{formatPrice(total)}</strong>{" "}
                                        sudah diterima
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setQrisConfirmed((v) => !v)}
                                className={cn(
                                    "flex w-full items-center gap-3 rounded-lg border-2 px-4 py-3 transition-all",
                                    qrisConfirmed
                                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                        : "border-border bg-background text-muted-foreground hover:border-muted-foreground/40",
                                )}
                            >
                                <CheckCircle2
                                    className={cn(
                                        "h-5 w-5",
                                        qrisConfirmed
                                            ? "text-emerald-500"
                                            : "text-muted-foreground/30",
                                    )}
                                />
                                <span className="text-sm font-medium">
                                    Saya konfirmasi pembayaran sudah diterima
                                </span>
                            </button>
                        </div>
                    )}

                    <Button
                        className="w-full"
                        size="lg"
                        disabled={!canSubmit || processing}
                        onClick={handleSubmit}
                    >
                        {processing && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {processing ? "Menyimpan..." : "Selesaikan Transaksi"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
