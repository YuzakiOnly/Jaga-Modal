// resources/js/pages/cashier/expenses/_components/ExpenseSummary.jsx
import { TrendingDown, Receipt } from "lucide-react";

export default function ExpenseSummary({ totalExpense, totalCount, fmt }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-6 shadow-lg shadow-rose-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-8 -translate-x-6" />
                <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                            <TrendingDown size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-rose-100 uppercase tracking-wider">
                                Total Pengeluaran
                            </p>
                            <p className="text-xs text-rose-200">
                                {totalCount} catatan
                            </p>
                        </div>
                    </div>
                    <p className="text-3xl font-black text-white">
                        {fmt(totalExpense)}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center">
                    <Receipt size={24} className="text-rose-500" />
                </div>
                <div>
                    <p className="text-sm text-slate-500">Jumlah Transaksi</p>
                    <p className="text-2xl font-bold text-slate-800">
                        {totalCount}
                    </p>
                </div>
            </div>
        </div>
    );
}
