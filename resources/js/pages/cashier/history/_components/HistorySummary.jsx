// resources/js/pages/cashier/history/_components/HistorySummary.jsx
import {
    TrendingUp,
    Receipt,
    Banknote,
    QrCode,
    Users,
    Wallet,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

export default function HistorySummary({ summary }) {
    const totalRevenue = summary.total_revenue || 0;
    const totalCount = summary.total_count || 0;
    const uniqueCustomers = summary.unique_customer_count || 0;

    const stats = [
        {
            label: "Total Pendapatan",
            value: formatCurrency(totalRevenue),
            icon: TrendingUp,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-200",
        },
        {
            label: "Total Transaksi",
            value: totalCount,
            icon: Receipt,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-200",
        },
        {
            label: "Pelanggan Unik",
            value: uniqueCustomers,
            icon: Users,
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-200",
        },
    ];

    const paymentMethods = [
        {
            key: "cash_count",
            label: "Tunai",
            icon: Banknote,
            count: summary.cash_count || 0,
            color: "text-slate-600",
            bg: "bg-slate-50",
            border: "border-slate-200",
        },
        {
            key: "qris_count",
            label: "QRIS",
            icon: QrCode,
            count: summary.qris_count || 0,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            border: "border-indigo-200",
        },
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className={`bg-white rounded-2xl p-5 shadow-sm border ${stat.border} hover:shadow-md transition-shadow`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div
                                    className={`w-11 h-11 rounded-2xl ${stat.bg} flex items-center justify-center`}
                                >
                                    <Icon size={20} className={stat.color} />
                                </div>
                            </div>
                            <p className="text-2xl font-black text-slate-800">
                                {stat.value}
                            </p>
                            <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">
                                {stat.label}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-violet-50 rounded-xl">
                        <Wallet size={16} className="text-violet-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-700">
                            Metode Pembayaran
                        </p>
                        <p className="text-xs text-slate-400">
                            Distribusi transaksi
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {paymentMethods.map((m) => {
                        const Icon = m.icon;
                        const isActive = m.count > 0;
                        const total = paymentMethods.reduce(
                            (sum, pm) => sum + pm.count,
                            0,
                        );
                        const percentage =
                            total > 0
                                ? ((m.count / total) * 100).toFixed(0)
                                : 0;

                        return (
                            <div
                                key={m.key}
                                className={`p-4 rounded-xl transition-all ${isActive ? "hover:shadow-sm" : "opacity-50"} ${m.bg} border ${m.border}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Icon size={16} className={m.color} />
                                        <span className="text-sm font-semibold text-slate-700">
                                            {m.label}
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-800">
                                        {m.count}
                                    </span>
                                </div>
                                <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                                            m.key === "cash_count"
                                                ? "from-emerald-400 to-emerald-600"
                                                : "from-indigo-400 to-indigo-600"
                                        }`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-1.5">
                                    {percentage}% dari total
                                </p>
                            </div>
                        );
                    })}
                </div>

                {paymentMethods.every((m) => m.count === 0) && (
                    <div className="text-center py-4">
                        <p className="text-sm text-slate-400">
                            Belum ada transaksi
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
    