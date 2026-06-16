import {
    TrendingUp,
    Receipt,
    CreditCard,
    Banknote,
    QrCode,
    Users,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

export default function HistorySummary({ summary }) {
    const paymentMethods = [
        {
            key: "cash_count",
            label: "Cash",
            icon: Banknote,
            color: "text-slate-600",
            bg: "bg-slate-50",
            activeBg: "bg-slate-100 border-slate-300",
            filterValue: "cash",
        },
        {
            key: "qris_count",
            label: "QRIS",
            icon: QrCode,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            activeBg: "bg-indigo-100 border-indigo-300",
            filterValue: "qris",
        },
    ].filter((m) => (summary[m.key] || 0) > 0);

    const totalRevenue = summary.total_revenue || 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-emerald-600 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col h-full">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                        <TrendingUp size={14} className="text-white" />
                    </div>
                    <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">
                        Total Pendapatan
                    </p>
                </div>
                <div className="mt-auto">
                    <p className="text-2xl sm:text-3xl font-black text-white wrap-break-word">
                        {formatCurrency(totalRevenue)}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col h-full">
                <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-sky-100 flex items-center justify-center">
                        <Receipt size={12} className="text-sky-600" />
                    </div>
                    <p className="text-xs font-semibold text-slate-400">
                        Transaksi
                    </p>
                </div>
                <div className="mt-auto">
                    <p className="text-2xl font-black text-slate-800">
                        {summary.total_count || 0}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                        total order
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col h-full">
                <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Users size={12} className="text-amber-600" />
                    </div>
                    <p className="text-xs font-semibold text-slate-400">
                        Pelanggan
                    </p>
                </div>
                <div className="mt-auto">
                    <p className="text-2xl font-black text-slate-800">
                        {summary.unique_customer_count || 0}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                        pelanggan unik
                    </p>
                </div>
            </div>

            <div className="md:col-span-3 bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
                        <CreditCard size={12} className="text-violet-600" />
                    </div>
                    <p className="text-xs font-semibold text-slate-400">
                        Metode Pembayaran
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                    {paymentMethods.map((m) => (
                        <div
                            key={m.key}
                            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg ${m.bg} ${m.color}`}
                        >
                            <m.icon size={11} />
                            {m.label}
                            <span className="font-black ml-1">
                                {summary[m.key] || 0}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
