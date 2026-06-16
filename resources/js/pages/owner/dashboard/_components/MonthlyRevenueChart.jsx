import { useState, useMemo, memo } from "react";
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
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
} from "recharts";

const MONTH_NAMES = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
];

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
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}M`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`;
    return value.toString();
}

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0]?.payload;
    return (
        <div className="rounded-lg border border-border bg-background shadow-md px-3 py-2 text-xs min-w-[200px]">
            <p className="font-semibold text-foreground mb-1.5">
                {data?.monthLabel}
            </p>
            <div className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Omzet</span>
                    <span className="font-bold text-foreground tabular-nums">
                        {formatRp(data?.revenue ?? 0)}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Laba Bersih</span>
                    <span className="font-medium text-emerald-600 tabular-nums">
                        {formatRp(data?.net_profit ?? 0)}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Transaksi</span>
                    <span className="font-medium text-foreground tabular-nums">
                        {new Intl.NumberFormat("id-ID").format(
                            data?.transactions ?? 0,
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
}

const chartConfig = {
    revenue: { label: "Omzet", color: "#10b981" },
    net_profit: { label: "Laba Bersih", color: "#3b82f6" },
};

function MonthlyRevenueChartComponent({ data }) {
    const years = useMemo(() => {
        if (!data || data.length === 0) return [new Date().getFullYear()];
        const ys = [...new Set(data.map((d) => d.year))].sort((a, b) => b - a);
        return ys;
    }, [data]);

    const [selectedYear, setSelectedYear] = useState(String(years[0]));

    const filteredData = useMemo(() => {
        const yearNum = parseInt(selectedYear);
        const byMonth = {};
        (data ?? [])
            .filter((d) => d.year === yearNum)
            .forEach((d) => {
                byMonth[d.month] = d;
            });

        return Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            const row = byMonth[month];
            return {
                month,
                monthLabel: `${MONTH_NAMES[i]} ${selectedYear}`,
                shortLabel: MONTH_NAMES[i],
                revenue: row?.revenue ?? 0,
                net_profit: row?.net_profit ?? 0,
                transactions: row?.transactions ?? 0,
            };
        });
    }, [data, selectedYear]);

    const yearTotal = useMemo(
        () => filteredData.reduce((sum, d) => sum + d.revenue, 0),
        [filteredData],
    );
    const yearProfit = useMemo(
        () => filteredData.reduce((sum, d) => sum + d.net_profit, 0),
        [filteredData],
    );
    const allTimeTotal = useMemo(
        () => (data ?? []).reduce((sum, d) => sum + (d.revenue ?? 0), 0),
        [data],
    );

    const maxRevenue = useMemo(
        () => Math.max(...filteredData.map((d) => d.revenue), 1),
        [filteredData],
    );

    const isEmpty = yearTotal === 0;

    return (
        <div className="chart-container">
            <Card className="border-border">
                <CardHeader className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <CardTitle className="text-base">
                            Grafik Omzet Bulanan
                        </CardTitle>
                        <CardDescription className="mt-0.5">
                            Omzet per bulan ·{" "}
                            <span className="font-medium text-foreground">
                                {formatRp(yearTotal)}
                            </span>{" "}
                            total {selectedYear}
                        </CardDescription>
                    </div>
                    {years.length > 0 && (
                        <Select
                            value={selectedYear}
                            onValueChange={setSelectedYear}
                        >
                            <SelectTrigger className="w-full sm:w-[130px] shrink-0 text-sm">
                                <SelectValue placeholder="Pilih tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((y) => (
                                    <SelectItem key={y} value={String(y)}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </CardHeader>

                <CardContent className="pt-2 pb-4 px-2 sm:px-6">
                    <div className="flex gap-3 flex-wrap mb-4">
                        <div className="flex flex-col gap-0.5 rounded-xl border border-border bg-muted/30 px-4 py-2.5 min-w-[120px]">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                                Total Omzet {selectedYear}
                            </p>
                            <p className="text-base font-bold tabular-nums">
                                {formatRp(yearTotal)}
                            </p>
                        </div>
                        <div className="flex flex-col gap-0.5 rounded-xl border border-border bg-muted/30 px-4 py-2.5 min-w-[120px]">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                                Laba {selectedYear}
                            </p>
                            <p className="text-base font-bold tabular-nums text-emerald-600">
                                {formatRp(yearProfit)}
                            </p>
                        </div>
                        <div className="flex flex-col gap-0.5 rounded-xl border border-border bg-muted/30 px-4 py-2.5 min-w-[120px]">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                                Total Semua Waktu
                            </p>
                            <p className="text-base font-bold tabular-nums">
                                {formatRp(allTimeTotal)}
                            </p>
                        </div>
                    </div>

                    {isEmpty ? (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                            Belum ada data omset untuk {selectedYear}
                        </div>
                    ) : (
                        <ChartContainer
                            config={chartConfig}
                            className="h-[300px] w-full select-none! chart-container"
                        >
                            <BarChart
                                data={filteredData}
                                margin={{
                                    top: 10,
                                    right: 8,
                                    left: 0,
                                    bottom: 5,
                                }}
                                barGap={3}
                                barCategoryGap="25%"
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="var(--border)"
                                />
                                <XAxis
                                    dataKey="shortLabel"
                                    tick={{ fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 10 }}
                                    tickFormatter={formatRpShort}
                                    tickLine={false}
                                    axisLine={false}
                                    width={48}
                                />
                                <Tooltip
                                    cursor={{
                                        fill: "var(--muted)",
                                        opacity: 0.5,
                                    }}
                                    content={CustomTooltip}
                                />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar
                                    dataKey="revenue"
                                    name="Omzet"
                                    fill="#10b981"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={40}
                                >
                                    {filteredData.map((entry, index) => (
                                        <Cell
                                            key={index}
                                            fill={
                                                entry.revenue === maxRevenue &&
                                                entry.revenue > 0
                                                    ? "#059669"
                                                    : "#10b981"
                                            }
                                        />
                                    ))}
                                </Bar>
                                <Bar
                                    dataKey="net_profit"
                                    name="Laba Bersih"
                                    fill="#3b82f6"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={40}
                                />
                            </BarChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default memo(MonthlyRevenueChartComponent);
