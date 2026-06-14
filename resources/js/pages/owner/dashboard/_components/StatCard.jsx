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
    isCurrency = true,
    subtitle = null,
}) {
    const displayValue = isCurrency ? formatRp(value) : formatNum(value);
    const displayComparison = isCurrency
        ? formatRp(comparisonValue)
        : formatNum(comparisonValue);

    return (
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 flex flex-col gap-3 transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                {trend !== undefined && trend !== null && (
                    <span
                        className={cn(
                            "flex items-center gap-0.5 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-1 rounded-full",
                            trend > 0
                                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"
                                : trend < 0
                                  ? "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400"
                                  : "bg-muted text-muted-foreground",
                        )}
                    >
                        {trend > 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                        ) : trend < 0 ? (
                            <ArrowDownRight className="w-3 h-3" />
                        ) : (
                            <Minus className="w-3 h-3" />
                        )}
                        {Math.abs(trend)}%
                    </span>
                )}
                {trend === null && (
                    <span className="text-[10px] text-muted-foreground px-2 py-1 bg-muted rounded-full">
                        —
                    </span>
                )}
            </div>
            <div>
                <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-1">
                    {title}
                </p>
                <p className="text-lg sm:text-2xl font-bold leading-none text-foreground">
                    {displayValue}
                </p>
                {subtitle && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                        {subtitle}
                    </p>
                )}
                {comparisonValue !== undefined && comparisonLabel && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5">
                        {comparisonLabel}: {displayComparison}
                    </p>
                )}
            </div>
        </div>
    );
}
