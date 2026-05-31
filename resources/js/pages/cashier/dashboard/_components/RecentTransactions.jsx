import { ShoppingBag, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    fmt,
    paymentIcon,
    paymentLabel,
    PERIODS,
} from "../../../../lib/cashier/dashboard";

export default function RecentTransactions({
    transactions,
    period,
    onPeriodChange,
}) {
    const periodLabel =
        PERIODS.find((p) => p.key === period)?.label ?? "Hari Ini";

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2 mb-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                        Transaksi
                    </p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                        {periodLabel}
                    </p>
                </div>
                <Receipt className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            </div>

            <div className="flex gap-1 sm:gap-1.5 mb-4 p-1 bg-slate-50 rounded-xl">
                {PERIODS.map((p) => (
                    <button
                        key={p.key}
                        onClick={() => onPeriodChange(p.key)}
                        className={cn(
                            "flex-1 text-[10px] sm:text-xs font-semibold py-1.5 rounded-lg transition-all duration-150",
                            period === p.key
                                ? "bg-white text-emerald-700 shadow-sm"
                                : "text-gray-400 hover:text-gray-600",
                        )}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {!transactions?.length ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <ShoppingBag className="w-8 h-8 text-gray-200" />
                    <p className="text-sm text-gray-400">Belum ada transaksi</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto -mx-1 px-1">
                    {transactions.map((trx) => {
                        const Icon = paymentIcon(trx.payment_method);
                        const time = new Date(trx.transacted_at).toLocaleString(
                            "id-ID",
                            {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                            },
                        );
                        return (
                            <div
                                key={trx.id}
                                className="flex items-center gap-3 py-2.5"
                            >
                                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                    <Icon className="w-4 h-4 text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-gray-800 truncate">
                                        #{trx.id}
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        {paymentLabel(trx.payment_method)} ·{" "}
                                        {time}
                                    </p>
                                </div>
                                <p className="text-xs sm:text-sm font-bold text-gray-800 shrink-0">
                                    {fmt(trx.total)}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
