import { Card, CardContent } from "@/components/ui/card";

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
    isCurrency = true,
}) {
    const displayValue = isCurrency ? formatRp(value) : formatNum(value);

    return (
        <Card>
            <CardContent className="p-3 sm:p-4">
                <p className="text-xs text-muted-foreground truncate">
                    {label}
                </p>
                <p className="text-base sm:text-lg font-bold mt-0.5 truncate">
                    {displayValue}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {subValue}
                </p>
            </CardContent>
        </Card>
    );
}
