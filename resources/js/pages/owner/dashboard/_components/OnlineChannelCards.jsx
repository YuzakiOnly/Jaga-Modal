import { Card, CardContent } from "@/components/ui/card";
import { Bike, ShoppingBag, Zap } from "lucide-react";

const CHANNELS = [
    {
        key: "grabfood",
        label: "GrabFood",
        icon: Bike,
        iconColor: "text-green-600",
        bgColor: "bg-green-50",
    },
    {
        key: "shopeefood",
        label: "ShopeeFood",
        icon: ShoppingBag,
        iconColor: "text-orange-500",
        bgColor: "bg-orange-50",
    },
    {
        key: "gobiz",
        label: "GoBiz",
        icon: Zap,
        iconColor: "text-blue-500",
        bgColor: "bg-blue-50",
    },
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

export default function OnlineChannelCards({
    balances,
    periodRevenues,
    periodLabel,
}) {
    return (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
            {CHANNELS.map((channel) => {
                const balance = balances?.[channel.key]?.net_revenue ?? 0;
                const revenue = periodRevenues?.[channel.key] ?? 0;

                return (
                    <Card key={channel.key}>
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${channel.bgColor}`}
                                >
                                    <channel.icon
                                        className={`h-4 w-4 ${channel.iconColor}`}
                                    />
                                </div>
                                <p className="text-sm font-semibold">
                                    {channel.label}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div>
                                    <p className="text-[10px] text-muted-foreground">
                                        Saldo Sekarang
                                    </p>
                                    <p className="text-base font-bold">
                                        {formatRp(balance)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[10px] text-muted-foreground">
                                        Pendapatan {periodLabel}
                                    </p>
                                    <p className="text-base font-bold text-emerald-600">
                                        {formatRp(revenue)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
