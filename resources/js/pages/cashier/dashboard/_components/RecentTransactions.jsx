import {
    ShoppingBag,
    Receipt,
    Banknote,
    QrCode,
    Smartphone,
    Store,
    Coffee,
    Bike,
    CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fmt, PERIODS } from "@/lib/cashier/dashboard";

const CHANNEL_CONFIG = {
    dine_in: {
        label: "Dine In",
        color: "bg-emerald-50",
        iconColor: "text-emerald-600",
        Icon: Store,
    },
    grabfood: {
        label: "GrabFood",
        color: "bg-[#00B14F]/10",
        iconColor: "text-[#00B14F]",
        Icon: Bike,
    },
    shopeefood: {
        label: "ShopeeFood",
        color: "bg-[#EE4D2D]/10",
        iconColor: "text-[#EE4D2D]",
        Icon: Coffee,
    },
    gobiz: {
        label: "GoBiz",
        color: "bg-[#00AA13]/10",
        iconColor: "text-[#00AA13]",
        Icon: Smartphone,
    },
};

const PAYMENT_LABEL = {
    cash: "Tunai",
    qris: "QRIS",
    grabfood: "GrabFood",
    shopeefood: "ShopeeFood",
    gobiz: "GoBiz",
};

function getChannelConfig(orderChannel) {
    return CHANNEL_CONFIG[orderChannel] ?? CHANNEL_CONFIG.dine_in;
}

function formatPlatformFee(fee) {
    if (!fee || fee <= 0) return null;
    return `−${fmt(fee)} fee`;
}

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

            {!transactions?.data?.length && !transactions?.length ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <ShoppingBag className="w-8 h-8 text-gray-200" />
                    <p className="text-sm text-gray-400">Belum ada transaksi</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto -mx-1 px-1">
                    {(transactions?.data ?? transactions).map((trx) => {
                        const channel = trx.order_channel ?? "dine_in";
                        const {
                            label: channelLabel,
                            color,
                            iconColor,
                            Icon,
                        } = getChannelConfig(channel);
                        const isOnline = channel !== "dine_in";
                        const paymentMethodLabel =
                            PAYMENT_LABEL[trx.payment_method] ??
                            trx.payment_method;
                        const platformFeeLabel = formatPlatformFee(
                            trx.platform_fee,
                        );

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

                        const getBadgeStyle = (channel) => {
                            switch (channel) {
                                case "grabfood":
                                    return "bg-[#00B14F]/10 text-[#00B14F]";
                                case "shopeefood":
                                    return "bg-[#EE4D2D]/10 text-[#EE4D2D]";
                                case "gobiz":
                                    return "bg-[#00AA13]/10 text-[#00AA13]";
                                default:
                                    return "bg-gray-100 text-gray-600";
                            }
                        };

                        return (
                            <div
                                key={trx.id}
                                className="flex items-center gap-3 py-2.5 hover:bg-gray-50/50 rounded-lg transition-colors duration-150"
                            >
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                                        color,
                                    )}
                                >
                                    <Icon
                                        className={cn("w-4 h-4", iconColor)}
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-xs font-semibold text-gray-800 truncate">
                                            #{trx.id}
                                        </p>
                                        {isOnline && (
                                            <span
                                                className={cn(
                                                    "text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0",
                                                    getBadgeStyle(channel),
                                                )}
                                            >
                                                {channelLabel}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-400 truncate">
                                        {isOnline
                                            ? channelLabel
                                            : paymentMethodLabel}{" "}
                                        · {time}
                                        {platformFeeLabel && (
                                            <span className="text-red-400 ml-1">
                                                {platformFeeLabel}
                                            </span>
                                        )}
                                    </p>
                                </div>

                                <div className="text-right shrink-0">
                                    <p className="text-xs sm:text-sm font-bold text-gray-800">
                                        {fmt(trx.net_revenue ?? trx.total)}
                                    </p>
                                    {trx.platform_fee > 0 && (
                                        <p className="text-[10px] text-gray-400 line-through">
                                            {fmt(trx.total)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
