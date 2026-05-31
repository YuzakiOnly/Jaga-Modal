import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import CashierLayout from "@/layouts/CashierLayout";
import HistoryFilter from "./_components/HistoryFilter";
import HistorySummary from "./_components/HistorySummary";
import TransactionList from "./_components/TransactionList";

const fmt = (n) => "Rp " + Math.round(n).toLocaleString("id-ID");

export default function History({ transactions, summary, filters }) {
    const [period, setPeriod] = useState(filters.period || "daily");
    const [date, setDate] = useState(
        filters.date ? new Date(filters.date) : new Date(),
    );

    function applyFilter(newPeriod, newDate) {
        const formattedDate = newDate.toISOString().split("T")[0];
        router.get(
            route("cashier.history"),
            { period: newPeriod, date: formattedDate },
            { preserveState: true },
        );
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

                    <TransactionList transactions={transactions} fmt={fmt} />
                </div>
            </div>
        </CashierLayout>
    );
}
