import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AppLayout from "@/layouts/dashboard/AppLayout";
import { DollarSign, TrendingUp, Package, ReceiptText } from "lucide-react";

import StatCard from "./_components/StatCard";
import MiniStatCard from "./_components/MiniStatCard";
import SalesChart from "./_components/SalesChart";
import TopProducts from "./_components/TopProducts";
import LowStockAlert from "./_components/LowStockAlert";
import ExpenseBreakdown from "./_components/ExpenseBreakdown";
import RecentTransactions from "./_components/RecentTransactions";
import ProductSummaryCards from "./_components/ProductSummaryCards";
import ComparisonSelector from "./_components/ComparisonSelector";

export default function Dashboard({
    store,
    stats,
    comparison_data,
    sales_chart,
    top_products,
    low_stock_products,
    recent_transactions,
    expense_by_type,
    product_stats,
    selected_month,
    available_months,
}) {
    const [comparison, setComparison] = useState(
        new URLSearchParams(window.location.search).get("comparison") ||
            "last_month",
    );

    const revenueTrend =
        stats.monthly_revenue > 0 && comparison_data?.revenue > 0
            ? Math.round(
                  ((stats.monthly_revenue - comparison_data.revenue) /
                      comparison_data.revenue) *
                      100,
              )
            : stats.monthly_revenue > 0 && comparison_data?.revenue === 0
              ? 100
              : stats.monthly_revenue === 0 && comparison_data?.revenue > 0
                ? -100
                : 0;

    const netProfitTrend =
        stats.net_profit > 0 && comparison_data?.net_profit > 0
            ? Math.round(
                  ((stats.net_profit - comparison_data.net_profit) /
                      comparison_data.net_profit) *
                      100,
              )
            : stats.net_profit > 0 && comparison_data?.net_profit === 0
              ? 100
              : stats.net_profit === 0 && comparison_data?.net_profit > 0
                ? -100
                : stats.net_profit < 0 && comparison_data?.net_profit < 0
                  ? (() => {
                        const diff =
                            stats.net_profit - comparison_data.net_profit;
                        if (diff > 0)
                            return Math.round(
                                (diff / Math.abs(comparison_data.net_profit)) *
                                    100,
                            );
                        if (diff < 0)
                            return -Math.round(
                                (Math.abs(diff) /
                                    Math.abs(comparison_data.net_profit)) *
                                    100,
                            );
                        return 0;
                    })()
                  : stats.net_profit > comparison_data?.net_profit
                    ? 100
                    : stats.net_profit < comparison_data?.net_profit
                      ? -100
                      : 0;

    const productsSoldTrend =
        stats.total_products_sold > 0 && comparison_data?.products_sold > 0
            ? Math.round(
                  ((stats.total_products_sold - comparison_data.products_sold) /
                      comparison_data.products_sold) *
                      100,
              )
            : stats.total_products_sold > 0 &&
                comparison_data?.products_sold === 0
              ? 100
              : stats.total_products_sold === 0 &&
                  comparison_data?.products_sold > 0
                ? -100
                : 0;

    const avgTransactionTrend =
        stats.avg_transaction > 0 && comparison_data?.avg_transaction > 0
            ? Math.round(
                  ((stats.avg_transaction - comparison_data.avg_transaction) /
                      comparison_data.avg_transaction) *
                      100,
              )
            : stats.avg_transaction > 0 &&
                comparison_data?.avg_transaction === 0
              ? 100
              : stats.avg_transaction === 0 &&
                  comparison_data?.avg_transaction > 0
                ? -100
                : 0;

    const summaryCards = [
        {
            title: "Omset",
            value: stats.monthly_revenue,
            trend: revenueTrend,
            comparisonValue: comparison_data?.revenue,
            comparisonLabel: comparison_data?.label,
            icon: DollarSign,
            isCurrency: true,
        },
        {
            title: "Laba Bersih",
            value: stats.net_profit,
            trend: netProfitTrend,
            comparisonValue: comparison_data?.net_profit,
            comparisonLabel: comparison_data?.label,
            icon: TrendingUp,
            isCurrency: true,
        },
        {
            title: "Produk Terjual",
            value: stats.total_products_sold,
            trend: productsSoldTrend,
            comparisonValue: comparison_data?.products_sold,
            comparisonLabel: comparison_data?.label,
            icon: Package,
            isCurrency: false,
        },
        {
            title: "Rata-rata Transaksi",
            value: stats.avg_transaction,
            trend: avgTransactionTrend,
            comparisonValue: comparison_data?.avg_transaction,
            comparisonLabel: comparison_data?.label,
            icon: ReceiptText,
            isCurrency: true,
        },
    ];

    const handleComparisonChange = (value) => {
        setComparison(value);
        const url = new URL(window.location.href);
        url.searchParams.set("comparison", value);
        router.get(url.pathname + url.search, {}, { preserveState: true });
    };

    const miniStats = [
        {
            label: "Saldo Kas Toko",
            value: stats.cash_balance,
            subValue: "Uang tunai di toko",
            isCurrency: true,
        },
        {
            label: "Saldo Dompet Owner",
            value: stats.wallet_balance,
            subValue: "Penarikan dari toko",
            isCurrency: true,
        },
        {
            label: "Total Pengeluaran",
            value: stats.monthly_expense,
            subValue: "Termasuk penarikan owner",
            isCurrency: true,
        },
        {
            label: "Penarikan Owner",
            value: stats.total_withdrawal,
            subValue: "Bulan ini",
            isCurrency: true,
        },
    ];

    return (
        <>
            <Head title="Dashboard | Owner" />

            <div className="space-y-5 p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">
                            Selamat datang, {store?.name ?? "Owner"}!
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Ringkasan performa toko bulan ini
                        </p>
                    </div>

                    <ComparisonSelector
                        value={comparison}
                        onChange={handleComparisonChange}
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

                <SalesChart
                    data={sales_chart}
                    selectedMonth={selected_month}
                    availableMonths={available_months}
                />

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
                    netProfit={stats.net_profit}
                />
            </div>
        </>
    );
}

Dashboard.layout = (page) => <AppLayout>{page}</AppLayout>;
