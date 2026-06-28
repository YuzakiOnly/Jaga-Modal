// resources/js/pages/cashier/dashboard/_components/StatCard.jsx
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StatCard({
    label,
    value,
    sub,
    icon: Icon,
    accent = false,
    trend,
}) {
    return (
        <div
            className={cn(
                "bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition-all duration-200",
                accent
                    ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white"
                    : "border-slate-200/80",
            )}
        >
            <div className="flex items-start justify-between mb-3">
                <div
                    className={cn(
                        "w-11 h-11 rounded-2xl flex items-center justify-center",
                        accent ? "bg-emerald-100" : "bg-emerald-50",
                    )}
                >
                    <Icon
                        className={cn(
                            "w-5 h-5",
                            accent ? "text-emerald-600" : "text-emerald-600",
                        )}
                    />
                </div>
                {trend != null && (
                    <span
                        className={cn(
                            "flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full",
                            trend > 0
                                ? "bg-emerald-50 text-emerald-700"
                                : trend < 0
                                  ? "bg-red-50 text-red-600"
                                  : "bg-slate-100 text-slate-500",
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
            </div>
            <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                    {label}
                </p>
                <p className="text-2xl font-black text-slate-800">{value}</p>
                {sub && <p className="text-xs text-slate-400 mt-1.5">{sub}</p>}
            </div>
        </div>
    );
}
