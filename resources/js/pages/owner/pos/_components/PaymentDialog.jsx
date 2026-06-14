import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
    Banknote,
    QrCode,
    CheckCircle2,
    Loader2,
    Bike,
    Zap,
    User,
    Phone,
    ChevronDown,
    Calendar as CalendarIcon,
    Info,
} from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price);

const QUICK_AMOUNTS = [5000, 10000, 20000, 50000, 100000];

const CHANNEL_CONFIG = {
    dine_in: {
        label: "Dine In",
        methods: ["cash", "qris"],
        defaultMethod: "cash",
        isOnline: false,
        feeRate: 0,
    },
    grabfood: {
        label: "GrabFood",
        methods: ["grabfood"],
        defaultMethod: "grabfood",
        isOnline: true,
        color: "green",
        feeRate: 0.2,
        description:
            "Pembayaran akan diproses melalui GrabFood. Fee platform 20% akan dipotong untuk item dengan harga GrabFood.",
    },
    shopeefood: {
        label: "ShopeeFood",
        methods: ["shopeefood"],
        defaultMethod: "shopeefood",
        isOnline: true,
        color: "orange",
        feeRate: 0.25,
        description:
            "Pembayaran akan diproses melalui ShopeeFood. Fee platform 25% akan dipotong untuk item dengan harga ShopeeFood.",
    },
    gobiz: {
        label: "GoBiz",
        methods: ["gobiz"],
        defaultMethod: "gobiz",
        isOnline: true,
        color: "emerald",
        feeRate: 0.2,
        description:
            "Pembayaran akan diproses melalui GoBiz. Fee platform 20% akan dipotong untuk item dengan harga GoBiz.",
    },
};

const METHOD_CONFIG = {
    cash: { label: "Cash", icon: Banknote },
    qris: { label: "QRIS", icon: QrCode },
    grabfood: { label: "GrabFood", icon: Bike },
    shopeefood: { label: "ShopeeFood", icon: Bike },
    gobiz: { label: "GoBiz", icon: Zap },
};

const ONLINE_CHANNEL_STYLE = {
    grabfood: "border-green-300 bg-green-50 text-green-700",
    shopeefood: "border-orange-300 bg-orange-50 text-orange-700",
    gobiz: "border-emerald-300 bg-emerald-50 text-emerald-700",
};

const formatDateForBackend = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const formatShortDate = (date) => {
    return format(date, "dd/MM/yy", { locale: id });
};

const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
};

