import { memo, useState, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import AppLayout from "@/layouts/dashboard/AppLayout";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
    DollarSign,
    TrendingUp,
    Package,
    ReceiptText,
    Landmark,
    Wallet,
    ArrowLeftRight,
} from "lucide-react";

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
import MonthlyRevenueChart from "./_components/MonthlyRevenueChart";

function toLocalDateString(date) {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

const currentMonth = toLocalDateString(new Date()).slice(0, 7);

function formatRp(value) {
    if (!value && value !== 0) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function formatNum(value) {
    if (!value && value !== 0) return "0";
    return new Intl.NumberFormat("id-ID").format(value);
}

const Dashboard = memo(function Dashboard({
    store,
    stats,
    period_label,
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
    monthly_revenue_chart,
}) {
    const params = new URLSearchParams(window.location.search);

    const getInitialValue = () => {
        const startDate = params.get("start_date");
        const endDate = params.get("end_date");
        const comparison = params.get("comparison");
        if (startDate && endDate) {
            return {
                range: {
                    from: new Date(startDate),
                    to: new Date(endDate),
                },
                comparison: comparison || "last_7_days",
            };
        }
        const today = new Date();
        return {
            range: { from: today, to: today },
            comparison: "last_7_days",
        };
    };

    const [datePickerValue, setDatePickerValue] = useState(getInitialValue());
    const [salesMonth, setSalesMonth] = useState(
        initialSalesMonth ?? params.get("sales_month") ?? currentMonth,
    );
    const [productMonth, setProductMonth] = useState(
        initialProductMonth ?? params.get("product_month") ?? currentMonth,
    );
    const [customerMonth, setCustomerMonth] = useState(
        initialCustomerMonth ?? params.get("customer_month") ?? currentMonth,
    );

    const memoizedSalesChart = useMemo(() => sales_chart, [sales_chart]);
    const memoizedMonthlyRevenue = useMemo(
        () => monthly_revenue_chart,
        [monthly_revenue_chart],
    );
    const memoizedDailyProduct = useMemo(
        () => daily_product_data,
        [daily_product_data],
    );
    const memoizedCustomerTransaction = useMemo(
        () => customer_transaction_data,
        [customer_transaction_data],
    );
    const memoizedTopProducts = useMemo(() => top_products, [top_products]);
    const memoizedLowStock = useMemo(
        () => low_stock_products,
        [low_stock_products],
    );
    const memoizedExpenses = useMemo(() => expense_by_type, [expense_by_type]);
    const memoizedRecentTransactions = useMemo(
        () => recent_transactions,
        [recent_transactions],
    );
    const memoizedAvailableMonths = useMemo(
        () => available_months,
        [available_months],
    );

    const refreshData = (updates = {}) => {
        const url = new URL(window.location.href);
        const current = {
            start_date: toLocalDateString(datePickerValue.range?.from),
            end_date: toLocalDateString(datePickerValue.range?.to),
            comparison: datePickerValue.comparison,
            sales_month: salesMonth,
            product_month: productMonth,
            customer_month: customerMonth,
            ...updates,
        };
        Object.entries(current).forEach(([key, value]) => {
            if (value) {
                url.searchParams.set(key, value);
            } else {
                url.searchParams.delete(key);
            }
        });
        router.get(
            url.pathname + url.search,
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleDateRangeChange = (value) => {
        console.log("DateRange selected:", value);
        setDatePickerValue(value);
        refreshData({
            start_date: toLocalDateString(value.range?.from),
            end_date: toLocalDateString(value.range?.to),
            comparison: value.comparison,
        });
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

    const summaryCards = [
        {
            title: "Omzet",
            value: stats.total_revenue,
            trend: stats.revenue_trend,
            comparisonValue: stats.comparison_revenue,
            comparisonLabel: stats.comparison_label,
            icon: DollarSign,
            isCurrency: true,
        },
        {
            title: "Laba Bersih",
            value: stats.net_profit,
            trend: stats.net_profit_trend,
            comparisonValue: stats.comparison_net_profit,
            comparisonLabel: stats.comparison_label,
            icon: TrendingUp,
            isCurrency: true,
        },
        {
            title: "Produk Terjual",
            value: stats.products_sold,
            trend: stats.products_sold_trend,
            comparisonValue: stats.comparison_products_sold,
            comparisonLabel: stats.comparison_label,
            icon: Package,
            isCurrency: false,
        },
        {
            title: "Rata-rata Transaksi",
            value: stats.avg_transaction,
            trend: stats.avg_transaction_trend,
            comparisonValue: stats.comparison_avg_transaction,
            comparisonLabel: stats.comparison_label,
            icon: ReceiptText,
            isCurrency: true,
        },
    ];

    const miniStats = [
        {
            label: "Saldo Kas Toko",
            value: stats.cash_balance,
            subValue: "Total pendapatan bersih",
            isCurrency: true,
            icon: Landmark,
            iconColor: "text-slate-600 dark:text-slate-400",
        },
        {
            label: "Saldo Dompet Owner",
            value: stats.wallet_balance,
            subValue: "Saldo yang bisa ditarik",
            isCurrency: true,
            icon: Wallet,
            iconColor: "text-emerald-600 dark:text-emerald-400",
        },
        {
            label: "Total Pengeluaran Bulan Ini",
            value: stats.monthly_expense,
            subValue: "Termasuk semua jenis pengeluaran",
            isCurrency: true,
            icon: ArrowLeftRight,
            iconColor: "text-red-500 dark:text-red-400",
        },
        {
            label: "Total Penarikan Owner",
            value: stats.total_withdrawal,
            subValue: "Bulan ini",
            isCurrency: true,
            icon: ArrowLeftRight,
            iconColor: "text-orange-500 dark:text-orange-400",
        },
    ];

    return (
        <>
            <Head title="Dashboard | Owner" />

            <div className="space-y-5 p-4 lg:p-6">
                <div>
                    <h1 className="text-xl font-bold tracking-tight lg:text-2xl text-foreground">
                        Selamat datang, {store?.name ?? "Owner"}!
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Ringkasan performa toko
                    </p>
                </div>

                <div>
                    <DateRangePicker
                        value={datePickerValue}
                        onChange={handleDateRangeChange}
                    />
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

                <MonthlyRevenueChart data={memoizedMonthlyRevenue} />

                <SalesChart
                    data={memoizedSalesChart}
                    selectedMonth={salesMonth}
                    availableMonths={memoizedAvailableMonths}
                    onMonthChange={handleSalesMonthChange}
                />

                <div className="grid gap-4 md:grid-cols-2">
                    <DailyProductChart
                        data={memoizedDailyProduct}
                        selectedMonth={productMonth}
                        availableMonths={memoizedAvailableMonths}
                        onMonthChange={handleProductMonthChange}
                    />
                    <CustomerTransactionChart
                        data={memoizedCustomerTransaction}
                        selectedMonth={customerMonth}
                        availableMonths={memoizedAvailableMonths}
                        onMonthChange={handleCustomerMonthChange}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <TopProducts products={memoizedTopProducts} />
                    <LowStockAlert
                        products={memoizedLowStock}
                        totalLowStock={product_stats.total_low_stock}
                    />
                    <ExpenseBreakdown
                        expenses={memoizedExpenses}
                        totalExpense={stats.monthly_expense}
                    />
                </div>

                <RecentTransactions transactions={memoizedRecentTransactions} />

                <ProductSummaryCards
                    productStats={product_stats}
                    averageMargin={stats.average_margin}
                    netProfit={stats.net_profit_month}
                />
            </div>
        </>
    );
});

export default Dashboard;

Dashboard.layout = (page) => <AppLayout>{page}</AppLayout>;
