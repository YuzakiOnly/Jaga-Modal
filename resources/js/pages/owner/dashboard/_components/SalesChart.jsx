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

function formatRp(value) {
    if (!value && value !== 0) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

const CHANNELS = [
    { key: "cash", label: "Tunai", color: "#3b82f6" },
    { key: "qris", label: "QRIS", color: "#a855f7" },
    { key: "grabfood", label: "GrabFood", color: "#00b14f" },
    { key: "shopeefood", label: "ShopeeFood", color: "#ee4d2d" },
    { key: "gobiz", label: "GoBiz", color: "#00aed6" },
];

const chartConfig = Object.fromEntries(
    CHANNELS.map(({ key, label, color }) => [key, { label, color }]),
);

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;

    const items = CHANNELS.map((ch) => {
        const entry = payload.find((p) => p.dataKey === ch.key);
        return { ...ch, value: entry?.value ?? 0 };
    }).filter((item) => item.value > 0);

    if (!items.length) return null;

    const total = items.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="rounded-lg border border-border bg-background shadow-md px-3 py-2 text-xs min-w-[200px]">
            <p className="font-semibold text-foreground mb-1.5">
                Tanggal {label}
            </p>
            <div className="space-y-1">
                {items.map(({ key, label: name, color, value }) => (
                    <div
                        key={key}
                        className="flex items-center justify-between gap-3"
                    >
                        <div className="flex items-center gap-1.5">
                            <span
                                className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
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
                <div className="border-t border-border my-1 pt-1">
                    <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-foreground">
                            Total (Bersih)
                        </span>
                        <span className="font-bold text-emerald-600 tabular-nums">
                            {formatRp(total)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SalesChart({
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
            grabfood: d.grabfood ?? 0,
            shopeefood: d.shopeefood ?? 0,
            gobiz: d.gobiz ?? 0,
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

    const channelPercentages = CHANNELS.map(({ key, label, color }) => {
        const total = chartData.reduce((sum, d) => sum + (d[key] || 0), 0);
        const percentage = totalRevenue > 0 ? (total / totalRevenue) * 100 : 0;
        return { key, label, color, total, percentage };
    }).filter((item) => item.total > 0);

    return (
        <Card className="border-border">
            <CardHeader className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <CardTitle className="text-base">
                        Grafik Penjualan
                    </CardTitle>
                    <CardDescription className="mt-0.5">
                        Per hari ·{" "}
                        <span className="font-medium text-foreground">
                            {formatRp(totalRevenue)}
                        </span>{" "}
                        pendapatan bersih {monthName.toLowerCase()}
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
                    <div>
                        <ChartContainer
                            config={chartConfig}
                            className="h-[320px] w-full"
                        >
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
                                    {CHANNELS.map(({ key, color }) => (
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
                                <Tooltip
                                    cursor={{
                                        stroke: "var(--border)",
                                        strokeWidth: 1,
                                    }}
                                    content={<CustomTooltip />}
                                />
                                <ChartLegend content={<ChartLegendContent />} />
                                {CHANNELS.map(({ key, color }) => (
                                    <Area
                                        key={key}
                                        type="monotone"
                                        dataKey={key}
                                        stroke={color}
                                        strokeWidth={2}
                                        fill={`url(#gradient-${key})`}
                                        dot={false}
                                        activeDot={{
                                            r: 4,
                                            strokeWidth: 0,
                                            fill: color,
                                        }}
                                    />
                                ))}
                            </AreaChart>
                        </ChartContainer>

                        {channelPercentages.length > 0 && (
                            <div className="flex justify-center gap-4 mt-4 flex-wrap">
                                {channelPercentages.map(
                                    ({ key, label, color, percentage }) => (
                                        <div
                                            key={key}
                                            className="flex items-center gap-1.5"
                                        >
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{
                                                    backgroundColor: color,
                                                }}
                                            />
                                            <span className="text-xs text-muted-foreground">
                                                {label}: {percentage.toFixed(1)}
                                                %
                                            </span>
                                        </div>
                                    ),
                                )}
                            </div>
                        )}

                        <div className="text-center text-xs text-muted-foreground mt-3">
                            *Data penjualan bersih per tanggal {monthName}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