export function PaymentDialog({
    open,
    onOpenChange,
    cartItems,
    onSuccess,
    globalDiscount = 0,
    finalTotal = 0,
    subtotalAfterItemDiscount = 0,
    orderChannel = "dine_in",
    platformFee: propPlatformFee = 0,
    platformItemsCount: propPlatformItemsCount = 0,
    platformItemsTotalAmount: propPlatformItemsTotalAmount = 0,
    originalSubtotal: propOriginalSubtotal = 0,
    netRevenue: propNetRevenue = 0,
}) {
    const channelConfig =
        CHANNEL_CONFIG[orderChannel] ?? CHANNEL_CONFIG.dine_in;
    const isOnlineChannel = channelConfig.isOnline;
    const feeRate = channelConfig.feeRate || 0;

    const [method, setMethod] = useState(channelConfig.defaultMethod);
    const [amountPaid, setAmountPaid] = useState("");
    const [processing, setProcessing] = useState(false);
    const [qrisConfirmed, setQrisConfirmed] = useState(false);
    const [onlineConfirmed, setOnlineConfirmed] = useState(false);
    const [error, setError] = useState(null);

    const [customerOpen, setCustomerOpen] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");

    const [transactionDate, setTransactionDate] = useState(new Date());
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [useCustomDate, setUseCustomDate] = useState(false);

    const total =
        finalTotal ||
        cartItems.reduce(
            (sum, item) =>
                sum +
                (item.subtotal ||
                    (item.unit_price - (item.discount || 0)) * item.qty),
            0,
        );

    // Gunakan props untuk platform fee
    const platformFee = propPlatformFee;
    const platformItemsCount = propPlatformItemsCount;
    const platformItemsTotalAmount = propPlatformItemsTotalAmount;
    const netRevenue = propNetRevenue || total - platformFee;

    const paid = parseFloat(amountPaid) || 0;
    const change = paid - total;
    const cashValid = paid >= total;

    const canSubmit =
        cartItems.length > 0 &&
        (() => {
            if (isOnlineChannel) return onlineConfirmed;
            if (method === "qris") return qrisConfirmed;
            return cashValid;
        })();

    const hasCustomerData = customerName.trim() || customerPhone.trim();

    useEffect(() => {
        if (open) {
            const cfg = CHANNEL_CONFIG[orderChannel] ?? CHANNEL_CONFIG.dine_in;
            setMethod(cfg.defaultMethod);
            setAmountPaid("");
            setQrisConfirmed(false);
            setOnlineConfirmed(false);
            setProcessing(false);
            setError(null);
            setCustomerOpen(false);
            setCustomerName("");
            setCustomerPhone("");
            setUseCustomDate(false);
            setTransactionDate(new Date());
        }
    }, [open, orderChannel]);

    const handleSubmit = () => {
        setProcessing(true);
        setError(null);

        const subtotal =
            subtotalAfterItemDiscount ||
            cartItems.reduce(
                (sum, item) =>
                    sum +
                    (item.subtotal ||
                        (item.unit_price - (item.discount || 0)) * item.qty),
                0,
            );

        let formattedDate = null;
        if (useCustomDate && transactionDate) {
            formattedDate = formatDateForBackend(transactionDate);
        }

        const payload = {
            payment_method: method,
            order_channel: orderChannel,
            amount_paid: method === "cash" ? paid : total,
            change_amount: method === "cash" ? Math.max(change, 0) : 0,
            subtotal,
            discount: globalDiscount,
            platform_fee: platformFee,
            total,
            notes: null,
            transacted_at: formattedDate,
            customer_name: customerName.trim() || null,
            customer_phone: customerPhone.trim() || null,
            items: cartItems.map((item) => ({
                product_id: item.product_id || null,
                name: item.name,
                unit_price: parseFloat(item.unit_price),
                capital_price: parseFloat(item.capital_price || 0),
                original_price: item.base_unit_price || item.unit_price,
                qty: parseInt(item.qty),
                discount: parseFloat(item.discount || 0),
                subtotal: parseFloat(
                    item.subtotal ||
                        (item.unit_price - (item.discount || 0)) * item.qty,
                ),
                is_custom: item.is_custom || false,
                is_using_platform_price: item.is_using_platform_price || false,
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
                        const v = Object.values(errors.errors).flat();
                        if (v.length > 0) errorMessage = v.join(", ");
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

    const handleDateSelect = (date) => {
        if (date) {
            setTransactionDate(date);
            setUseCustomDate(true);
            setDatePickerOpen(false);
        }
    };

    const handleUseCurrentDate = () => {
        setUseCustomDate(false);
        setTransactionDate(new Date());
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100vw-1rem)] max-w-md rounded-xl sm:rounded-lg max-h-[90dvh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <DialogTitle className="text-base sm:text-lg">
                            Pembayaran
                        </DialogTitle>
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-xs",
                                isOnlineChannel
                                    ? ONLINE_CHANNEL_STYLE[orderChannel]
                                    : "border-slate-200 text-slate-600",
                            )}
                        >
                            {channelConfig.label}
                        </Badge>
                    </div>
                    <DialogDescription className="text-xs sm:text-sm">
                        {isOnlineChannel
                            ? channelConfig.description
                            : "Masukkan detail pembayaran untuk menyelesaikan transaksi"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 sm:space-y-5">
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

                    <div
                        className={cn(
                            "rounded-lg px-4 py-3 text-center",
                            isOnlineChannel
                                ? "bg-orange-50 border border-orange-200"
                                : "bg-muted/50",
                        )}
                    >
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                            Total Pembayaran
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold tabular-nums text-primary">
                            {formatPrice(total)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {cartItems.reduce((s, i) => s + i.qty, 0)} item
                        </p>
                    </div>

                    {isOnlineChannel && platformFee > 0 && (
                        <div className="rounded-xl border-2 border-dashed border-muted-foreground/20 px-4 py-4">
                            <div className="w-full space-y-1">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium">
                                        Rincian Biaya Platform
                                    </p>
                                </div>
                                <div className="flex justify-between text-sm gap-4">
                                    <span className="text-muted-foreground">
                                        Harga ke pelanggan
                                    </span>
                                    <span className="font-medium">
                                        {formatPrice(total)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm gap-4 text-red-500">
                                    <span className="flex items-center gap-1">
                                        <Info className="h-3 w-3" />
                                        Fee Platform (
                                        {Math.round(feeRate * 100)}%)
                                    </span>
                                    <span>− {formatPrice(platformFee)}</span>
                                </div>
                                {platformItemsCount > 0 && (
                                    <div className="text-[10px] text-gray-400 text-right">
                                        *Dari {platformItemsCount} item dengan
                                        total{" "}
                                        {formatPrice(platformItemsTotalAmount)}
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between text-sm gap-4 font-bold text-emerald-600">
                                    <span>Pendapatan Bersih</span>
                                    <span>{formatPrice(netRevenue)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Tanggal Transaksi
                        </label>
                        <div className="flex gap-2 mb-2">
                            <button
                                onClick={handleUseCurrentDate}
                                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                                    !useCustomDate
                                        ? "bg-emerald-600 text-white border-emerald-600"
                                        : "border-gray-200 text-gray-600 hover:border-emerald-300 hover:bg-emerald-50"
                                }`}
                            >
                                Hari Ini
                            </button>
                            <Popover
                                open={datePickerOpen}
                                onOpenChange={setDatePickerOpen}
                            >
                                <PopoverTrigger asChild>
                                    <button
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all",
                                            useCustomDate
                                                ? "bg-emerald-600 text-white border-emerald-600"
                                                : "border-gray-200 text-gray-600 hover:border-emerald-300 hover:bg-emerald-50",
                                        )}
                                    >
                                        <CalendarIcon className="h-3.5 w-3.5" />
                                        <span>
                                            {useCustomDate
                                                ? formatShortDate(
                                                      transactionDate,
                                                  )
                                                : "Pilih Tanggal"}
                                        </span>
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="center"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={transactionDate}
                                        onSelect={handleDateSelect}
                                        disabled={isDateDisabled}
                                        locale={id}
                                        initialFocus
                                        fromYear={2020}
                                        toYear={new Date().getFullYear()}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <p className="text-[10px] text-gray-400">
                            *Bisa memilih tanggal berapa saja, termasuk bulan
                            lalu
                        </p>
                        {useCustomDate && transactionDate && (
                            <p className="text-[10px] text-emerald-600 mt-1">
                                ✓ Transaksi akan dicatat pada tanggal{" "}
                                {formatShortDate(transactionDate)}
                            </p>
                        )}
                    </div>

                    <Collapsible
                        open={customerOpen}
                        onOpenChange={setCustomerOpen}
                    >
                        <CollapsibleTrigger className="w-full">
                            <div className="flex items-center justify-between rounded-lg border px-3 py-2.5 hover:bg-muted/40 transition-colors">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">
                                        Data Pelanggan
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        (opsional)
                                    </span>
                                    {hasCustomerData && !customerOpen && (
                                        <span className="flex h-2 w-2 rounded-full bg-primary" />
                                    )}
                                </div>
                                <ChevronDown
                                    className={cn(
                                        "h-4 w-4 text-muted-foreground transition-transform duration-200",
                                        customerOpen && "rotate-180",
                                    )}
                                />
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="rounded-b-lg border border-t-0 px-3 pb-3 pt-3 space-y-3 bg-muted/20">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs flex items-center gap-1 text-muted-foreground">
                                            <User className="h-3 w-3" />
                                            Nama
                                        </Label>
                                        <Input
                                            value={customerName}
                                            onChange={(e) =>
                                                setCustomerName(e.target.value)
                                            }
                                            placeholder="Nama pelanggan"
                                            className="h-8 text-sm"
                                            maxLength={100}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs flex items-center gap-1 text-muted-foreground">
                                            <Phone className="h-3 w-3" />
                                            No. HP
                                        </Label>
                                        <Input
                                            value={customerPhone}
                                            onChange={(e) =>
                                                setCustomerPhone(e.target.value)
                                            }
                                            placeholder="08xx..."
                                            className="h-8 text-sm"
                                            inputMode="tel"
                                            maxLength={20}
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Pelanggan otomatis mendapat nomor urut. Jika
                                    no. HP diisi, pembelian berikutnya dikenali
                                    sebagai pelanggan yang sama.
                                </p>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>

                    <Separator />

                    {!isOnlineChannel && (
                        <>
                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                {channelConfig.methods.map((m) => {
                                    const { label, icon: Icon } =
                                        METHOD_CONFIG[m];
                                    return (
                                        <button
                                            key={m}
                                            onClick={() => setMethod(m)}
                                            className={cn(
                                                "flex flex-col items-center gap-1.5 sm:gap-2 rounded-xl border-2 py-3 sm:py-4 transition-all",
                                                method === m
                                                    ? "border-primary bg-primary/5 text-primary"
                                                    : "border-border bg-background text-muted-foreground hover:border-muted-foreground/40",
                                            )}
                                        >
                                            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                                            <span className="text-xs sm:text-sm font-semibold">
                                                {label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <Separator />
                        </>
                    )}

                    {!isOnlineChannel && method === "cash" && (
                        <div className="space-y-3 sm:space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs sm:text-sm">
                                    Uang Diterima
                                </Label>
                                <Input
                                    type="number"
                                    min={0}
                                    step={1000}
                                    placeholder="0"
                                    value={amountPaid}
                                    onChange={(e) =>
                                        setAmountPaid(e.target.value)
                                    }
                                    className="text-base sm:text-lg font-semibold tabular-nums h-10 sm:h-11"
                                    autoFocus
                                />
                            </div>

                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
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
                                                setAmountPaid(String(amount))
                                            }
                                            className="rounded-lg border px-2.5 sm:px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                                        >
                                            {formatPrice(amount)}
                                        </button>
                                    ))}
                                <button
                                    onClick={() => setAmountPaid(String(total))}
                                    className="rounded-lg border border-primary/40 bg-primary/5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
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

                    {!isOnlineChannel && method === "qris" && (
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/30 py-5 sm:py-6 px-4">
                                <QrCode className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50" />
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
                                        "h-5 w-5 shrink-0",
                                        qrisConfirmed
                                            ? "text-emerald-500"
                                            : "text-muted-foreground/30",
                                    )}
                                />
                                <span className="text-sm font-medium text-left">
                                    Saya konfirmasi pembayaran sudah diterima
                                </span>
                            </button>
                        </div>
                    )}

                    {isOnlineChannel && (
                        <button
                            onClick={() => setOnlineConfirmed((v) => !v)}
                            className={cn(
                                "flex w-full items-center gap-3 rounded-lg border-2 px-4 py-3 transition-all",
                                onlineConfirmed
                                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                    : "border-border bg-background text-muted-foreground hover:border-muted-foreground/40",
                            )}
                        >
                            <CheckCircle2
                                className={cn(
                                    "h-5 w-5 shrink-0",
                                    onlineConfirmed
                                        ? "text-emerald-500"
                                        : "text-muted-foreground/30",
                                )}
                            />
                            <span className="text-sm font-medium text-left">
                                Pesanan sudah diproses melalui{" "}
                                {channelConfig.label}
                            </span>
                        </button>
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
