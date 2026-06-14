import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

const PERIODS = [
    { value: "daily", label: "Harian" },
    { value: "weekly", label: "Mingguan" },
    { value: "monthly", label: "Bulanan" },
];

export default function HistoryFilter({
    period,
    date,
    onPeriodChange,
    onDateChange,
}) {
    const selectedDate =
        date instanceof Date
            ? date
            : new Date(
                  (typeof date === "string"
                      ? date
                      : date.toISOString().split("T")[0]) + "T00:00:00",
              );

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex bg-slate-50 rounded-xl p-1 gap-1 self-start">
                    {PERIODS.map((p) => (
                        <button
                            key={p.value}
                            onClick={() => onPeriodChange(p.value)}
                            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap ${
                                period === p.value
                                    ? "bg-white text-emerald-700 shadow-sm font-bold"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                <div className="sm:ml-auto">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto justify-start gap-2 border-slate-200 hover:border-emerald-300"
                            >
                                <CalendarIcon
                                    size={13}
                                    className="text-slate-400"
                                />
                                <span className="text-sm">
                                    {format(selectedDate, "dd MMMM yyyy", {
                                        locale: id,
                                    })}
                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(newDate) => {
                                    if (newDate) onDateChange(newDate);
                                }}
                                disabled={(day) => {
                                    const today = new Date();
                                    today.setHours(23, 59, 59, 999);
                                    return day > today;
                                }}
                                locale={id}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    );
}
