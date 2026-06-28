// resources/js/pages/cashier/dashboard/_components/RecentTransactions.jsx
import { ShoppingBag, Receipt, Banknote, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmt, PERIODS } from "@/lib/cashier/dashboard";

const PAYMENT_LABEL = {
    cash: "Tunai",
    qris: "QRIS",
};

const PAYMENT_ICON = {
    cash: Banknote,
    qris: QrCode,
};

export default function RecentTransactions({
    transactions,
    period,
    onPeriodChange,
}) {
    const periodLabel =
        PERIODS.find((p) => p.key === period)?.label ?? "Hari Ini";

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
            <div className="flex items-start justify-between gap-2 mb-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Transaksi
                    </p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                        {periodLabel}
                    </p>
                </div>
                <Receipt className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            </div>

            <div className="flex gap-1.5 mb-4 p-1 bg-slate-50 rounded-xl">
                {PERIODS.map((p) => (
                    <button
                        key={p.key}
                        onClick={() => onPeriodChange(p.key)}
                        className={cn(
                            "flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all duration-150",
                            period === p.key
                                ? "bg-white text-emerald-700 shadow-sm"
                                : "text-slate-400 hover:text-slate-600",
                        )}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {!transactions?.data?.length && !transactions?.length ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <ShoppingBag className="w-7 h-7 text-slate-300" />
                    </div>
                    <p className="text-sm font-semibold text-slate-400">
                        Belum ada transaksi
                    </p>
                    <p className="text-xs text-slate-400 text-center px-4 max-w-xs">
                        Transaksi yang selesai akan muncul di sini
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto -mx-1 px-1">
                    {(transactions?.data ?? transactions).map((trx) => {
                        const PaymentIcon =
                            PAYMENT_ICON[trx.payment_method] || Banknote;
                        const paymentMethodLabel =
                            PAYMENT_LABEL[trx.payment_method] ??
                            trx.payment_method;

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
                                className="flex items-center gap-3 py-3 hover:bg-slate-50/50 rounded-lg transition-colors duration-150"
                            >
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                                    <PaymentIcon className="w-4 h-4 text-emerald-600" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-sm font-semibold text-slate-800 truncate">
                                            #{trx.id}
                                        </p>
                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                            {paymentMethodLabel}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 truncate">
                                        {time}
                                    </p>
                                </div>

                                <div className="text-right shrink-0">
                                    <p className="text-sm font-bold text-slate-800">
                                        {fmt(trx.total)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
