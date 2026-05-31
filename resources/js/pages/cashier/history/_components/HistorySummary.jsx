import {
    TrendingUp,
    Receipt,
    CreditCard,
    Banknote,
    QrCode,
} from "lucide-react";

export default function HistorySummary({ summary }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2 bg-emerald-600 rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-6 -translate-x-4" />
                <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                            <TrendingUp size={14} className="text-white" />
                        </div>
                        <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">
                            Total Pendapatan
                        </p>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-white">
                        {summary.total_revenue}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-sky-100 flex items-center justify-center">
                        <Receipt size={12} className="text-sky-600" />
                    </div>
                    <p className="text-xs font-semibold text-slate-400">
                        Transaksi
                    </p>
                </div>
                <p className="text-2xl font-black text-slate-800">
                    {summary.total_count}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">total order</p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
                        <CreditCard size={12} className="text-violet-600" />
                    </div>
                    <p className="text-xs font-semibold text-slate-400">
                        Metode
                    </p>
                </div>
                <div className="flex flex-col gap-1.5">
                    <span className="flex items-center justify-between text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1.5 rounded-lg">
                        <span className="flex items-center gap-1.5">
                            <Banknote size={11} className="text-slate-500" />
                            Cash
                        </span>
                        <span className="font-black">{summary.cash_count}</span>
                    </span>
                    <span className="flex items-center justify-between text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1.5 rounded-lg">
                        <span className="flex items-center gap-1.5">
                            <QrCode size={11} />
                            QRIS
                        </span>
                        <span className="font-black">{summary.qris_count}</span>
                    </span>
                </div>
            </div>
        </div>
    );
}
