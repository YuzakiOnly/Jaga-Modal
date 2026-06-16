import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import {
    TrendingUp,
    ShoppingBag,
    Banknote,
    QrCode,
    ArrowLeft,
    Users,
    Receipt,
} from "lucide-react";
import { Link } from "@inertiajs/react";

import AppLayout from "@/layouts/dashboard/AppLayout";
import { Button } from "@/components/ui/button";
import { SummaryCard } from "./_components/SummaryCard";
import { TransactionFilter } from "./_components/TransactionFilter";
import { TransactionList } from "./_components/TransactionList";
import { CustomerList } from "./_components/CustomerList";

import { useSmartRefresh } from "@/hooks/useSmartRefresh";
import { refreshConfigs } from "@/hooks/refreshConfig";

const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price);

const TABS = [
    { id: "transactions", label: "Transaksi", icon: Receipt },
    { id: "customers", label: "Pelanggan", icon: Users },
];

export default function TransactionHistoryPage({
    transactions,
    summary,
    customers = [],
    filters,
}) {
    const [period, setPeriod] = useState(filters?.period ?? "daily");
    const [date, setDate] = useState(
        filters?.date ?? new Date().toISOString().slice(0, 10),
    );
    const [activeTab, setActiveTab] = useState("transactions");

    useSmartRefresh({ ...refreshConfigs.owner_history });

    const applyFilter = (newPeriod, newDate) => {
        const params = { period: newPeriod, date: newDate };
        router.get(route("owner.transactions.history"), params, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePeriodChange = (val) => {
        setPeriod(val);
        applyFilter(val, date);
    };

    const handleDateChange = (e) => {
        setDate(e.target.value);
        applyFilter(period, e.target.value);
    };

    return (
        <>
            <Head title="Riwayat Transaksi" />

            <div className="mx-auto max-w-6xl px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href={route("owner.pos")}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold">
                            Riwayat Transaksi
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Lihat semua transaksi berdasarkan periode
                        </p>
                    </div>
                </div>

                {/* Filter */}
                <TransactionFilter
                    period={period}
                    date={date}
                    onPeriodChange={handlePeriodChange}
                    onDateChange={handleDateChange}
                />

                {/* Summary cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <SummaryCard
                        icon={TrendingUp}
                        label="Total Pendapatan"
                        value={formatPrice(summary.total_revenue)}
                        sub={`${summary.total_count} transaksi`}
                        accent="text-primary"
                    />
                    <SummaryCard
                        icon={ShoppingBag}
                        label="Jumlah Transaksi"
                        value={summary.total_count}
                        sub="transaksi selesai"
                    />
                    <SummaryCard
                        icon={Banknote}
                        label="Cash"
                        value={summary.cash_count}
                        sub="transaksi"
                    />
                    <SummaryCard
                        icon={QrCode}
                        label="QRIS"
                        value={summary.qris_count}
                        sub="transaksi"
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        const count =
                            tab.id === "customers"
                                ? customers.length
                                : transactions.total;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                                    isActive
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                                <span
                                    className={`text-xs rounded-full px-1.5 py-0.5 tabular-nums ${
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "bg-muted text-muted-foreground"
                                    }`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab content */}
                {activeTab === "transactions" ? (
                    <TransactionList transactions={transactions} />
                ) : (
                    <CustomerList customers={customers} />
                )}
            </div>
        </>
    );
}

TransactionHistoryPage.layout = (page) => <AppLayout>{page}</AppLayout>;
