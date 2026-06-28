import { router } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

function formatNum(value) {
    if (!value && value !== 0) return "0";
    return new Intl.NumberFormat("id-ID").format(value);
}

// TOOLTIP CUSTOM DENGAN HOVER EFFECT
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;

    const customersData = payload.find((p) => p.dataKey === "customers");
    const transactionsData = payload.find((p) => p.dataKey === "transactions");

    const dateObj = new Date();
    dateObj.setDate(parseInt(label));
    const monthName = dateObj.toLocaleDateString("id-ID", { month: "long" });
    const dayName = dateObj.toLocaleDateString("id-ID", { weekday: "long" });

    return (
        <div className="rounded-lg border border-border bg-background shadow-lg px-4 py-3 text-xs min-w-[220px] transition-all duration-200 hover:shadow-xl">
            <p className="font-semibold text-foreground text-sm mb-2">
                {dayName}, {label} {monthName}
            </p>
            <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-4 hover:bg-muted/50 px-1 py-0.5 rounded transition-colors duration-150">
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 rounded-sm shrink-0 bg-purple-500" />
                        <span className="text-muted-foreground">
                            Pelanggan Unik
                        </span>
                    </div>
                    <span className="font-medium text-foreground tabular-nums">
                        {formatNum(customersData?.value ?? 0)} orang
                    </span>
                </div>
                <div className="flex items-center justify-between gap-4 hover:bg-muted/50 px-1 py-0.5 rounded transition-colors duration-150">
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 rounded-sm shrink-0 bg-amber-500" />
                        <span className="text-muted-foreground">Transaksi</span>
                    </div>
                    <span className="font-bold text-amber-600 tabular-nums">
                        {formatNum(transactionsData?.value ?? 0)} transaksi
                    </span>
                </div>
                {customersData?.value > 0 && (
                    <div className="border-t border-border my-1.5 pt-1.5">
                        <div className="flex items-center justify-between gap-4 hover:bg-muted/50 px-1 py-0.5 rounded transition-colors duration-150">
                            <span className="text-muted-foreground">
                                Rata-rata per pelanggan
                            </span>
                            <span className="font-medium text-foreground tabular-nums">
                                {(
                                    (transactionsData?.value ?? 0) /
                                    (customersData?.value ?? 1)
                                ).toFixed(1)}{" "}
                                transaksi
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CustomerTransactionChart({
    data,
    selectedMonth,
    availableMonths,
    onMonthChange,
}) {
    const isEmpty = !data || data.length === 0;
    const totalCustomers =
        data?.reduce((sum, d) => sum + (d.unique_customers ?? 0), 0) ?? 0;
    const totalTransactions =
        data?.reduce((sum, d) => sum + (d.transactions ?? 0), 0) ?? 0;

    const chartData =
        data?.map((d) => ({
            date: parseInt(d.date),
            dateLabel: d.date,
            customers: d.unique_customers ?? 0,
            transactions: d.transactions ?? 0,
        })) ?? [];

    const totalDays = chartData.length;

    const getTickCount = () => {
        if (totalDays <= 10) return totalDays;
        if (totalDays <= 20) return 10;
        if (totalDays <= 25) return 12;
        return 15;
    };

    const formatDateLabel = (value) => value.toString();

    const selectedMonthDate = new Date(selectedMonth + "-01");
    const monthName = selectedMonthDate.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
    });

    const chartConfig = {
        customers: { label: "Pelanggan Unik", color: "#a855f7" },
        transactions: { label: "Transaksi", color: "#f59e0b" },
    };

    return (
        <Card className="hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <CardTitle className="text-base hover:text-primary transition-colors duration-200">
                        Pelanggan & Transaksi per Hari
                    </CardTitle>
                    <CardDescription className="mt-0.5">
                        Total{" "}
                        <span className="font-medium hover:text-purple-600 transition-colors duration-200">
                            {formatNum(totalCustomers)}
                        </span>{" "}
                        pelanggan ·{" "}
                        <span className="font-medium hover:text-amber-600 transition-colors duration-200">
                            {formatNum(totalTransactions)}
                        </span>{" "}
                        transaksi · {monthName}
                    </CardDescription>
                </div>
                {availableMonths?.length > 0 && (
                    <Select value={selectedMonth} onValueChange={onMonthChange}>
                        <SelectTrigger className="w-full sm:w-[160px] shrink-0 text-sm hover:border-primary transition-colors duration-200">
                            <SelectValue placeholder="Pilih bulan" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableMonths.map((m) => (
                                <SelectItem
                                    key={m.value}
                                    value={m.value}
                                    className="hover:bg-primary/10 transition-colors duration-150"
                                >
                                    {m.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </CardHeader>
            <CardContent className="pt-2 pb-4 px-2 sm:px-6">
                {isEmpty ? (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                        Belum ada data transaksi
                    </div>
                ) : (
                    <ChartContainer
                        config={chartConfig}
                        className="h-[320px] w-full"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{
                                    top: 10,
                                    right: 8,
                                    left: 0,
                                    bottom: 5,
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="gradient-customers"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#a855f7"
                                            stopOpacity={0.3}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#a855f7"
                                            stopOpacity={0.02}
                                        />
                                    </linearGradient>
                                    <linearGradient
                                        id="gradient-transactions"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#f59e0b"
                                            stopOpacity={0.3}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#f59e0b"
                                            stopOpacity={0.02}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="var(--border)"
                                />
                                <XAxis
                                    dataKey="date"
                                    type="number"
                                    domain={[1, totalDays]}
                                    tickCount={getTickCount()}
                                    tick={{ fontSize: 9 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={formatDateLabel}
                                />
                                <YAxis
                                    tick={{ fontSize: 10 }}
                                    tickFormatter={(v) => formatNum(v)}
                                    tickLine={false}
                                    axisLine={false}
                                    width={44}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Area
                                    type="monotone"
                                    dataKey="customers"
                                    name="Pelanggan Unik"
                                    stroke="#a855f7"
                                    strokeWidth={2}
                                    fill="url(#gradient-customers)"
                                    dot={false}
                                    activeDot={{
                                        r: 4,
                                        strokeWidth: 0,
                                        fill: "#a855f7",
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="transactions"
                                    name="Transaksi"
                                    stroke="#f59e0b"
                                    strokeWidth={2}
                                    fill="url(#gradient-transactions)"
                                    dot={false}
                                    activeDot={{
                                        r: 4,
                                        strokeWidth: 0,
                                        fill: "#f59e0b",
                                    }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
