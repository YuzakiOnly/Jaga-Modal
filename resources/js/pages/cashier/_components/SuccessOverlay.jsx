import { useState, useEffect, useRef } from "react";
import {
    CheckCircle,
    Printer,
    User,
    Phone,
    Calendar,
    Clock,
    Package,
    Banknote,
    QrCode,
} from "lucide-react";

const formatRupiah = (num) => "Rp " + Math.round(num).toLocaleString("id-ID");

const PAYMENT_ICONS = {
    cash: Banknote,
    qris: QrCode,
};

const PAYMENT_LABELS = {
    cash: "TUNAI",
    qris: "QRIS",
};

export default function SuccessOverlay({ transaction, onNewTransaction }) {
    const [show, setShow] = useState(true);
    const [time, setTime] = useState(new Date());
    const printRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setShow(false);
            onNewTransaction();
        }, 8000);
        return () => clearTimeout(timeout);
    }, [onNewTransaction]);

    const handlePrint = () => {
        const printContent = printRef.current.innerHTML;
        const originalTitle = document.title;
        document.title = "Struk Transaksi";
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
            <html>
                <head>
                    <title>Struk Transaksi</title>
                    <style>
                        body {
                            font-family: 'Courier New', monospace;
                            font-size: 12px;
                            width: 280px;
                            margin: 0 auto;
                            padding: 16px;
                        }
                        .header { text-align: center; margin-bottom: 16px; }
                        .divider { border-top: 1px dashed #000; margin: 8px 0; }
                        .items { margin: 8px 0; }
                        .item { display: flex; justify-content: space-between; margin: 4px 0; }
                        .total { font-weight: bold; margin-top: 8px; }
                        .footer { text-align: center; margin-top: 16px; font-size: 10px; }
                    </style>
                </head>
                <body>${printContent}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
        document.title = originalTitle;
    };

    if (!show) return null;

    const PaymentIcon = PAYMENT_ICONS[transaction.paymentMethod] || Banknote;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-emerald-600 p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
                        <CheckCircle className="h-10 w-10 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                        Pembayaran Berhasil!
                    </h2>
                    <p className="text-emerald-100 text-sm mt-1">
                        Transaksi telah selesai
                    </p>
                </div>

                <div ref={printRef} className="p-5">
                    <div className="text-center border-b pb-4">
                        <h3 className="font-bold text-lg">TOKO ANDA</h3>
                        <p className="text-xs text-gray-500">
                            Jl. Contoh No. 123, Kota
                        </p>
                        <p className="text-xs text-gray-500">
                            Telp: 0812-3456-7890
                        </p>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1 my-3">
                        <div className="flex justify-between">
                            <span>No. Transaksi</span>
                            <span className="font-mono font-semibold">
                                {transaction.transaction_number}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tanggal</span>
                            <span>
                                {new Date().toLocaleDateString("id-ID")}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Waktu</span>
                            <span>{time.toLocaleTimeString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Kasir</span>
                            <span>{transaction.cashier_name || "Kasir"}</span>
                        </div>
                    </div>

                    {(transaction.customer_name ||
                        transaction.customer_phone) && (
                        <div className="bg-gray-50 rounded-lg p-3 my-3 border border-gray-100">
                            <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                <User className="h-3 w-3" />
                                DATA PELANGGAN
                            </p>
                            {transaction.customer_name && (
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-500">Nama</span>
                                    <span className="font-medium">
                                        {transaction.customer_name}
                                    </span>
                                </div>
                            )}
                            {transaction.customer_phone && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">
                                        No. HP
                                    </span>
                                    <span className="font-medium">
                                        {transaction.customer_phone}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="divider my-3"></div>

                    <div className="space-y-2">
                        {transaction.items?.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex justify-between text-sm"
                            >
                                <div className="flex-1">
                                    <span className="font-medium">
                                        {item.name}
                                    </span>
                                    {item.is_custom && (
                                        <span className="text-[9px] bg-purple-100 text-purple-600 ml-1 px-1 rounded">
                                            C
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-400 ml-2">
                                        {item.qty} ×{" "}
                                        {formatRupiah(item.unit_price)}
                                    </span>
                                </div>
                                <span className="font-semibold">
                                    {formatRupiah(
                                        (item.unit_price -
                                            (item.discount || 0)) *
                                            item.qty,
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="divider my-3"></div>

                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span>{formatRupiah(transaction.subtotal)}</span>
                        </div>
                        {transaction.discount > 0 && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Diskon</span>
                                <span className="text-red-500">
                                    -{formatRupiah(transaction.discount)}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-dashed">
                            <span className="font-bold">TOTAL</span>
                            <span className="text-xl font-bold text-emerald-600">
                                {formatRupiah(transaction.total)}
                            </span>
                        </div>
                    </div>

                    <div className="divider my-3"></div>

                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">
                                Metode Pembayaran
                            </span>
                            <div className="flex items-center gap-1">
                                <PaymentIcon className="h-3 w-3" />
                                <span className="font-medium">
                                    {PAYMENT_LABELS[
                                        transaction.paymentMethod
                                    ] || "TUNAI"}
                                </span>
                            </div>
                        </div>
                        {transaction.paymentMethod === "cash" && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Dibayar
                                    </span>
                                    <span>
                                        {formatRupiah(transaction.amountPaid)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Kembalian
                                    </span>
                                    <span className="text-emerald-600 font-bold">
                                        {formatRupiah(transaction.change)}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="text-center text-xs text-gray-400 mt-5 pt-3 border-t">
                        <p>Terima kasih atas kunjungan Anda</p>
                        <p className="mt-1">
                            Simpan struk ini sebagai bukti pembayaran
                        </p>
                    </div>
                </div>

                <div className="p-4 border-t flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <Printer className="h-4 w-4" />
                        Cetak Struk
                    </button>
                    <button
                        onClick={() => {
                            setShow(false);
                            onNewTransaction();
                        }}
                        className="flex-1 py-2.5 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
                    >
                        Transaksi Baru
                    </button>
                </div>
            </div>
        </div>
    );
}
