// resources/js/pages/cashier/history/page.jsx
import { Head, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import CashierLayout from "@/layouts/CashierLayout";
import HistoryFilter from "./_components/HistoryFilter";
import HistorySummary from "./_components/HistorySummary";
import TransactionList from "./_components/TransactionList";
import { useSmartRefresh } from "@/hooks/useSmartRefresh";
import { refreshConfigs } from "@/hooks/refreshConfig";
import { toDateString, formatCurrency } from "@/lib/formatters";

export default function History({ transactions, summary, filters }) {
    const [date, setDate] = useState(
        filters.date ? new Date(filters.date + "T00:00:00") : new Date(),
    );

    useSmartRefresh({ ...refreshConfigs.cashier_history });

    useEffect(() => {
        if (filters.date) {
            const d = new Date(filters.date + "T00:00:00");
            setDate(d);
        }
    }, [filters]);

    function applyFilter(newDate) {
        const params = {};
        if (newDate) {
            params.date = toDateString(newDate);
        }
        router.get(route("cashier.history"), params, {
            preserveState: true,
            replace: true,
        });
    }

    function handleDateChange(newRange) {
        if (newRange?.from) {
            setDate(newRange.from);
            applyFilter(newRange.from);
        }
    }

    return (
        <CashierLayout title="Riwayat Transaksi">
            <Head title="Riwayat Transaksi — JagaModal" />

            <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-slate-50/80">
                <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                    <span className="text-orange-500 bg-clip-text">
                                        Riwayat Transaksi
                                    </span>
                                </h1>
                                <p className="text-sm text-slate-500">
                                    Kelola dan pantau semua transaksi yang telah
                                    selesai
                                </p>
                            </div>
                            <div className="flex items-center gap-4 bg-slate-50 rounded-xl px-4 py-2 border border-slate-200/50">
                                <div className="text-center">
                                    <p className="text-xs text-slate-400">
                                        Total
                                    </p>
                                    <p className="text-lg font-bold text-slate-800">
                                        {summary.total_count || 0}
                                    </p>
                                </div>
                                <div className="w-px h-8 bg-slate-200"></div>
                                <div className="text-center">
                                    <p className="text-xs text-slate-400">
                                        Pendapatan
                                    </p>
                                    <p className="text-lg font-bold text-emerald-600">
                                        {formatCurrency(
                                            summary.total_revenue || 0,
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-6">
                            <HistoryFilter
                                date={date}
                                onDateChange={handleDateChange}
                            />
                        </div>

                        <HistorySummary summary={summary} />

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-6">
                            <TransactionList
                                transactions={transactions}
                                fmt={formatCurrency}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </CashierLayout>
    );
}
