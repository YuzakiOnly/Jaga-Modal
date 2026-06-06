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
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
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
                            {entry.name === "Pendapatan"
                                ? formatRp(entry.value)
                                : formatNum(entry.value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function DailyProductChart({
    data,
    selectedMonth,
    availableMonths,
    onMonthChange,
}) {
    const isEmpty = !data || data.length === 0;
    const totalProducts =
        data?.reduce((sum, d) => sum + (d.total_quantity ?? 0), 0) ?? 0;
    const totalRevenue =
        data?.reduce((sum, d) => sum + (d.total_revenue ?? 0), 0) ?? 0;

    const chartData =
        data?.map((d) => ({
            date: parseInt(d.date),
            dateLabel: d.date,
            quantity: d.total_quantity ?? 0,
            revenue: d.total_revenue ?? 0,
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
        quantity: { label: "Jumlah Produk", color: "#3b82f6" },
        revenue: { label: "Pendapatan", color: "#22c55e" },
    };

    return (
        <Card>
            <CardHeader className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <CardTitle className="text-base">
                        Penjualan Produk per Hari
                    </CardTitle>
                    <CardDescription className="mt-0.5">
                        Total {formatNum(totalProducts)} produk terjual ·{" "}
                        {formatRp(totalRevenue)} · {monthName}
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
                        Belum ada data penjualan
                    </div>
                ) : (
                    <ChartContainer
                        config={chartConfig}
                        className="h-[320px] w-full"
                    >
                        <LineChart
                            data={chartData}
                            margin={{ top: 10, right: 8, left: 0, bottom: 5 }}
                        >
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
                                yAxisId="left"
                                tick={{ fontSize: 10 }}
                                tickFormatter={(v) => formatNum(v)}
                                tickLine={false}
                                axisLine={false}
                                width={44}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fontSize: 10 }}
                                tickFormatter={(v) =>
                                    v >= 1_000_000
                                        ? `${(v / 1_000_000).toFixed(1)}jt`
                                        : v >= 1_000
                                          ? `${(v / 1_000).toFixed(0)}rb`
                                          : v
                                }
                                tickLine={false}
                                axisLine={false}
                                width={44}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="quantity"
                                name="Jumlah Produk"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ r: 3, fill: "#3b82f6" }}
                                activeDot={{ r: 5 }}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="revenue"
                                name="Pendapatan"
                                stroke="#22c55e"
                                strokeWidth={2}
                                dot={{ r: 3, fill: "#22c55e" }}
                                activeDot={{ r: 5 }}
                            />
                        </LineChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
