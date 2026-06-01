import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import {
    TrendingUp,
    ShoppingBag,
    Banknote,
    QrCode,
    ArrowLeft,
    Bike,
    Zap,
    Store,
} from "lucide-react";
import { Link } from "@inertiajs/react";

import AppLayout from "@/layouts/dashboard/AppLayout";
import { Button } from "@/components/ui/button";
import { SummaryCard } from "./_components/SummaryCard";
import { TransactionFilter } from "./_components/TransactionFilter";
import { TransactionList } from "./_components/TransactionList";

const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price);

// Config tiap channel online untuk tampilan summary
const ONLINE_CHANNEL_CONFIG = {
    grabfood: {
        label: "GrabFood",
        icon: Bike,
        color: "text-green-600",
        bg: "bg-green-50 border-green-200",
    },
    shopeefood: {
        label: "ShopeFood",
        icon: Bike,
        color: "text-orange-500",
        bg: "bg-orange-50 border-orange-200",
    },
    gobiz: {
        label: "GoBiz",
        icon: Zap,
        color: "text-emerald-600",
        bg: "bg-emerald-50 border-emerald-200",
    },
};

export default function TransactionHistoryPage({
    transactions,
    summary,
    filters,
    online_channels = [],
}) {
    const [period, setPeriod] = useState(filters?.period ?? "daily");
    const [date, setDate] = useState(
        filters?.date ?? new Date().toISOString().slice(0, 10),
    );
    const [channel, setChannel] = useState(filters?.channel ?? "");

    const applyFilter = (newPeriod, newDate, newChannel) => {
        const params = { period: newPeriod, date: newDate };
        if (newChannel) params.channel = newChannel;
        router.get(route("owner.transactions.history"), params, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePeriodChange = (val) => {
        setPeriod(val);
        applyFilter(val, date, channel);
    };

    const handleDateChange = (e) => {
        setDate(e.target.value);
        applyFilter(period, e.target.value, channel);
    };

    const handleChannelChange = (val) => {
        const newChannel = val === channel ? "" : val; // toggle
        setChannel(newChannel);
        applyFilter(period, date, newChannel);
    };

    // Revenue per channel dari backend
    const revenueByChannel = summary?.revenue_by_channel ?? {};

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
                            Lihat semua transaksi berdasarkan periode & channel
                        </p>
                    </div>
                </div>
                {/* Filter */}
                <TransactionFilter
                    period={period}
                    date={date}
                    channel={channel}
                    onPeriodChange={handlePeriodChange}
                    onDateChange={handleDateChange}
                    onChannelChange={handleChannelChange}
                />

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <SummaryCard
                        icon={TrendingUp}
                        label="Pendapatan Bersih"
                        value={formatPrice(summary.total_net_revenue)}
                        sub={`Fee Platform: ${formatPrice(summary.total_platform_fee)}`}
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
                
                {online_channels.length > 0 && (
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            Saldo Channel Online
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                            {online_channels.map((ch) => {
                                const cfg = ONLINE_CHANNEL_CONFIG[ch];
                                if (!cfg) return null;
                                const Icon = cfg.icon;
                                const count = summary[`${ch}_count`] ?? 0;
                                const revenue = revenueByChannel[ch] ?? 0;
                                return (
                                    <button
                                        key={ch}
                                        onClick={() => handleChannelChange(ch)}
                                        className={`rounded-xl border p-4 flex flex-col gap-2 text-left transition-all ${
                                            channel === ch
                                                ? `${cfg.bg} ring-2 ring-offset-1 ring-current ${cfg.color}`
                                                : "bg-card hover:bg-muted/40"
                                        }`}
                                    >
                                        <div
                                            className={`flex items-center gap-2 ${cfg.color}`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span className="text-xs font-medium uppercase tracking-wide">
                                                {cfg.label}
                                            </span>
                                        </div>
                                        <p
                                            className={`text-xl font-bold tabular-nums ${cfg.color}`}
                                        >
                                            {formatPrice(revenue)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {count} transaksi
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                        {channel && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Menampilkan transaksi{" "}
                                <span className="font-semibold">
                                    {ONLINE_CHANNEL_CONFIG[channel]?.label ??
                                        channel}
                                </span>{" "}
                                saja.{" "}
                                <button
                                    onClick={() => handleChannelChange("")}
                                    className="text-primary underline"
                                >
                                    Tampilkan semua
                                </button>
                            </p>
                        )}
                    </div>
                )}
                <TransactionList transactions={transactions} />
            </div>
        </>
    );
}

TransactionHistoryPage.layout = (page) => <AppLayout>{page}</AppLayout>;
