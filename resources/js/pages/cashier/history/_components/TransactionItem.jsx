// resources/js/pages/cashier/history/_components/TransactionItem.jsx
import {
    Banknote,
    QrCode,
    ChevronDown,
    ChevronUp,
    User,
    Package,
    Tag,
    Clock,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/formatters";

const PAYMENT_CONFIG = {
    cash: {
        label: "TUNAI",
        icon: Banknote,
        iconColor: "text-emerald-600",
        iconBg: "bg-emerald-50",
        badgeColor: "bg-emerald-100 text-emerald-700",
        borderColor: "border-emerald-200",
    },
    qris: {
        label: "QRIS",
        icon: QrCode,
        iconColor: "text-indigo-600",
        iconBg: "bg-indigo-50",
        badgeColor: "bg-indigo-100 text-indigo-700",
        borderColor: "border-indigo-200",
    },
};

const getVariantLabel = (item) => {
    if (!item.variant_details || !Array.isArray(item.variant_details)) {
        return null;
    }
    try {
        return item.variant_details
            .flatMap((g) => g.options?.map((o) => o.option_name) || [])
            .join(", ");
    } catch {
        return null;
    }
};

export default function TransactionItem({ transaction, isOpen, onToggle }) {
    if (!transaction) return null;

    const trx = transaction;
    const config = PAYMENT_CONFIG[trx.payment_method] || PAYMENT_CONFIG.cash;
    const Icon = config.icon;
    const hasCustomer =
        trx.customer_name || trx.customer_phone || trx.customer_number;

    let customerDisplay = "";
    if (trx.customer_number) {
        customerDisplay = `#${trx.customer_number}`;
    } else if (trx.customer_name) {
        customerDisplay = trx.customer_name;
    }

    const totalItems =
        trx.items?.reduce((sum, item) => sum + (item.qty || 0), 0) || 0;

    return (
        <div
            className={`bg-white rounded-2xl border ${isOpen ? config.borderColor : "border-slate-200"} overflow-hidden shadow-sm hover:shadow-md transition-all`}
        >
            <button onClick={onToggle} className="w-full text-left p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div
                            className={`w-12 h-12 rounded-2xl ${config.iconBg} flex items-center justify-center shrink-0`}
                        >
                            <Icon size={20} className={config.iconColor} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <p className="text-sm font-bold text-slate-800">
                                    {trx.transaction_number || `TRX-${trx.id}`}
                                </p>
                                <span
                                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${config.badgeColor}`}
                                >
                                    {config.label}
                                </span>
                                {hasCustomer && (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 shrink-0 flex items-center gap-1">
                                        <User className="h-2.5 w-2.5" />
                                        {trx.customer_number
                                            ? `#${trx.customer_number}`
                                            : customerDisplay}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDateTime(trx.transacted_at)}
                                </span>
                                <span>•</span>
                                <span>{totalItems} item</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1.5 truncate flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                {trx.items &&
                                    trx.items
                                        .slice(0, 2)
                                        .map((i) => {
                                            const variantLabel =
                                                getVariantLabel(i);
                                            return `${i.name}${variantLabel ? ` (${variantLabel})` : ""} ×${i.qty}`;
                                        })
                                        .join(", ")}
                                {trx.items &&
                                    trx.items.length > 2 &&
                                    ` +${trx.items.length - 2} lainnya`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                            <p className="text-lg font-black text-slate-900">
                                {formatCurrency(trx.total)}
                            </p>
                            {trx.discount > 0 && (
                                <p className="text-[10px] text-rose-500 font-medium">
                                    -{formatCurrency(trx.discount)}
                                </p>
                            )}
                        </div>
                        <div
                            className={`p-1.5 rounded-lg transition-all ${isOpen ? "bg-slate-100" : "bg-slate-50"}`}
                        >
                            {isOpen ? (
                                <ChevronUp
                                    size={18}
                                    className="text-slate-500"
                                />
                            ) : (
                                <ChevronDown
                                    size={18}
                                    className="text-slate-400"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </button>

            {isOpen && (
                <div className="px-4 sm:px-5 pb-5 border-t border-slate-100">
                    {hasCustomer && (
                        <div className="pt-4 pb-3 border-b border-slate-100 mb-3">
                            <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                                <p className="text-xs font-semibold text-purple-700 mb-3 flex items-center gap-2">
                                    <User className="h-3 w-3" />
                                    DATA PELANGGAN
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                                    {trx.customer_number && (
                                        <div className="bg-white/60 rounded-xl px-3 py-2">
                                            <span className="text-purple-500 text-xs block">
                                                No. Pelanggan
                                            </span>
                                            <span className="font-mono font-semibold text-purple-700">
                                                #{trx.customer_number}
                                            </span>
                                        </div>
                                    )}
                                    {trx.customer_name && (
                                        <div className="bg-white/60 rounded-xl px-3 py-2">
                                            <span className="text-purple-500 text-xs block">
                                                Nama
                                            </span>
                                            <span className="font-medium text-purple-800">
                                                {trx.customer_name}
                                            </span>
                                        </div>
                                    )}
                                    {trx.customer_phone && (
                                        <div className="bg-white/60 rounded-xl px-3 py-2">
                                            <span className="text-purple-500 text-xs block">
                                                No. HP
                                            </span>
                                            <span className="font-medium text-purple-800">
                                                {trx.customer_phone}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        {trx.items.map((item) => {
                            const variantLabel = getVariantLabel(item);
                            return (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl hover:bg-slate-100/50 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            {item.name}
                                            {variantLabel && (
                                                <span className="text-[10px] text-orange-600 font-normal bg-orange-50 px-1.5 py-0.5 rounded">
                                                    {variantLabel}
                                                </span>
                                            )}
                                            {item.is_custom && (
                                                <span className="text-[9px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">
                                                    Custom
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {item.qty} ×{" "}
                                            {formatCurrency(item.unit_price)}
                                            {item.discount > 0 && (
                                                <span className="text-rose-500 ml-1">
                                                    -
                                                    {formatCurrency(
                                                        item.discount,
                                                    )}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 shrink-0 ml-4">
                                        {formatCurrency(item.subtotal)}
                                    </p>
                                </div>
                            );
                        })}

                        <div className="bg-slate-50 rounded-2xl p-4 mt-4 border border-slate-200">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">
                                        Subtotal
                                    </span>
                                    <span className="font-medium text-slate-700">
                                        {formatCurrency(
                                            trx.subtotal || trx.total,
                                        )}
                                    </span>
                                </div>
                                {parseFloat(trx.discount || 0) > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-rose-500 flex items-center gap-1">
                                            <Tag className="h-3 w-3" />
                                            Diskon
                                        </span>
                                        <span className="font-medium text-rose-600">
                                            − {formatCurrency(trx.discount)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                                    <span className="font-black text-slate-800">
                                        Total
                                    </span>
                                    <span className="font-black text-2xl text-orange-600">
                                        {formatCurrency(trx.total)}
                                    </span>
                                </div>
                            </div>

                            {trx.payment_method === "cash" && (
                                <div className="mt-3 bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-emerald-600">
                                            Dibayar
                                        </span>
                                        <span className="font-medium text-emerald-700">
                                            {formatCurrency(
                                                trx.amount_paid || trx.total,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm mt-1 pt-1 border-t border-emerald-200/50">
                                        <span className="text-emerald-600 font-semibold">
                                            Kembalian
                                        </span>
                                        <span className="font-bold text-emerald-700">
                                            {formatCurrency(
                                                trx.change_amount || 0,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
