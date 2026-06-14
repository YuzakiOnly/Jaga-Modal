import {
    TrendingUp,
    Receipt,
    CreditCard,
    Banknote,
    QrCode,
    Bike,
    ShoppingCart,
    Zap,
    Users,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

export default function HistorySummary({
    summary,
    channelFilter,
    onChannelFilter,
}) {
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
        {
            key: "grabfood_count",
            label: "GrabFood",
            icon: Bike,
            color: "text-green-600",
            bg: "bg-green-50",
            activeBg: "bg-green-100 border-green-300",
            filterValue: "grabfood",
        },
        {
            key: "shopeefood_count",
            label: "ShopeeFood",
            icon: ShoppingCart,
            color: "text-orange-600",
            bg: "bg-orange-50",
            activeBg: "bg-orange-100 border-orange-300",
            filterValue: "shopeefood",
        },
        {
            key: "gobiz_count",
            label: "GoBiz",
            icon: Zap,
            color: "text-sky-600",
            bg: "bg-sky-50",
            activeBg: "bg-sky-100 border-sky-300",
            filterValue: "gobiz",
        },
    ].filter((m) => (summary[m.key] || 0) > 0);

    const netRevenue = summary.total_net_revenue || 0;
    const totalRevenue = summary.total_revenue || 0;
    const platformFee = summary.total_platform_fee || 0;

    const handleFilterClick = (filterValue) => {
        if (channelFilter === filterValue) {
            onChannelFilter(null);
        } else {
            onChannelFilter(filterValue);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-emerald-600 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col h-full">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                        <TrendingUp size={14} className="text-white" />
                    </div>
                    <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">
                        Omzet Bersih
                    </p>
                </div>
                <div className="mt-auto">
                    <p className="text-2xl sm:text-3xl font-black text-white wrap-break-word">
                        {formatCurrency(netRevenue)}
                    </p>
                    {platformFee > 0 && (
                        <p className="text-xs text-emerald-200 mt-1 wrap-break-word">
                            Omzet kotor {formatCurrency(totalRevenue)} · Biaya
                            platform {formatCurrency(platformFee)}
                        </p>
                    )}
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
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
                            <CreditCard size={12} className="text-violet-600" />
                        </div>
                        <p className="text-xs font-semibold text-slate-400">
                            Metode Pembayaran
                        </p>
                    </div>
                    {channelFilter && (
                        <button
                            onClick={() => onChannelFilter(null)}
                            className="flex items-center gap-1 text-xs font-semibold px-2 py-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
                        >
                            Reset Filter
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                    {paymentMethods.map((m) => (
                        <button
                            key={m.key}
                            onClick={() => handleFilterClick(m.filterValue)}
                            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                channelFilter === m.filterValue
                                    ? `${m.activeBg} border ${m.color} shadow-sm`
                                    : `${m.bg} ${m.color} hover:opacity-80`
                            }`}
                        >
                            <m.icon size={11} />
                            {m.label}
                            <span className="font-black ml-1">
                                {summary[m.key] || 0}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
