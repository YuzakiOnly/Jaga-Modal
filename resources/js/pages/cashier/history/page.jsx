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
    const [period, setPeriod] = useState(filters.period || "daily");
    const [date, setDate] = useState(
        filters.date ? new Date(filters.date + "T00:00:00") : new Date(),
    );

    useSmartRefresh({ ...refreshConfigs.cashier_history });

    useEffect(() => {
        if (filters.period) setPeriod(filters.period);
        if (filters.date) setDate(new Date(filters.date + "T00:00:00"));
    }, [filters]);

    function applyFilter(newPeriod, newDate) {
        const params = { period: newPeriod, date: toDateString(newDate) };
        router.get(route("cashier.history"), params, {
            preserveState: true,
            replace: true,
        });
    }

    function handlePeriodChange(val) {
        setPeriod(val);
        applyFilter(val, date);
    }

    function handleDateChange(newDate) {
        setDate(newDate);
        applyFilter(period, newDate);
    }

    return (
        <CashierLayout title="Riwayat Transaksi">
            <Head title="Riwayat Transaksi — JagaModal" />

            <div className="flex-1 overflow-y-auto bg-slate-50">
                <div className="max-w-5xl mx-auto p-4 sm:p-5 space-y-4 sm:space-y-5">
                    <HistoryFilter
                        period={period}
                        date={date}
                        onPeriodChange={handlePeriodChange}
                        onDateChange={handleDateChange}
                    />

                    <HistorySummary summary={summary} />

                    <TransactionList
                        transactions={transactions}
                        fmt={formatCurrency}
                    />
                </div>
            </div>
        </CashierLayout>
    );
}
