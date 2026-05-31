import { CheckCircle, RotateCcw, Receipt, Printer } from "lucide-react";

const formatRupiah = (num) => {
    return "Rp " + Math.round(num).toLocaleString("id-ID");
};

export default function SuccessOverlay({ transaction, onNewTransaction }) {
    const handlePrint = () => {
        window.print();
        // In real app, you would call a print receipt endpoint
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-100 max-w-[90vw] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="bg-emerald-600 px-6 pt-8 pb-10 text-center relative">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24" />
                    </div>

                    <div className="relative">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white">
                            Transaksi Berhasil!
                        </h3>
                        <p className="text-emerald-100 text-sm mt-1">
                            Pembayaran telah dikonfirmasi
                        </p>
                    </div>
                </div>

                <div className="p-6">
                    <div className="bg-gray-50 rounded-xl p-4 mb-5">
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-dashed border-gray-200">
                            <div className="flex items-center gap-2">
                                <Receipt className="h-4 w-4 text-gray-400" />
                                <span className="text-xs font-semibold text-gray-500 uppercase">
                                    Detail Pembayaran
                                </span>
                            </div>
                            <button
                                onClick={handlePrint}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <Printer className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                    Total
                                </span>
                                <span className="text-base font-bold text-gray-800">
                                    {formatRupiah(transaction.total)}
                                </span>
                            </div>

                            {transaction.amountPaid &&
                                transaction.amountPaid !==
                                    transaction.total && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">
                                            Dibayar
                                        </span>
                                        <span className="text-sm font-semibold text-gray-700">
                                            {formatRupiah(
                                                transaction.amountPaid,
                                            )}
                                        </span>
                                    </div>
                                )}

                            {transaction.change > 0 && (
                                <div className="pt-2 mt-1 border-t border-dashed border-gray-200">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-semibold text-gray-700">
                                            Kembalian
                                        </span>
                                        <span className="text-lg font-bold text-emerald-600">
                                            {formatRupiah(transaction.change)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={onNewTransaction}
                        className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Transaksi Baru
                    </button>
                </div>
            </div>
        </div>
    );
}
