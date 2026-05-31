import { TrendingDown } from "lucide-react";

export default function ExpenseSummary({ totalExpense, totalCount, fmt }) {
    return (
        <div className="bg-rose-500 rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-8 -translate-x-6" />
            <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                        <TrendingDown size={14} className="text-white" />
                    </div>
                    <p className="text-xs font-semibold text-rose-100 uppercase tracking-wider">
                        Total Pengeluaran
                    </p>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-white">
                    {fmt(totalExpense)}
                </p>
                <p className="text-xs text-rose-200 mt-1">
                    {totalCount} catatan
                </p>
            </div>
        </div>
    );
}
