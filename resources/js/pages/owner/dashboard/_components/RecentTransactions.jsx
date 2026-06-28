import { Link } from "@inertiajs/react";
import { ChevronRight, Eye, Printer } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

function formatRp(value) {
    if (!value && value !== 0) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

const PAYMENT_METHOD_CONFIG = {
    cash: {
        label: "Tunai",
        bg: "bg-blue-50 dark:bg-blue-950/30",
        text: "text-blue-600 dark:text-blue-400",
    },
    qris: {
        label: "QRIS",
        bg: "bg-purple-50 dark:bg-purple-950/30",
        text: "text-purple-600 dark:text-purple-400",
    },
};

function PaymentBadge({ method }) {
    const config = PAYMENT_METHOD_CONFIG[method] ?? {
        label: method,
        bg: "bg-gray-50 dark:bg-gray-950/30",
        text: "text-gray-600 dark:text-gray-400",
    };
    return (
        <Badge
            variant="outline"
            className={`${config.bg} ${config.text} border-none text-xs whitespace-nowrap px-2.5 py-0.5`}
        >
            {config.label}
        </Badge>
    );
}

export default function RecentTransactions({ transactions }) {
    if (transactions.length === 0) {
        return (
            <Card className="hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
                    <div>
                        <CardTitle className="text-base hover:text-primary transition-colors duration-200">
                            Transaksi Terbaru
                        </CardTitle>
                        <CardDescription>10 transaksi terakhir</CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="hover:bg-primary/10 transition-colors duration-200"
                    >
                        <Link href="/owner/pos/history">
                            Lihat semua{" "}
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="py-16 text-center">
                        <p className="text-muted-foreground text-sm mb-4">
                            Belum ada transaksi
                        </p>
                        <Button
                            asChild
                            className="hover:scale-105 transition-transform duration-200"
                        >
                            <Link href="/owner/pos">Mulai Transaksi</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2 pb-3">
                <div>
                    <CardTitle className="text-base hover:text-primary transition-colors duration-200">
                        Transaksi Terbaru
                    </CardTitle>
                    <CardDescription>10 transaksi terakhir</CardDescription>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="hover:bg-primary/10 transition-colors duration-200"
                >
                    <Link href="/owner/pos/history">
                        Lihat semua <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[60px] text-xs font-medium text-muted-foreground">
                                    ID
                                </TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground">
                                    Waktu
                                </TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground">
                                    Metode
                                </TableHead>
                                <TableHead className="hidden md:table-cell text-xs font-medium text-muted-foreground">
                                    Item
                                </TableHead>
                                <TableHead className="text-right text-xs font-medium text-muted-foreground">
                                    Total
                                </TableHead>
                                <TableHead className="w-[90px] text-center text-xs font-medium text-muted-foreground">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((trx) => (
                                <TableRow
                                    key={trx.id}
                                    className="hover:bg-muted/50 transition-colors duration-150 group"
                                >
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        #{trx.id}
                                    </TableCell>
                                    <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                                        {new Date(
                                            trx.transacted_at,
                                        ).toLocaleString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <PaymentBadge
                                            method={trx.payment_method}
                                        />
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[180px] truncate">
                                        {trx.items
                                            ?.slice(0, 2)
                                            .map((item) => item.name)
                                            .join(", ")}
                                        {trx.items?.length > 2 &&
                                            ` +${trx.items.length - 2} lainnya`}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-xs sm:text-sm whitespace-nowrap">
                                        {formatRp(trx.total)}
                                    </TableCell>
                                    <TableCell className="px-1">
                                        <div className="flex items-center justify-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                                                title="Detail transaksi"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 rounded-full hover:bg-emerald-50 hover:text-emerald-600 transition-colors duration-200"
                                                title="Cetak struk"
                                            >
                                                <Printer className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
