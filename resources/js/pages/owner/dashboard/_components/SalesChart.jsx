import { useState } from "react";
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
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    Bar,
    BarChart,
    XAxis,
    YAxis,
    CartesianGrid,
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

const chartConfig = {
    revenue: { label: "Pendapatan", color: "var(--chart-1)" },
};

export default function SalesChart({ data, selectedMonth, availableMonths }) {
    const [month, setMonth] = useState(selectedMonth);

    function handleMonthChange(value) {
        setMonth(value);
        router.get(
            window.location.pathname,
            { month: value },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    const isEmpty = !data || data.length === 0;

    const totalRevenue = data?.reduce((sum, d) => sum + d.revenue, 0) ?? 0;

    return (
        <Card>
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
                        total bulan ini
                    </CardDescription>
                </div>
                {availableMonths?.length > 0 && (
                    <Select value={month} onValueChange={handleMonthChange}>
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
                    <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
                        Belum ada data penjualan
                    </div>
                ) : (
                    <ChartContainer
                        config={chartConfig}
                        className="h-[260px] w-full"
                    >
                        <BarChart
                            data={data}
                            margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
                            barCategoryGap="30%"
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="var(--border)"
                            />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                interval="preserveStartEnd"
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
                            <ChartTooltip
                                cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                                content={
                                    <ChartTooltipContent
                                        formatter={(value) => formatRp(value)}
                                        labelFormatter={(label) =>
                                            `Tanggal ${label}`
                                        }
                                    />
                                }
                            />
                            <Bar
                                dataKey="revenue"
                                fill="var(--color-revenue)"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={28}
                            />
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
