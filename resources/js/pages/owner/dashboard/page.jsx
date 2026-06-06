import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AppLayout from "@/layouts/dashboard/AppLayout";
import {
    DollarSign,
    TrendingUp,
    Package,
    ReceiptText,
    Landmark,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import StatCard from "./_components/StatCard";
import MiniStatCard from "./_components/MiniStatCard";
import SalesChart from "./_components/SalesChart";
import DailyProductChart from "./_components/DailyProductChart";
import CustomerTransactionChart from "./_components/CustomerTransactionChart";
import TopProducts from "./_components/TopProducts";
import LowStockAlert from "./_components/LowStockAlert";
import ExpenseBreakdown from "./_components/ExpenseBreakdown";
import RecentTransactions from "./_components/RecentTransactions";
import ProductSummaryCards from "./_components/ProductSummaryCards";
import CustomerStatCard from "./_components/CustomerStatCard";
import CurrencyCards from "./_components/CurrencyCards";
import OnlineChannelCards from "./_components/OnlineChannelCards";

const PERIODS = [
    { key: "hari_ini", label: "Hari Ini" },
    { key: "minggu_ini", label: "Minggu Ini" },
    { key: "bulan_ini", label: "Bulan Ini" },
];

const COMPARISONS = [
    { key: "yesterday", label: "Kemarin" },
    { key: "last_week", label: "Minggu Lalu" },
    { key: "last_month", label: "Bulan Lalu" },
];

const currentMonth = new Date().toISOString().slice(0, 7);

export default function Dashboard({
    store,
    stats,
    comparisons,
    period: initialPeriod,
    customer_stats,
    sales_chart,
    daily_product_data,
    customer_transaction_data,
    top_products,
    low_stock_products,
    recent_transactions,
    expense_by_type,
    product_stats,
    sales_month: initialSalesMonth,
    product_month: initialProductMonth,
    customer_month: initialCustomerMonth,
    available_months,
}) {
    const params = new URLSearchParams(window.location.search);

    const [period, setPeriod] = useState(
        initialPeriod ?? params.get("period") ?? "hari_ini",
    );
    const [comparison, setComparison] = useState(
        params.get("comparison") ?? "yesterday",
    );
    const [salesMonth, setSalesMonth] = useState(
        initialSalesMonth ?? params.get("sales_month") ?? currentMonth,
    );
    const [productMonth, setProductMonth] = useState(
        initialProductMonth ?? params.get("product_month") ?? currentMonth,
    );
    const [customerMonth, setCustomerMonth] = useState(
        initialCustomerMonth ?? params.get("customer_month") ?? currentMonth,
    );

    const activeComparison =
        comparisons?.[comparison] ?? comparisons?.last_month;

    const refreshData = (updates = {}) => {
        const url = new URL(window.location.href);
        const current = {
            period,
            comparison,
            sales_month: salesMonth,
            product_month: productMonth,
            customer_month: customerMonth,
            ...updates,
        };
        Object.entries(current).forEach(([key, value]) => {
            url.searchParams.set(key, value);
        });
        router.get(
            url.pathname + url.search,
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handlePeriodChange = (value) => {
        setPeriod(value);
        refreshData({ period: value });
    };

    const handleComparisonChange = (value) => {
        setComparison(value);
        refreshData({ comparison: value });
    };

    const handleSalesMonthChange = (value) => {
        setSalesMonth(value);
        refreshData({ sales_month: value });
    };

    const handleProductMonthChange = (value) => {
        setProductMonth(value);
        refreshData({ product_month: value });
    };

    const handleCustomerMonthChange = (value) => {
        setCustomerMonth(value);
        refreshData({ customer_month: value });
    };

    const periodLabel =
        {
            hari_ini: "Hari Ini",
            minggu_ini: "Minggu Ini",
            bulan_ini: "Bulan Ini",
        }[period] ?? "Periode ini";

    const summaryCards = [
        {
            title: "Omzet",
            value: stats.net_revenue,
            trend: activeComparison?.trends?.revenue ?? null,
            comparisonValue: activeComparison?.revenue,
            comparisonLabel: activeComparison?.label,
            icon: DollarSign,
            isCurrency: true,
        },
        {
            title: "Laba Bersih",
            value: stats.net_profit,
            trend: activeComparison?.trends?.net_profit ?? null,
            comparisonValue: activeComparison?.net_profit,
            comparisonLabel: activeComparison?.label,
            icon: TrendingUp,
            isCurrency: true,
        },
        {
            title: "Produk Terjual",
            value: stats.products_sold,
            trend: activeComparison?.trends?.products_sold ?? null,
            comparisonValue: activeComparison?.products_sold,
            comparisonLabel: activeComparison?.label,
            icon: Package,
            isCurrency: false,
        },
        {
            title: "Rata-rata Transaksi",
            value: stats.avg_transaction,
            trend: activeComparison?.trends?.avg_transaction ?? null,
            comparisonValue: activeComparison?.avg_transaction,
            comparisonLabel: activeComparison?.label,
            icon: ReceiptText,
            isCurrency: true,
        },
    ];

    const miniStats = [
        {
            label: "Saldo Kas Toko",
            value: stats.cash_balance,
            subValue: "Uang tunai di toko",
            isCurrency: true,
            icon: Landmark,
            iconColor: "text-slate-600 dark:text-slate-400",
        },
        {
            label: "Saldo Online Total",
            value: stats.online_balance_total,
            subValue: "Grab + Shopee + GoBiz",
            isCurrency: true,
            icon: Package,
            iconColor: "text-orange-500 dark:text-orange-400",
        },
        {
            label: "Total Pengeluaran",
            value: stats.monthly_expense,
            subValue: "Termasuk penarikan owner",
            isCurrency: true,
            iconColor: "text-red-500 dark:text-red-400",
        },
        {
            label: "Penarikan Owner",
            value: stats.total_withdrawal,
            subValue: "Bulan ini",
            isCurrency: true,
            iconColor: "text-purple-500 dark:text-purple-400",
        },
    ];

    return (
        <>
            <Head title="Dashboard | Owner" />

            <div className="space-y-5 p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight lg:text-2xl text-foreground">
                            Selamat datang, {store?.name ?? "Owner"}!
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Ringkasan performa toko
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground hidden sm:block">
                            Bandingkan:
                        </span>
                        <Select
                            value={comparison}
                            onValueChange={handleComparisonChange}
                        >
                            <SelectTrigger className="w-36 h-8 text-sm font-normal border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {COMPARISONS.map((c) => (
                                    <SelectItem key={c.key} value={c.key}>
                                        {c.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex gap-1 p-1 bg-muted/30 border border-border rounded-xl w-fit">
                    {PERIODS.map((p) => (
                        <button
                            key={p.key}
                            onClick={() => handlePeriodChange(p.key)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                                period === p.key
                                    ? "bg-emerald-600 text-white shadow-sm dark:bg-emerald-700"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                    {summaryCards.map((card, i) => (
                        <StatCard key={i} {...card} />
                    ))}
                </div>

                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                    {miniStats.map((s, i) => (
                        <MiniStatCard key={i} {...s} />
                    ))}
                </div>

                <OnlineChannelCards
                    balances={stats.online_channel_balances}
                    periodRevenues={stats.online_channel_period}
                    periodLabel={periodLabel}
                />

                <div className="grid gap-3 grid-cols-1 lg:grid-cols-4">
                    <CustomerStatCard
                        customerStats={customer_stats?.[period]}
                        period={period}
                    />
                    <div className="lg:col-span-3">
                        <CurrencyCards />
                    </div>
                </div>

                <SalesChart
                    data={sales_chart}
                    selectedMonth={salesMonth}
                    availableMonths={available_months}
                    onMonthChange={handleSalesMonthChange}
                />

                <div className="grid gap-4 md:grid-cols-2">
                    <DailyProductChart
                        data={daily_product_data}
                        selectedMonth={productMonth}
                        availableMonths={available_months}
                        onMonthChange={handleProductMonthChange}
                    />
                    <CustomerTransactionChart
                        data={customer_transaction_data}
                        selectedMonth={customerMonth}
                        availableMonths={available_months}
                        onMonthChange={handleCustomerMonthChange}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <TopProducts products={top_products} />
                    <LowStockAlert
                        products={low_stock_products}
                        totalLowStock={product_stats.total_low_stock}
                    />
                    <ExpenseBreakdown
                        expenses={expense_by_type}
                        totalExpense={stats.monthly_expense}
                    />
                </div>

                <RecentTransactions transactions={recent_transactions} />

                <ProductSummaryCards
                    productStats={product_stats}
                    averageMargin={stats.average_margin}
                    netProfit={stats.net_profit_month}
                />
            </div>
        </>
    );
}

Dashboard.layout = (page) => <AppLayout>{page}</AppLayout>;
