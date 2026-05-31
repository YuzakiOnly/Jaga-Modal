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
import { fmt, fmtNum } from "../../../lib/cashier/dashboard";

export default function CashierDashboard({
    stats,
    sales_chart,
    recent_transactions,
    filters,
    available_months,
}) {
    const { auth } = usePage().props;
    const firstName = auth?.user?.name?.split(" ")[0] ?? "Kasir";
    const [period, setPeriod] = useState(filters?.period ?? "hari_ini");
    const [selectedMonth, setSelectedMonth] = useState(
        filters?.month ?? new Date().toISOString().slice(0, 7),
    );

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
            },
            minggu_ini: {
                revenue: stats.weekly_revenue,
                transactions: stats.weekly_transactions,
                products_sold: stats.weekly_products_sold,
                expense: stats.weekly_expense,
                net: stats.weekly_net,
            },
            bulan_ini: {
                revenue: stats.monthly_revenue,
                transactions: stats.monthly_transactions,
                products_sold: stats.monthly_products_sold,
                expense: stats.monthly_expense,
                net: stats.monthly_net,
            },
        };
        return map[period] ?? map.hari_ini;
    };

    const currentStats = getCurrentStats();

    const periodSubLabel = {
        hari_ini: "vs kemarin",
        minggu_ini: "7 hari",
        bulan_ini: "30 hari",
    };

    const periodItemLabel = {
        hari_ini: "hari ini",
        minggu_ini: "minggu ini",
        bulan_ini: "bulan ini",
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
                            <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="font-medium truncate max-w-[140px] sm:max-w-none">
                                {today}
                            </span>
                        </div>
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
                            sub={periodSubLabel[period]}
                            icon={BadgeDollarSign}
                            trend={stats.revenue_trend}
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
                            sub={
                                currentStats.net >= 0
                                    ? `Net +${fmt(currentStats.net)}`
                                    : `Net ${fmt(currentStats.net)}`
                            }
                            icon={Wallet}
                        />
                    </div>

                    <MiniBarChart
                        data={sales_chart}
                        selectedMonth={selectedMonth}
                        onMonthChange={handleMonthChange}
                        availableMonths={available_months}
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
