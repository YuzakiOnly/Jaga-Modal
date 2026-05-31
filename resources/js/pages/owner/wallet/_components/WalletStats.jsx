import { Wallet, TrendingUp, TrendingDown, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const fmt = (n) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");

export function WalletStats({ summary }) {
    const stats = [
        {
            title: "Saldo Saat Ini",
            value: summary?.balance ?? 0,
            icon: Wallet,
            color: "text-emerald-500",
            bgColor: "bg-emerald-50",
        },
        {
            title: "Pemasukan Periode",
            value: summary?.period_in ?? 0,
            icon: TrendingUp,
            color: "text-green-500",
            bgColor: "bg-green-50",
        },
        {
            title: "Pengeluaran Periode",
            value: summary?.period_out ?? 0,
            icon: TrendingDown,
            color: "text-rose-500",
            bgColor: "bg-rose-50",
        },
        {
            title: "Total Transaksi",
            value: summary?.count ?? 0,
            icon: History,
            color: "text-blue-500",
            bgColor: "bg-blue-50",
            isCount: true,
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {stats.map((stat) => (
                <Card key={stat.title} className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2 pt-3 sm:pt-4 px-3 sm:px-4">
                        <CardTitle className="text-xs sm:text-sm font-medium leading-tight pr-1">
                            {stat.title}
                        </CardTitle>
                        <div
                            className={`${stat.bgColor} p-1.5 sm:p-2 rounded-lg shrink-0`}
                        >
                            <stat.icon
                                className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="pb-3 sm:pb-4 px-3 sm:px-4">
                        <div className="text-base sm:text-xl md:text-2xl font-bold truncate">
                            {stat.isCount ? stat.value : fmt(stat.value)}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
