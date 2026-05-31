import { Banknote, QrCode, ChevronDown, ChevronUp } from "lucide-react";

export default function TransactionItem({
    transaction,
    isOpen,
    onToggle,
    fmt,
}) {
    if (!transaction) return null;

    const trx = transaction;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-slate-300 transition-colors">
            <button onClick={onToggle} className="w-full text-left p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                trx.payment_method === "cash"
                                    ? "bg-emerald-50"
                                    : "bg-indigo-50"
                            }`}
                        >
                            {trx.payment_method === "cash" ? (
                                <Banknote
                                    size={18}
                                    className="text-emerald-600"
                                />
                            ) : (
                                <QrCode size={18} className="text-indigo-600" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                <p className="text-sm font-bold text-slate-800">
                                    {trx.transaction_number || `TRX-${trx.id}`}
                                </p>
                                <span
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                                        trx.payment_method === "cash"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-indigo-100 text-indigo-700"
                                    }`}
                                >
                                    {trx.payment_method === "cash"
                                        ? "CASH"
                                        : "QRIS"}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">
                                {trx.transacted_at
                                    ? new Date(
                                          trx.transacted_at,
                                      ).toLocaleString("id-ID", {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                      })
                                    : "-"}
                            </p>
                            <p className="text-xs text-slate-400 mt-1 truncate">
                                {trx.items &&
                                    trx.items
                                        .slice(0, 2)
                                        .map((i) => `${i.name} ×${i.qty}`)
                                        .join(", ")}
                                {trx.items &&
                                    trx.items.length > 2 &&
                                    ` +${trx.items.length - 2} lainnya`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <p className="text-base font-black text-slate-900">
                            {fmt(trx.total)}
                        </p>
                        {isOpen ? (
                            <ChevronUp
                                size={16}
                                className="text-slate-400 shrink-0"
                            />
                        ) : (
                            <ChevronDown
                                size={16}
                                className="text-slate-400 shrink-0"
                            />
                        )}
                    </div>
                </div>
            </button>

            {isOpen && trx.items && (
                <div className="px-4 pb-4 border-t border-slate-100">
                    <div className="pt-4 space-y-2">
                        {trx.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex justify-between items-center text-sm"
                            >
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-700">
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {item.qty} × {fmt(item.unit_price)}
                                    </p>
                                </div>
                                <p className="font-bold text-slate-700 shrink-0 ml-4">
                                    {fmt(item.subtotal)}
                                </p>
                            </div>
                        ))}

                        <div className="border-t border-dashed border-slate-200 pt-3 mt-3 space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Subtotal</span>
                                <span className="font-medium text-slate-700">
                                    {fmt(trx.subtotal || trx.total)}
                                </span>
                            </div>
                            {parseFloat(trx.discount || 0) > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-rose-500">
                                        Diskon
                                    </span>
                                    <span className="font-medium text-rose-600">
                                        − {fmt(trx.discount)}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-1 border-t border-dashed border-slate-200">
                                <span className="font-black text-slate-800">
                                    Total
                                </span>
                                <span className="font-black text-emerald-600 text-lg">
                                    {fmt(trx.total)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Dibayar</span>
                                <span className="font-medium text-slate-700">
                                    {fmt(trx.amount_paid || trx.total)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-emerald-600 font-semibold">
                                    Kembalian
                                </span>
                                <span className="font-bold text-emerald-700">
                                    {fmt(trx.change_amount || 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
