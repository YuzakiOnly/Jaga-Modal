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

    const currentMonthName = formatBulanIndonesia(selectedMonth);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 mb-5 sm:mb-6">
                <div className="shrink-0">
                    <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-400">
                        Grafik Penjualan
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 mt-0.5">
                        Per Hari
                    </p>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <button
                        onClick={handlePrevMonth}
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                    </button>

                    <Select value={selectedMonth} onValueChange={onMonthChange}>
                        <SelectTrigger className="w-32 sm:w-40 h-7.5! text-xs sm:text-sm ring-0! focus:ring-0! border-gray-200! bg-white! hover:bg-gray-50! cursor-pointer">
                            <SelectValue>{currentMonthName}</SelectValue>
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
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        disabled={new Date(selectedMonth + "-01") >= new Date()}
                    >
                        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                    </button>
                </div>
            </div>

            <div className="flex gap-3 sm:gap-4 mb-4 pb-3 border-b border-gray-100">
                <div>
                    <p className="text-[10px] text-gray-400">Total Omzet</p>
                    <p className="text-base sm:text-lg font-bold text-emerald-600">
                        {fmt(totalRevenue)}
                    </p>
                </div>
                <div>
                    <p className="text-[10px] text-gray-400">Total Transaksi</p>
                    <p className="text-base sm:text-lg font-bold text-gray-800">
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
                                <div className="bg-gray-900 text-white text-[10px] rounded-lg px-2.5 py-1.5 shadow-lg text-center">
                                    <span className="font-bold">
                                        {fmt(d.revenue)}
                                    </span>
                                    <br />
                                    <span className="text-gray-400">
                                        {d.count} transaksi
                                    </span>
                                </div>
                                <div className="w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
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
                            <span className="text-[7px] sm:text-[9px] font-medium text-gray-500">
                                {d.date}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
