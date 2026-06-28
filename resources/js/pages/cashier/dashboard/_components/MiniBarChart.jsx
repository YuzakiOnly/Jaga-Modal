// resources/js/pages/cashier/dashboard/_components/MiniBarChart.jsx
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmt, fmtNum } from "@/lib/cashier/dashboard";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function MiniBarChart({
    data,
    selectedMonth,
    onMonthChange,
    availableMonths,
    currentMonthName,
}) {
    if (!data?.length) return null;

    const maxRev = Math.max(...data.map((d) => d.revenue), 1);
    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
    const totalTransactions = data.reduce((sum, d) => sum + d.count, 0);

    const handlePrevMonth = () => {
        const currentDate = new Date(selectedMonth + "-01");
        currentDate.setMonth(currentDate.getMonth() - 1);
        onMonthChange(currentDate.toISOString().slice(0, 7));
    };

    const handleNextMonth = () => {
        const currentDate = new Date(selectedMonth + "-01");
        currentDate.setMonth(currentDate.getMonth() + 1);
        onMonthChange(currentDate.toISOString().slice(0, 7));
    };

    const formatBulanIndonesia = (monthValue) => {
        const date = new Date(monthValue + "-01");
        return date.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
        });
    };

    const displayMonthName =
        currentMonthName || formatBulanIndonesia(selectedMonth);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
            <div className="flex items-center justify-between gap-2 mb-5">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Grafik Penjualan
                    </p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                        Per Hari
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrevMonth}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4 text-slate-500" />
                    </button>

                    <Select value={selectedMonth} onValueChange={onMonthChange}>
                        <SelectTrigger className="w-32 sm:w-40 h-8 text-sm ring-0 focus:ring-0 border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                            <SelectValue>{displayMonthName}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {availableMonths
                                .filter(
                                    (month, index, self) =>
                                        index ===
                                        self.findIndex(
                                            (m) => m.value === month.value,
                                        ),
                                )
                                .map((month) => (
                                    <SelectItem
                                        className="cursor-pointer"
                                        key={month.value}
                                        value={month.value}
                                    >
                                        {formatBulanIndonesia(month.value)}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>

                    <button
                        onClick={handleNextMonth}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        disabled={new Date(selectedMonth + "-01") >= new Date()}
                    >
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                </div>
            </div>

            <div className="flex gap-6 mb-4 pb-3 border-b border-slate-100">
                <div>
                    <p className="text-xs text-slate-400">
                        Total Omzet {displayMonthName}
                    </p>
                    <p className="text-lg font-bold text-emerald-600">
                        {fmt(totalRevenue)}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-slate-400">
                        Total Transaksi {displayMonthName}
                    </p>
                    <p className="text-lg font-bold text-slate-800">
                        {fmtNum(totalTransactions)}
                    </p>
                </div>
            </div>

            <div
                className="flex items-end gap-0.5 sm:gap-1"
                style={{ height: "140px" }}
            >
                {data.map((d, i) => {
                    const pct = (d.revenue / maxRev) * 100;
                    const isHigh = d.revenue > maxRev * 0.7;
                    return (
                        <div
                            key={i}
                            className="relative flex-1 group"
                            style={{ height: `${Math.max(pct, 3)}%` }}
                        >
                            <div className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none whitespace-nowrap">
                                <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-1.5 shadow-lg text-center">
                                    <span className="font-bold">
                                        {fmt(d.revenue)}
                                    </span>
                                    <br />
                                    <span className="text-slate-400">
                                        {d.count} transaksi
                                    </span>
                                </div>
                                <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
                            </div>

                            <div
                                className={cn(
                                    "w-full h-full rounded-t transition-all duration-300",
                                    isHigh
                                        ? "bg-emerald-500"
                                        : "bg-emerald-200",
                                    "hover:bg-emerald-400",
                                )}
                            />
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-0.5 sm:gap-1 mt-2">
                {data.map((d, i) => {
                    return (
                        <div key={i} className="flex-1 text-center">
                            <span className="text-[8px] sm:text-[10px] font-medium text-slate-500">
                                {d.date}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
