import { Link } from "@inertiajs/react";
import { AlertTriangle } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

function formatNum(value) {
    if (!value && value !== 0) return "0";
    return new Intl.NumberFormat("id-ID").format(value);
}

export default function LowStockAlert({ products, totalLowStock }) {
    if (products.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        Stok Menipis
                    </CardTitle>
                    <CardDescription>Semua stok aman ✅</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="py-10 text-center text-sm text-muted-foreground">
                        Tidak ada produk dengan stok menipis
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
                <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        Stok Menipis
                    </CardTitle>
                    <CardDescription>
                        {formatNum(totalLowStock)} produk perlu restock
                    </CardDescription>
                </div>
                <Badge
                    variant="outline"
                    className="text-yellow-600 border-yellow-400 shrink-0 text-xs"
                >
                    Perhatian
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {products.slice(0, 5).map((product) => {
                        const pct = Math.min(
                            100,
                            (product.stock / (product.minimum_stock * 2)) * 100,
                        );
                        return (
                            <div key={product.id} className="space-y-1.5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium truncate max-w-[150px]">
                                        {product.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                                        {product.stock} {product.unit}
                                    </span>
                                </div>
                                <Progress
                                    value={pct}
                                    className="h-1.5"
                                    indicatorClassName="bg-yellow-500"
                                />
                            </div>
                        );
                    })}
                </div>
            </CardContent>
            <CardFooter className="pt-3">
                <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="/owner/products?status=low_stock">
                        Kelola Stok
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
