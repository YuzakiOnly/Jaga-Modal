import { memo, useState } from "react";
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

function formatRp(value) {
    if (!value && value !== 0) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function formatRpShort(value) {
    if (!value && value !== 0) return "0";
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`;
    return value.toString();
}

const PAYMENT_METHODS = [
    { key: "cash", label: "Tunai", color: "#3b82f6" },
    { key: "qris", label: "QRIS", color: "#a855f7" },
];

const chartConfig = Object.fromEntries(
    PAYMENT_METHODS.map(({ key, label, color }) => [key, { label, color }]),
);

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;

    const items = PAYMENT_METHODS.map((ch) => {
        const entry = payload.find((p) => p.dataKey === ch.key);
        return { ...ch, value: entry?.value ?? 0 };
    });

    const total = items.reduce((sum, item) => sum + item.value, 0);

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
                {items.map(({ key, label: name, color, value }) => (
                    <div
                        key={key}
                        className="flex items-center justify-between gap-4 hover:bg-muted/50 px-1 py-0.5 rounded transition-colors duration-150"
                    >
                        <div className="flex items-center gap-2">
                            <span
                                className="inline-block w-3 h-3 rounded-sm shrink-0"
                                style={{ backgroundColor: color }}
                            />
                            <span className="text-muted-foreground">
                                {name}
                            </span>
                        </div>
                        <span className="font-medium text-foreground tabular-nums">
                            {formatRp(value)}
                        </span>
                    </div>
                ))}
                <div className="border-t border-border my-1.5 pt-1.5">
                    <div className="flex items-center justify-between gap-4 hover:bg-muted/50 px-1 py-0.5 rounded transition-colors duration-150">
                        <span className="font-semibold text-foreground">
                            Total Omzet
                        </span>
                        <span className="font-bold text-emerald-600 tabular-nums text-sm">
                            {formatRp(total)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SalesChartComponent({
    data,
    selectedMonth,
    availableMonths,
    onMonthChange,
}) {
    const isEmpty = !data || data.length === 0;
    const totalRevenue =
        data?.reduce((sum, d) => sum + (d.revenue ?? 0), 0) ?? 0;

    const chartData =
        data?.map((d) => ({
            date: parseInt(d.date),
            dateLabel: d.date,
            cash: d.cash ?? 0,
            qris: d.qris ?? 0,
            revenue: d.revenue ?? 0,
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

    return (
        <Card className="border-border hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <CardTitle className="text-base hover:text-primary transition-colors duration-200">
                        Grafik Penjualan
                    </CardTitle>
                    <CardDescription className="mt-0.5">
                        Per hari ·{" "}
                        <span className="font-medium text-foreground hover:text-emerald-600 transition-colors duration-200">
                            {formatRp(totalRevenue)}
                        </span>{" "}
                        pendapatan {monthName.toLowerCase()}
                    </CardDescription>
                </div>
                {availableMonths?.length > 0 && (
                    <Select value={selectedMonth} onValueChange={onMonthChange}>
                        <SelectTrigger className="w-full sm:w-[160px] shrink-0 text-sm hover:border-primary transition-colors duration-200">
                            <SelectValue placeholder="Pilih bulan" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableMonths.map((m, index) => (
                                <SelectItem
                                    key={`sales-${m.value}-${index}`}
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
                        Belum ada data penjualan
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
                                    {PAYMENT_METHODS.map(({ key, color }) => (
                                        <linearGradient
                                            key={key}
                                            id={`gradient-${key}`}
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor={color}
                                                stopOpacity={0.3}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor={color}
                                                stopOpacity={0.02}
                                            />
                                        </linearGradient>
                                    ))}
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
                                    tickFormatter={formatRpShort}
                                    tickLine={false}
                                    axisLine={false}
                                    width={44}
                                />
                                <Tooltip
                                    cursor={{
                                        stroke: "var(--border)",
                                        strokeWidth: 1,
                                    }}
                                    content={<CustomTooltip />}
                                />
                                <ChartLegend content={<ChartLegendContent />} />
                                {PAYMENT_METHODS.map(({ key, color }) => (
                                    <Area
                                        key={key}
                                        type="monotone"
                                        dataKey={key}
                                        stroke={color}
                                        strokeWidth={2}
                                        fill={`url(#gradient-${key})`}
                                        dot={false}
                                        activeDot={false}
                                    />
                                ))}
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}

export default memo(SalesChartComponent);
