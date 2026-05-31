import { Link } from "@inertiajs/react";
import { ChevronRight } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

export default function TopProducts({ products }) {
    if (products.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        Top 5 Produk Terlaris
                    </CardTitle>
                    <CardDescription>Bulan ini</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="py-12 text-center text-sm text-muted-foreground">
                        Belum ada data penjualan
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="pb-2">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">
                    Top 5 Produk Terlaris
                </CardTitle>
                <CardDescription>Bulan ini</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {products.map((product, index) => (
                        <div
                            key={product.product_id}
                            className="flex items-center gap-3"
                        >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                {index + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate leading-tight">
                                    {product.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {formatNum(product.total_sold)} unit
                                </p>
                            </div>
                            <p className="text-sm font-semibold shrink-0 text-right">
                                {formatRp(product.total_revenue)}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="border-t pt-3">
                <Button variant="ghost" size="sm" asChild className="w-full">
                    <Link href="/owner/products">
                        Lihat semua produk{" "}
                        <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
