// resources/js/pages/cashier/history/_components/HistoryFilter.jsx
import { Filter, Calendar } from "lucide-react";
import { useState, useEffect } from "react";

export default function HistoryFilter({ date, onDateChange }) {
    const selectedDate = date instanceof Date ? date : new Date(date);
    const [localDate, setLocalDate] = useState(
        selectedDate.toISOString().split("T")[0],
    );

    useEffect(() => {
        if (date) {
            const d = date instanceof Date ? date : new Date(date);
            setLocalDate(d.toISOString().split("T")[0]);
        }
    }, [date]);

    const handleDateChange = (e) => {
        const newDate = new Date(e.target.value + "T00:00:00");
        setLocalDate(e.target.value);
        onDateChange({
            from: newDate,
            to: newDate,
        });
    };

    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-xl">
                    <Filter className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-slate-700">
                        Filter Transaksi
                    </h3>
                    <p className="text-xs text-slate-400">
                        Pilih tanggal transaksi
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span className="hidden sm:inline">Tanggal</span>
                </div>
                <input
                    type="date"
                    value={localDate}
                    onChange={handleDateChange}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all min-w-[150px]"
                />
            </div>
        </div>
    );
}
