import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Wallet } from "lucide-react";

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

export default function MiniStatCard({
    label,
    value,
    subValue,
    subValue2,
    isCurrency = true,
    icon: Icon,
    iconColor = "text-muted-foreground",
}) {
    const displayValue = isCurrency ? formatRp(value) : formatNum(value);

    const DefaultIcon = label.includes("Pengeluaran") ? TrendingUp : Wallet;

    return (
        <Card>
            <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground truncate">
                        {label}
                    </p>
                    {Icon ? (
                        <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} />
                    ) : (
                        <DefaultIcon
                            className={`h-4 w-4 shrink-0 ${iconColor}`}
                        />
                    )}
                </div>
                <p className="text-base sm:text-lg font-bold mt-0.5 truncate">
                    {displayValue}
                </p>
                {subValue && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {subValue}
                    </p>
                )}
                {subValue2 && (
                    <p className="text-xs text-muted-foreground truncate">
                        {subValue2}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
