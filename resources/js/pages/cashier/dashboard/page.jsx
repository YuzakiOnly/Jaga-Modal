import { Head, usePage, router } from "@inertiajs/react";
import { useState } from "react";
import {
    BadgeDollarSign,
    Receipt,
    Wallet,
    Package,
    CalendarDays,
    Landmark,
    Store,
    Smartphone,
} from "lucide-react";
import CashierLayout from "@/layouts/CashierLayout";
import StatCard from "./_components/StatCard";
import MiniBarChart from "./_components/MiniBarChart";
import RecentTransactions from "./_components/RecentTransactions";
import { fmt, fmtNum } from "@/lib/cashier/dashboard";

import { useSmartRefresh } from "@/hooks/useSmartRefresh";
import { refreshConfigs } from "@/hooks/refreshConfig";

const ONLINE_CHANNELS = [
    {
        key: "grabfood",
        label: "GrabFood",
        color: "bg-green-50",
        textColor: "text-green-700",
        dotColor: "bg-green-500",
    },
    {
        key: "shopeefood",
        label: "ShopeeFood",
        color: "bg-orange-50",
        textColor: "text-orange-600",
        dotColor: "bg-orange-500",
    },
    {
        key: "gobiz",
        label: "GoBiz",
        color: "bg-sky-50",
        textColor: "text-sky-700",
        dotColor: "bg-sky-500",
    },
];

function ChannelBreakdown({ revenueByChannel }) {
    if (!revenueByChannel) return null;

    const dineIn = revenueByChannel["dine_in"] ?? 0;
    const channels = [
        {
            key: "dine_in",
            label: "Dine In",
            revenue: dineIn,
            color: "bg-emerald-50",
            textColor: "text-emerald-700",
            dotColor: "bg-emerald-500",
        },
        ...ONLINE_CHANNELS.map((ch) => ({
            ...ch,
            revenue: revenueByChannel[ch.key] ?? 0,
        })),
    ].filter((ch) => ch.revenue > 0);

    if (channels.length <= 1) return null;

    const total = channels.reduce((s, c) => s + c.revenue, 0);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
            <div className="mb-3">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Omzet per Channel
                </p>
            </div>

            <div className="flex rounded-full overflow-hidden h-2 mb-4 gap-0.5">
                {channels.map((ch) => (
                    <div
                        key={ch.key}
                        className={ch.dotColor}
                        style={{
                            width: `${(ch.revenue / total) * 100}%`,
                            minWidth: "4px",
                        }}
                    />
                ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {channels.map((ch) => (
                    <div key={ch.key} className={`${ch.color} rounded-xl p-3`}>
                        <div className="flex items-center gap-1.5 mb-1">
                            <div
                                className={`w-1.5 h-1.5 rounded-full ${ch.dotColor}`}
                            />
                            <span
                                className={`text-[10px] font-semibold ${ch.textColor}`}
                            >
                                {ch.label}
                            </span>
                        </div>
                        <p className="text-sm font-bold text-gray-800">
                            {fmt(ch.revenue)}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                            {Math.round((ch.revenue / total) * 100)}%
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

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

    const revenueByChannel = (() => {
        const trxList = recent_transactions?.data ?? recent_transactions ?? [];
        const map = {};
        trxList.forEach((trx) => {
            const ch = trx.order_channel ?? "dine_in";
            map[ch] = (map[ch] ?? 0) + (trx.net_revenue ?? trx.total ?? 0);
        });
        return map;
    })();

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

            <div className="h-full overflow-y-auto bg-slate-50">
                <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-5">
                    <div className="flex items-end justify-between gap-2">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
                                Selamat datang
                            </p>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">
                                {firstName} 👋
                            </h1>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-400 bg-white border border-gray-100 rounded-xl px-2.5 sm:px-3 py-2">
                            <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                            <span className="font-medium truncate max-w-35 sm:max-w-none">
                                {today}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-1 p-1 bg-white border border-gray-100 rounded-xl w-fit">
                        {[
                            { key: "hari_ini", label: "Hari Ini" },
                            { key: "minggu_ini", label: "Minggu Ini" },
                            { key: "bulan_ini", label: "Bulan Ini" },
                        ].map((p) => (
                            <button
                                key={p.key}
                                onClick={() => handlePeriodChange(p.key)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                                    period === p.key
                                        ? "bg-emerald-600 text-white shadow-sm"
                                        : "text-gray-400 hover:text-gray-600"
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
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

                    <ChannelBreakdown revenueByChannel={revenueByChannel} />

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
        </CashierLayout>
    );
}
