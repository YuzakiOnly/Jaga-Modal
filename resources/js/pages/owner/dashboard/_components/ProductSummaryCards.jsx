import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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

export default function ProductSummaryCards({
    productStats,
    averageMargin,
    netProfit,
}) {
    const totalProducts =
        productStats.total_active + productStats.total_inactive;

    return (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Produk
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl sm:text-3xl font-bold">
                        {formatNum(totalProducts)}
                    </p>
                    <div className="flex gap-3 mt-2 text-xs sm:text-sm">
                        <span className="text-emerald-600">
                            Aktif: {formatNum(productStats.total_active)}
                        </span>
                        <span className="text-muted-foreground">
                            Tidak Aktif:{" "}
                            {formatNum(productStats.total_inactive)}
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Rata-rata Margin
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl sm:text-3xl font-bold">
                        {averageMargin}%
                    </p>
                    <Progress value={averageMargin} className="mt-2 h-1.5" />
                    <p className="text-xs text-muted-foreground mt-2">
                        Dari total penjualan bulan ini
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Laba Bersih
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl sm:text-3xl font-bold truncate">
                        {formatRp(netProfit)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                        Pendapatan − HPP − Pengeluaran
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
