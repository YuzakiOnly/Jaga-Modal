import { TrendingDown, Package, Users, FileText, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const fmt = (n) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");

export function ExpenseStats({ summary }) {
    const total = summary?.total ?? 0;
    const byType = summary?.by_type ?? {
        simple: 0,
        raw_material: 0,
        salary: 0,
        owner_withdrawal: 0,
    };

    const stats = [
        {
            title: "Total Semua",
            value: total,
            icon: TrendingDown,
            iconColor: "text-rose-500",
        },
        {
            title: "Simple",
            value: byType.simple,
            icon: FileText,
            iconColor: "text-slate-500",
        },
        {
            title: "Bahan Baku",
            value: byType.raw_material,
            icon: Package,
            iconColor: "text-blue-500",
        },
        {
            title: "Gaji",
            value: byType.salary,
            icon: Users,
            iconColor: "text-green-500",
        },
        {
            title: "Penarikan Owner",
            value: byType.owner_withdrawal,
            icon: Wallet,
            iconColor: "text-purple-500",
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {stats.map((stat) => (
                <Card key={stat.title} className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2 pt-3 sm:pt-4 px-3 sm:px-4">
                        <CardTitle className="text-xs sm:text-sm font-medium leading-tight pr-1">
                            {stat.title}
                        </CardTitle>
                        <div className="bg-slate-100 p-1.5 sm:p-2 rounded-lg shrink-0">
                            <stat.icon
                                className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.iconColor}`}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="pb-3 sm:pb-4 px-3 sm:px-4">
                        <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold truncate">
                            {fmt(stat.value)}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
