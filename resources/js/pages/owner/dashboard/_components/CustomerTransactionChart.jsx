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
} from "recharts";

function formatNum(value) {
    if (!value && value !== 0) return "0";
    return new Intl.NumberFormat("id-ID").format(value);
}

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="rounded-lg border border-border bg-background shadow-md px-3 py-2 text-xs min-w-[180px]">
            <p className="font-semibold text-foreground mb-1.5">
                Tanggal {label}
            </p>
            <div className="space-y-1">
                {payload.map((entry, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between gap-3"
                    >
                        <div className="flex items-center gap-1.5">
                            <span
                                className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-muted-foreground">
                                {entry.name}
                            </span>
                        </div>
                        <span className="font-medium text-foreground tabular-nums">
                            {formatNum(entry.value)}
                        </span>
                    </div>
                ))}
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
        <Card>
            <CardHeader className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <CardTitle className="text-base">
                        Pelanggan & Transaksi per Hari
                    </CardTitle>
                    <CardDescription className="mt-0.5">
                        Total {formatNum(totalCustomers)} pelanggan ·{" "}
                        {formatNum(totalTransactions)} transaksi · {monthName}
                    </CardDescription>
                </div>
                {availableMonths?.length > 0 && (
                    <Select value={selectedMonth} onValueChange={onMonthChange}>
                        <SelectTrigger className="w-full sm:w-[160px] shrink-0 text-sm">
                            <SelectValue placeholder="Pilih bulan" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableMonths.map((m) => (
                                <SelectItem key={m.value} value={m.value}>
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
                        <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 8, left: 0, bottom: 5 }}
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
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
