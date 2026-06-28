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
    ResponsiveContainer,
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

const MONTH_NAMES_FULL = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
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

// TOOLTIP CUSTOM DENGAN HOVER EFFECT
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0]?.payload;
    if (!data) return null;

    return (
        <div className="rounded-lg border border-border bg-background shadow-lg px-4 py-3 text-xs min-w-[240px] transition-all duration-200 hover:shadow-xl">
            <p className="font-semibold text-foreground text-sm mb-2">
                {data.monthLabel}
            </p>
            <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-4 hover:bg-muted/50 px-1 py-0.5 rounded transition-colors duration-150">
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 rounded-sm shrink-0 bg-emerald-500" />
                        <span className="text-muted-foreground">Omzet</span>
                    </div>
                    <span className="font-bold text-emerald-600 tabular-nums">
                        {formatRp(data.revenue ?? 0)}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-4 hover:bg-muted/50 px-1 py-0.5 rounded transition-colors duration-150">
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 rounded-sm shrink-0 bg-blue-500" />
                        <span className="text-muted-foreground">
                            Laba Bersih
                        </span>
                    </div>
                    <span className="font-medium text-blue-600 tabular-nums">
                        {formatRp(data.net_profit ?? 0)}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-4 hover:bg-muted/50 px-1 py-0.5 rounded transition-colors duration-150">
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 rounded-sm shrink-0 bg-amber-500" />
                        <span className="text-muted-foreground">Transaksi</span>
                    </div>
                    <span className="font-medium text-foreground tabular-nums">
                        {new Intl.NumberFormat("id-ID").format(
                            data.transactions ?? 0,
                        )}{" "}
                        transaksi
                    </span>
                </div>
                {data.revenue > 0 && (
                    <div className="border-t border-border my-1.5 pt-1.5">
                        <div className="flex items-center justify-between gap-4 hover:bg-muted/50 px-1 py-0.5 rounded transition-colors duration-150">
                            <span className="text-muted-foreground">
                                Margin Keuntungan
                            </span>
                            <span className="font-semibold text-emerald-600 tabular-nums">
                                {data.revenue > 0
                                    ? (
                                          (data.net_profit / data.revenue) *
                                          100
                                      ).toFixed(1)
                                    : 0}
                                %
                            </span>
                        </div>
                    </div>
                )}
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
                monthLabel: `${MONTH_NAMES_FULL[i]} ${selectedYear}`,
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
            <Card className="border-border hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <CardTitle className="text-base hover:text-primary transition-colors duration-200">
                            Grafik Omzet Bulanan
                        </CardTitle>
                        <CardDescription className="mt-0.5">
                            Omzet per bulan ·{" "}
                            <span className="font-medium text-foreground hover:text-emerald-600 transition-colors duration-200">
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
                            <SelectTrigger className="w-full sm:w-[130px] shrink-0 text-sm hover:border-primary transition-colors duration-200">
                                <SelectValue placeholder="Pilih tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((y) => (
                                    <SelectItem
                                        key={y}
                                        value={String(y)}
                                        className="hover:bg-primary/10 transition-colors duration-150"
                                    >
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </CardHeader>

                <CardContent className="pb-4 px-2 sm:px-6">
                    <div className="rounded-xl border border-border bg-slate-50 dark:bg-muted/30 px-4 py-2.5 mb-4 hover:bg-slate-100 dark:hover:bg-muted/40 transition-colors duration-200 max-w-sm ">
    <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide font-medium">
                Omzet {selectedYear}
            </p>
            <p className="text-xs font-bold hover:text-emerald-600 transition-colors duration-200">
                {formatRp(yearTotal)}
            </p>
        </div>
        <div className="text-center border-l border-border pl-2">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide font-medium">
                Laba {selectedYear}
            </p>
            <p className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors duration-200">
                {formatRp(yearProfit)}
            </p>
        </div>
        <div className="text-center border-l border-border pl-2">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide font-medium">
                Total Waktu
            </p>
            <p className="text-xs font-bold hover:text-blue-600 transition-colors duration-200">
                {formatRp(allTimeTotal)}
            </p>
        </div>
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
                            <ResponsiveContainer width="100%" height="100%">
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
                                    <ChartLegend
                                        content={<ChartLegendContent />}
                                    />
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
                                                    entry.revenue ===
                                                        maxRevenue &&
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
                            </ResponsiveContainer>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default memo(MonthlyRevenueChartComponent);
