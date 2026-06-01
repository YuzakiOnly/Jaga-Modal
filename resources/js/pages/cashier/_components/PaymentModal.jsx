import { useState, useEffect, useRef } from "react";
import {
    X,
    Banknote,
    QrCode,
    AlertCircle,
    Calendar as CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const formatRupiah = (num) => {
    return "Rp " + Math.round(num).toLocaleString("id-ID");
};

const QUICK_AMOUNTS = [20000, 50000, 100000, 200000, 500000];

export default function PaymentModal({
    subtotal,
    discount,
    total,
    paymentMethod,
    isProcessing,
    onConfirm,
    onClose,
}) {
    const [amountPaid, setAmountPaid] = useState(
        paymentMethod === "qris" ? total : "",
    );
    const [transactionDate, setTransactionDate] = useState(new Date());
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [useCustomDate, setUseCustomDate] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (paymentMethod === "cash" && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 100);
        }
    }, [paymentMethod]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    const paidAmount = parseFloat(amountPaid) || 0;
    const changeAmount = Math.max(0, paidAmount - total);
    const isInsufficient =
        paymentMethod === "cash" && paidAmount > 0 && paidAmount < total;
    const canConfirm =
        paymentMethod === "qris" || (paidAmount >= total && !isProcessing);

    const formatDateForBackend = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const handleConfirmClick = () => {
        if (!canConfirm) return;
        const finalAmount = paymentMethod === "qris" ? total : paidAmount;

        let formattedDate = null;
        if (useCustomDate && transactionDate) {
            const selectedDate = new Date(transactionDate);
            const now = new Date();
            if (selectedDate <= now) {
                formattedDate = formatDateForBackend(selectedDate);
            }
        }

        onConfirm(finalAmount, formattedDate);
    };

    const handleExactAmount = () => {
        setAmountPaid(total);
    };

    const formatShortDate = (date) => {
        return format(date, "dd/MM/yy", { locale: id });
    };

    const isDateDisabled = (date) => {
        return date > new Date();
    };

    const handleDateSelect = (date) => {
        if (date && date <= new Date()) {
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
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl w-112.5 max-w-[90vw] shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div
                            className={`p-2 rounded-xl ${
                                paymentMethod === "cash"
                                    ? "bg-emerald-100"
                                    : "bg-purple-100"
                            }`}
                        >
                            {paymentMethod === "cash" ? (
                                <Banknote className="h-5 w-5 text-emerald-600" />
                            ) : (
                                <QrCode className="h-5 w-5 text-purple-600" />
                            )}
                        </div>
                        <h3 className="font-semibold text-gray-800">
                            Konfirmasi Pembayaran
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-5 max-h-[80vh] overflow-y-auto">
                    <div className="bg-gray-50 rounded-xl p-4 mb-5">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium text-gray-800">
                                {formatRupiah(subtotal)}
                            </span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Diskon</span>
                                <span className="font-medium text-red-500">
                                    - {formatRupiah(discount)}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-3 border-t border-gray-200 mt-2">
                            <span className="font-bold text-gray-800">
                                Total
                            </span>
                            <span className="text-xl font-bold text-emerald-600">
                                {formatRupiah(total)}
                            </span>
                        </div>
                    </div>

                    <div className="mb-4">
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
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <p className="text-[10px] text-gray-400">
                            *Biarkan "Hari Ini" untuk transaksi saat ini
                        </p>
                    </div>

                    {paymentMethod === "cash" && (
                        <>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                Jumlah Dibayar
                            </label>
                            <div className="relative mb-3">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                                    Rp
                                </span>
                                <input
                                    ref={inputRef}
                                    type="number"
                                    value={amountPaid}
                                    onChange={(e) =>
                                        setAmountPaid(e.target.value)
                                    }
                                    placeholder="0"
                                    className={`w-full pl-10 pr-4 py-2.5 text-right text-lg font-bold border-2 rounded-lg outline-none transition-all ${
                                        isInsufficient
                                            ? "border-red-400 text-red-600"
                                            : paidAmount >= total &&
                                                paidAmount > 0
                                              ? "border-emerald-500 text-emerald-700"
                                              : "border-gray-200 focus:border-emerald-400"
                                    }`}
                                />
                            </div>

                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {QUICK_AMOUNTS.map((amount) => (
                                    <button
                                        key={amount}
                                        onClick={() => setAmountPaid(amount)}
                                        className={`py-1.5 px-3 text-xs font-medium rounded-lg border transition-all ${
                                            paidAmount === amount
                                                ? "bg-emerald-600 text-white border-emerald-600"
                                                : "border-gray-200 text-gray-600 hover:border-emerald-300 hover:bg-emerald-50"
                                        }`}
                                    >
                                        {amount >= 1000
                                            ? `${amount / 1000}rb`
                                            : amount}
                                    </button>
                                ))}
                                <button
                                    onClick={handleExactAmount}
                                    className="py-1.5 px-3 text-xs font-medium rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all"
                                >
                                    Uang Pas
                                </button>
                            </div>

                            {paidAmount > 0 && (
                                <div
                                    className={`rounded-lg p-2.5 mb-3 ${
                                        isInsufficient
                                            ? "bg-red-50 border border-red-100"
                                            : "bg-emerald-50 border border-emerald-100"
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            {isInsufficient && (
                                                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                                            )}
                                            <span
                                                className={`text-xs font-semibold ${
                                                    isInsufficient
                                                        ? "text-red-600"
                                                        : "text-emerald-700"
                                                }`}
                                            >
                                                {isInsufficient
                                                    ? "Kekurangan"
                                                    : "Kembalian"}
                                            </span>
                                        </div>
                                        <span
                                            className={`text-lg font-bold ${
                                                isInsufficient
                                                    ? "text-red-600"
                                                    : "text-emerald-700"
                                            }`}
                                        >
                                            {isInsufficient
                                                ? formatRupiah(
                                                      total - paidAmount,
                                                  )
                                                : formatRupiah(changeAmount)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {paymentMethod === "qris" && (
                        <div className="text-center py-3 mb-3">
                            <div className="bg-gray-100 rounded-xl p-3 inline-block mb-3">
                                <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center border-2 border-gray-200">
                                    <QrCode className="h-20 w-20 text-gray-400" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-600">
                                Scan QR Code dengan aplikasi payment
                            </p>
                            <p className="text-xl font-bold text-emerald-700 mt-1">
                                {formatRupiah(total)}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1">
                                QRIS - Semua pembayaran digital
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={onClose}
                            disabled={isProcessing}
                            className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleConfirmClick}
                            disabled={!canConfirm}
                            className="flex-1 py-2.5 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isProcessing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Memproses...
                                </span>
                            ) : (
                                "Konfirmasi Bayar"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
