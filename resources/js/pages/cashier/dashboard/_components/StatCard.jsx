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
                {/* FIX: Ganti !== undefined → != null supaya null tidak lolos render */}
                {trend != null && (
                    <span
                        className={cn(
                            "flex items-center gap-0.5 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-1 rounded-full",
                            trend > 0
                                ? accent
                                    ? "bg-white/20 text-white"
                                    : "bg-emerald-50 text-emerald-700"
                                : trend < 0
                                  ? accent
                                      ? "bg-white/20 text-white"
                                      : "bg-red-50 text-red-600"
                                  : accent
                                    ? "bg-white/20 text-white"
                                    : "bg-slate-100 text-gray-500",
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
                <p
                    className={cn(
                        "text-[10px] sm:text-[11px] font-medium uppercase tracking-widest mb-1",
                        accent ? "text-emerald-100" : "text-gray-400",
                    )}
                >
                    {label}
                </p>
                <p
                    className={cn(
                        "text-lg sm:text-2xl font-bold leading-none",
                        accent ? "text-white" : "text-gray-900",
                    )}
                >
                    {value}
                </p>
                {sub && (
                    <p
                        className={cn(
                            "text-[10px] sm:text-xs mt-1.5",
                            accent ? "text-emerald-100" : "text-gray-400",
                        )}
                    >
                        {sub}
                    </p>
                )}
            </div>
        </div>
    );
}
