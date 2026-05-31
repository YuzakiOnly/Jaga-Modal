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

export default function ExpenseBreakdown({ expenses, totalExpense }) {
    if (expenses.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        Pengeluaran per Tipe
                    </CardTitle>
                    <CardDescription>Bulan ini</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="py-10 text-center text-sm text-muted-foreground">
                        Belum ada data pengeluaran
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">
                    Pengeluaran per Tipe
                </CardTitle>
                <CardDescription>Bulan ini</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {expenses.map((item, index) => {
                        const pct =
                            totalExpense > 0
                                ? (item.total / totalExpense) * 100
                                : 0;
                        return (
                            <div key={index}>
                                <div className="flex items-center justify-between text-sm mb-1.5">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span
                                            className="h-2.5 w-2.5 rounded-full shrink-0"
                                            style={{
                                                backgroundColor: item.color,
                                            }}
                                        />
                                        <span className="truncate">
                                            {item.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                        <span className="text-xs text-muted-foreground">
                                            {pct.toFixed(1)}%
                                        </span>
                                        <span className="font-medium text-xs sm:text-sm">
                                            {formatRp(item.total)}
                                        </span>
                                    </div>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                            width: `${pct}%`,
                                            backgroundColor: item.color,
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
            <CardFooter className="border-t pt-3">
                <Button variant="ghost" size="sm" asChild className="w-full">
                    <Link href="/owner/expenses">
                        Lihat detail pengeluaran{" "}
                        <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
