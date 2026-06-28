// resources/js/pages/cashier/dashboard/page.jsx
import { Head, usePage, router } from "@inertiajs/react";
import { useState } from "react";
import {
    BadgeDollarSign,
    Receipt,
    Wallet,
    Package,
    CalendarDays,
    Landmark,
} from "lucide-react";
import CashierLayout from "@/layouts/CashierLayout";
import StatCard from "./_components/StatCard";
import MiniBarChart from "./_components/MiniBarChart";
import RecentTransactions from "./_components/RecentTransactions";
import { fmt, fmtNum } from "@/lib/cashier/dashboard";

import { useSmartRefresh } from "@/hooks/useSmartRefresh";
import { refreshConfigs } from "@/hooks/refreshConfig";

export default function CashierDashboard({
    stats,
    sales_chart,
    recent_transactions,
    filters,
    available_months,
    current_month_name,
}) {
    const { auth } = usePage().props;
    const firstName = auth?.user?.name?.split(" ")[0] ?? "Kasir";
    const [period, setPeriod] = useState(filters?.period ?? "hari_ini");
    const [selectedMonth, setSelectedMonth] = useState(
        filters?.month ?? new Date().toISOString().slice(0, 7),
    );

    useSmartRefresh({ ...refreshConfigs.cashier_dashboard });

    const today = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        router.get(
            route("cashier.dashboard"),
            { period: newPeriod, month: selectedMonth },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleMonthChange = (newMonth) => {
        setSelectedMonth(newMonth);
        router.get(
            route("cashier.dashboard"),
            { period, month: newMonth },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const getCurrentStats = () => {
        const map = {
            hari_ini: {
                revenue: stats.today_revenue,
                transactions: stats.today_transactions,
                products_sold: stats.today_products_sold,
                expense: stats.today_expense,
                net: stats.today_net,
                previous_revenue: stats.today_previous_revenue,
                previous_expense: stats.today_previous_expense,
                previous_label: stats.today_previous_label,
            },
            minggu_ini: {
                revenue: stats.weekly_revenue,
                transactions: stats.weekly_transactions,
                products_sold: stats.weekly_products_sold,
                expense: stats.weekly_expense,
                net: stats.weekly_net,
                previous_revenue: stats.weekly_previous_revenue,
                previous_expense: stats.weekly_previous_expense,
                previous_label: stats.weekly_previous_label,
            },
            bulan_ini: {
                revenue: stats.monthly_revenue,
                transactions: stats.monthly_transactions,
                products_sold: stats.monthly_products_sold,
                expense: stats.monthly_expense,
                net: stats.monthly_net,
                previous_revenue: stats.monthly_previous_revenue,
                previous_expense: stats.monthly_previous_expense,
                previous_label: stats.monthly_previous_label,
            },
        };
        return map[period] ?? map.hari_ini;
    };

    const currentStats = getCurrentStats();

    const periodSubLabel = {
        hari_ini: "vs kemarin",
        minggu_ini: "vs minggu lalu",
        bulan_ini: "vs bulan lalu",
    };

    const periodItemLabel = {
        hari_ini: "hari ini",
        minggu_ini: "minggu ini",
        bulan_ini: "bulan ini",
    };

    const revenueTrend = (() => {
        const t = stats.revenue_trend;
        if (t == null) return null;
        if (typeof t === "object") return t[period] ?? null;
        return period === "hari_ini" ? t : null;
    })();

    const formatSubWithPrevious = () => {
        const previousRevenue = currentStats.previous_revenue;
        const previousRevenueValue =
            previousRevenue !== undefined && previousRevenue !== null
                ? previousRevenue
                : 0;

        return `${periodSubLabel[period]} (${fmt(previousRevenueValue)})`;
    };

    const formatExpenseSub = () => {
        const net = currentStats.net;
        const previousExpense = currentStats.previous_expense;
        const previousExpenseValue =
            previousExpense !== undefined && previousExpense !== null
                ? previousExpense
                : 0;

        if (net >= 0) {
            return `Net +${fmt(currentStats.net)} (${currentStats.previous_label} expense ${fmt(previousExpenseValue)})`;
        }
        return `Net ${fmt(currentStats.net)} (${currentStats.previous_label} expense ${fmt(previousExpenseValue)})`;
    };

    return (
        <CashierLayout>
            <Head title="Dashboard | JagaModal" />

            <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-slate-50/80">
                <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
                                    Selamat datang
                                </p>
                                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                    {firstName} 👋
                                </h1>
                            </div>
                            <div className="flex items-center gap-4 bg-slate-50 rounded-xl px-4 py-2 border border-slate-200/50">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <CalendarDays className="w-4 h-4 text-slate-400" />
                                    <span className="font-medium truncate max-w-35 sm:max-w-none">
                                        {today}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-1 p-1 bg-white border border-slate-200/80 rounded-xl w-fit">
                            {[
                                { key: "hari_ini", label: "Hari Ini" },
                                { key: "minggu_ini", label: "Minggu Ini" },
                                { key: "bulan_ini", label: "Bulan Ini" },
                            ].map((p) => (
                                <button
                                    key={p.key}
                                    onClick={() => handlePeriodChange(p.key)}
                                    className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all duration-150 ${
                                        period === p.key
                                            ? "bg-emerald-600 text-white shadow-sm"
                                            : "text-slate-400 hover:text-slate-600"
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                            <StatCard
                                label="Saldo Kas Toko"
                                value={fmt(stats.cash_balance)}
                                sub="Uang tunai di toko"
                                icon={Landmark}
                                accent
                            />
                            <StatCard
                                label="Omzet"
                                value={fmt(currentStats.revenue)}
                                sub={formatSubWithPrevious()}
                                icon={BadgeDollarSign}
                                trend={revenueTrend}
                            />
                            <StatCard
                                label="Transaksi"
                                value={fmtNum(currentStats.transactions)}
                                sub={`Rata-rata ${fmt(stats.avg_transaction)}`}
                                icon={Receipt}
                            />
                            <StatCard
                                label="Item Terjual"
                                value={fmtNum(currentStats.products_sold)}
                                sub={periodItemLabel[period]}
                                icon={Package}
                            />
                            <StatCard
                                label="Pengeluaran"
                                value={fmt(currentStats.expense)}
                                sub={formatExpenseSub()}
                                icon={Wallet}
                            />
                        </div>

                        <MiniBarChart
                            data={sales_chart}
                            selectedMonth={selectedMonth}
                            onMonthChange={handleMonthChange}
                            availableMonths={available_months}
                            currentMonthName={current_month_name}
                        />

                        <RecentTransactions
                            transactions={recent_transactions}
                            period={period}
                            onPeriodChange={handlePeriodChange}
                        />
                    </div>
                </div>
            </div>
        </CashierLayout>
    );
}
