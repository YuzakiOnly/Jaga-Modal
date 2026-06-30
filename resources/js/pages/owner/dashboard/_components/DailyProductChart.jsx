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

function formatNum(value) {
    if (!value && value !== 0) return "0";
    return new Intl.NumberFormat("id-ID").format(value);
}

function formatRpShort(value) {
    if (!value && value !== 0) return "0";
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`;
    return value.toString();
}

// TOOLTIP CUSTOM DENGAN HOVER EFFECT
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;

    const quantityData = payload.find((p) => p.dataKey === "quantity");
    const revenueData = payload.find((p) => p.dataKey === "revenue");

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
                        <span className="inline-block w-3 h-3 rounded-sm shrink-0 bg-blue-500" />
                        <span className="text-muted-foreground">
                            Jumlah Produk
                        </span>
                    </div>
                    <span className="font-medium text-foreground tabular-nums">
                        {formatNum(quantityData?.value ?? 0)} unit
                    </span>
                </div>
                <div className="flex items-center justify-between gap-4 hover:bg-muted/50 px-1 py-0.5 rounded transition-colors duration-150">
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 rounded-sm shrink-0 bg-green-500" />
                        <span className="text-muted-foreground">
                            Pendapatan
                        </span>
                    </div>
                    <span className="font-bold text-emerald-600 tabular-nums">
                        {formatRp(revenueData?.value ?? 0)}
                    </span>
                </div>
                {quantityData?.value > 0 && (
                    <div className="border-t border-border my-1.5 pt-1.5">
                        <div className="flex items-center justify-between gap-4 hover:bg-muted/50 px-1 py-0.5 rounded transition-colors duration-150">
                            <span className="text-muted-foreground">
                                Rata-rata per unit
                            </span>
                            <span className="font-medium text-foreground tabular-nums">
                                {formatRp(
                                    (revenueData?.value ?? 0) /
                                        (quantityData?.value ?? 1),
                                )}
                            </span>
                        </div>
                    </div>
                )}
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
        <Card className="hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <CardTitle className="text-base hover:text-primary transition-colors duration-200">
                        Penjualan Produk per Hari
                    </CardTitle>
                    <CardDescription className="mt-0.5">
                        Total{" "}
                        <span className="font-medium hover:text-blue-600 transition-colors duration-200">
                            {formatNum(totalProducts)}
                        </span>{" "}
                        produk terjual ·{" "}
                        <span className="font-medium hover:text-emerald-600 transition-colors duration-200">
                            {formatRp(totalRevenue)}
                        </span>{" "}
                        · {monthName}
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
                                    key={`product-${m.value}-${index}`}
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
                            <LineChart
                                data={chartData}
                                margin={{
                                    top: 10,
                                    right: 8,
                                    left: 0,
                                    bottom: 5,
                                }}
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
                                    tickFormatter={formatRpShort}
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
                        </ResponsiveContainer>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
