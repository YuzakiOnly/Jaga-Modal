import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

function formatRp(value) {
    if (!value && value !== 0) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function formatNum(value) {
    if (!value && value !== 0) return "0";
    return new Intl.NumberFormat("id-ID").format(value);
}

export default function StatCard({
    title,
    value,
    trend,
    comparisonValue,
    comparisonLabel,
    icon: Icon,
    accent = false,
    isCurrency = true,
}) {
    const displayValue = isCurrency ? formatRp(value) : formatNum(value);
    const displayComparison =
        comparisonValue !== undefined && comparisonValue !== null
            ? isCurrency
                ? formatRp(comparisonValue)
                : formatNum(comparisonValue)
            : null;

    const displayTrend =
        trend !== null && trend !== undefined ? Math.abs(trend) : 0;
    const isPositive = trend > 0;
    const isNegative = trend < 0;
    const isNeutral = trend === 0;

    return (
        <div
            className={cn(
                "rounded-2xl border p-4 sm:p-5 flex flex-col gap-3 transition-shadow hover:shadow-md",
                accent
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "bg-white border-gray-100 text-gray-900",
            )}
        >
            <div className="flex items-start justify-between">
                <div
                    className={cn(
                        "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center",
                        accent ? "bg-emerald-500/40" : "bg-emerald-50",
                    )}
                >
                    <Icon
                        className={cn(
                            "w-4 h-4 sm:w-5 sm:h-5",
                            accent ? "text-white" : "text-emerald-600",
                        )}
                    />
                </div>
                {trend !== null && trend !== undefined && (
                    <span
                        className={cn(
                            "flex items-center gap-0.5 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-1 rounded-full",
                            isPositive
                                ? accent
                                    ? "bg-white/20 text-white"
                                    : "bg-emerald-50 text-emerald-700"
                                : isNegative
                                  ? accent
                                      ? "bg-white/20 text-white"
                                      : "bg-red-50 text-red-600"
                                  : accent
                                    ? "bg-white/20 text-white"
                                    : "bg-slate-100 text-gray-500",
                        )}
                    >
                        {isPositive ? (
                            <ArrowUpRight className="w-3 h-3" />
                        ) : isNegative ? (
                            <ArrowDownRight className="w-3 h-3" />
                        ) : (
                            <Minus className="w-3 h-3" />
                        )}
                        {displayTrend}%
                    </span>
                )}
            </div>
            <div>
                <p
                    className={cn(
                        "text-[10px] sm:text-[11px] font-medium uppercase tracking-widest mb-1",
                        accent ? "text-emerald-100" : "text-gray-400",
                    )}
                >
                    {title}
                </p>
                <p
                    className={cn(
                        "text-lg sm:text-2xl font-bold leading-none",
                        accent ? "text-white" : "text-gray-900",
                    )}
                >
                    {displayValue}
                </p>

                {displayComparison !== null && comparisonLabel && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-[10px] text-muted-foreground">
                            Dibanding {comparisonLabel}
                        </p>
                        <p
                            className={cn(
                                "text-xs font-medium",
                                isNegative && !accent ? "text-red-600" : "",
                            )}
                        >
                            {displayComparison}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
