import {
    Banknote,
    QrCode,
    Bike,
    ShoppingCart,
    Zap,
    ChevronDown,
    ChevronUp,
    User,
    Phone,
    Hash,
    TrendingDown,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/formatters";

const CHANNEL_CONFIG = {
    cash: {
        label: "CASH",
        icon: Banknote,
        iconColor: "text-emerald-600",
        iconBg: "bg-emerald-50",
        badgeColor: "bg-emerald-100 text-emerald-700",
    },
    qris: {
        label: "QRIS",
        icon: QrCode,
        iconColor: "text-indigo-600",
        iconBg: "bg-indigo-50",
        badgeColor: "bg-indigo-100 text-indigo-700",
    },
    grabfood: {
        label: "GrabFood",
        icon: Bike,
        iconColor: "text-green-600",
        iconBg: "bg-green-50",
        badgeColor: "bg-green-100 text-green-700",
    },
    shopeefood: {
        label: "ShopeeFood",
        icon: ShoppingCart,
        iconColor: "text-orange-600",
        iconBg: "bg-orange-50",
        badgeColor: "bg-orange-100 text-orange-700",
    },
    gobiz: {
        label: "GoBiz",
        icon: Zap,
        iconColor: "text-sky-600",
        iconBg: "bg-sky-50",
        badgeColor: "bg-sky-100 text-sky-700",
    },
};

export default function TransactionItem({ transaction, isOpen, onToggle }) {
    if (!transaction) return null;

    const trx = transaction;
    const config = CHANNEL_CONFIG[trx.payment_method] || CHANNEL_CONFIG.cash;
    const Icon = config.icon;
    const isOnline = trx.order_channel && trx.order_channel !== "dine_in";
    const hasCustomer =
        trx.customer_name || trx.customer_phone || trx.customer_number;

    const platformFee = parseFloat(trx.platform_fee || 0);
    const netRevenue = trx.total - platformFee;

    let customerDisplay = "";
    if (trx.customer_number) {
        customerDisplay = `Pelanggan ${trx.customer_number}`;
    } else if (trx.customer_name) {
        customerDisplay = trx.customer_name;
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-slate-300 transition-colors">
            <button onClick={onToggle} className="w-full text-left p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.iconBg}`}
                        >
                            <Icon size={18} className={config.iconColor} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                <p className="text-sm font-bold text-slate-800">
                                    {trx.transaction_number || `TRX-${trx.id}`}
                                </p>
                                <span
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${config.badgeColor}`}
                                >
                                    {config.label}
                                </span>
                                {isOnline && (
                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0">
                                        {trx.order_channel}
                                    </span>
                                )}
                                {hasCustomer && (
                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600 shrink-0 flex items-center gap-0.5">
                                        <User className="h-2 w-2" />
                                        {trx.customer_number
                                            ? `#${trx.customer_number}`
                                            : "Pelanggan"}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-400">
                                {formatDateTime(trx.transacted_at)}
                            </p>
                            {hasCustomer && (
                                <p className="text-xs text-purple-600 mt-1 truncate flex items-center gap-1 flex-wrap">
                                    <Hash className="h-3 w-3" />
                                    <span className="font-medium">
                                        {customerDisplay}
                                    </span>
                                    {trx.customer_phone && (
                                        <span className="text-slate-400 text-[10px] flex items-center gap-0.5 ml-1">
                                            <Phone className="h-2 w-2" />
                                            {trx.customer_phone}
                                        </span>
                                    )}
                                </p>
                            )}
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
                        <div className="text-right">
                            <p className="text-base font-black text-slate-900">
                                {formatCurrency(trx.total)}
                            </p>
                            {platformFee > 0 && (
                                <p className="text-[10px] text-emerald-600 font-medium">
                                    Bersih {formatCurrency(netRevenue)}
                                </p>
                            )}
                        </div>
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
                    {hasCustomer && (
                        <div className="pt-4 pb-2 border-b border-slate-100 mb-2">
                            <div className="bg-purple-50 rounded-lg p-3">
                                <p className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    DATA PELANGGAN
                                </p>
                                <div className="space-y-1 text-sm">
                                    {trx.customer_number && (
                                        <div className="flex justify-between">
                                            <span className="text-purple-600">
                                                No. Pelanggan
                                            </span>
                                            <span className="font-mono font-semibold text-purple-700">
                                                #{trx.customer_number}
                                            </span>
                                        </div>
                                    )}
                                    {trx.customer_name && (
                                        <div className="flex justify-between">
                                            <span className="text-purple-600">
                                                Nama
                                            </span>
                                            <span className="font-medium">
                                                {trx.customer_name}
                                            </span>
                                        </div>
                                    )}
                                    {trx.customer_phone && (
                                        <div className="flex justify-between">
                                            <span className="text-purple-600">
                                                No. HP
                                            </span>
                                            <span className="font-medium">
                                                {trx.customer_phone}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-2 space-y-2">
                        {trx.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex justify-between items-center text-sm"
                            >
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-700">
                                        {item.name}
                                        {item.is_custom && (
                                            <span className="text-[10px] bg-purple-100 text-purple-600 ml-1 px-1 rounded">
                                                C
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {item.qty} ×{" "}
                                        {formatCurrency(item.unit_price)}
                                    </p>
                                </div>
                                <p className="font-bold text-slate-700 shrink-0 ml-4">
                                    {formatCurrency(item.subtotal)}
                                </p>
                            </div>
                        ))}

                        <div className="border-t border-dashed border-slate-200 pt-3 mt-3 space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Subtotal</span>
                                <span className="font-medium text-slate-700">
                                    {formatCurrency(trx.subtotal || trx.total)}
                                </span>
                            </div>
                            {parseFloat(trx.discount || 0) > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-rose-500">
                                        Diskon
                                    </span>
                                    <span className="font-medium text-rose-600">
                                        − {formatCurrency(trx.discount)}
                                    </span>
                                </div>
                            )}
                            {platformFee > 0 && (
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1">
                                        <TrendingDown
                                            size={12}
                                            className="text-red-500"
                                        />
                                        <span className="text-red-500">
                                            Biaya Platform (
                                            {Math.round(
                                                (platformFee / trx.total) * 100,
                                            )}
                                            %)
                                        </span>
                                    </div>
                                    <span className="font-medium text-red-600">
                                        − {formatCurrency(platformFee)}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-1 border-t border-dashed border-slate-200">
                                <span className="font-black text-slate-800">
                                    Total
                                </span>
                                <span className="font-black text-emerald-600 text-lg">
                                    {formatCurrency(trx.total)}
                                </span>
                            </div>
                            {platformFee > 0 && (
                                <div className="flex justify-between items-center bg-emerald-50 rounded-lg p-2 -mx-1">
                                    <span className="text-xs font-semibold text-emerald-700">
                                        Diterima Bersih
                                    </span>
                                    <span className="text-sm font-black text-emerald-700">
                                        {formatCurrency(netRevenue)}
                                    </span>
                                </div>
                            )}
                            {trx.payment_method === "cash" && (
                                <>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">
                                            Dibayar
                                        </span>
                                        <span className="font-medium text-slate-700">
                                            {formatCurrency(
                                                trx.amount_paid || trx.total,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-emerald-600 font-semibold">
                                            Kembalian
                                        </span>
                                        <span className="font-bold text-emerald-700">
                                            {formatCurrency(
                                                trx.change_amount || 0,
                                            )}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
