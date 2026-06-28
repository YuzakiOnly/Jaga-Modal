import { TrendingDown, Wallet, ArrowLeftRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const fmt = (n) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");

export function ExpenseStats({ summary }) {
    const total = summary?.total ?? 0;
    const byType = summary?.by_type ?? {
        simple: 0,
        raw_material: 0,
        salary: 0,
        owner_withdrawal: 0,
        store_transfer_in: 0,
    };

    const totalPengeluaran =
        byType.simple +
        byType.raw_material +
        byType.salary +
        byType.owner_withdrawal;
    const totalPemasukan = byType.store_transfer_in || 0;

    const stats = [
        {
            title: "Total Transaksi",
            value: total,
            icon: TrendingDown,
            iconColor: "text-rose-500",
            bgColor: "bg-rose-50",
        },
        {
            title: "Pengeluaran",
            value: totalPengeluaran,
            icon: Wallet,
            iconColor: "text-rose-500",
            bgColor: "bg-rose-50",
        },
        {
            title: "Transfer Masuk",
            value: totalPemasukan,
            icon: ArrowLeftRight,
            iconColor: "text-emerald-500",
            bgColor: "bg-emerald-50",
            showSign: true,
            isIncome: true,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            {stats.map((stat) => (
                <Card key={stat.title} className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2 pt-3 sm:pt-4 px-3 sm:px-4">
                        <CardTitle className="text-xs sm:text-sm font-medium leading-tight pr-1">
                            {stat.title}
                        </CardTitle>
                        <div
                            className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${stat.bgColor}`}
                        >
                            <stat.icon
                                className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.iconColor}`}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="pb-3 sm:pb-4 px-3 sm:px-4">
                        <div
                            className={`text-base sm:text-lg md:text-xl lg:text-2xl font-bold truncate ${
                                stat.showSign && stat.isIncome
                                    ? "text-emerald-600"
                                    : stat.showSign && !stat.isIncome
                                      ? "text-red-600"
                                      : ""
                            }`}
                        >
                            {stat.showSign && stat.value >= 0 ? "+" : ""}
                            {stat.showSign && stat.value < 0 ? "-" : ""}
                            {fmt(Math.abs(stat.value))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
