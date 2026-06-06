import { Link } from "@inertiajs/react";
import { ChevronRight, MoreHorizontal } from "lucide-react";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
        color: "#3b82f6",
        bg: "bg-blue-50",
        text: "text-blue-600",
    },
    qris: {
        label: "QRIS",
        color: "#a855f7",
        bg: "bg-purple-50",
        text: "text-purple-600",
    },
    grabfood: {
        label: "GrabFood",
        color: "#00b14f",
        bg: "bg-green-50",
        text: "text-green-600",
    },
    shopeefood: {
        label: "ShopeeFood",
        color: "#ee4d2d",
        bg: "bg-orange-50",
        text: "text-orange-600",
    },
    gobiz: {
        label: "GoBiz",
        color: "#00aed6",
        bg: "bg-cyan-50",
        text: "text-cyan-600",
    },
    dine_in: {
        label: "Dine In",
        color: "#6b7280",
        bg: "bg-gray-100",
        text: "text-gray-600",
    },
};

function PaymentBadge({ method }) {
    const config = PAYMENT_METHOD_CONFIG[method] ?? {
        label: method,
        bg: "bg-gray-50",
        text: "text-gray-600",
    };
    return (
        <Badge
            variant="outline"
            className={`${config.bg} ${config.text} border-none text-xs whitespace-nowrap`}
        >
            {config.label}
        </Badge>
    );
}

export default function RecentTransactions({ transactions }) {
    if (transactions.length === 0) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
                    <div>
                        <CardTitle className="text-base">
                            Transaksi Terbaru
                        </CardTitle>
                        <CardDescription>10 transaksi terakhir</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
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
                        <Button asChild>
                            <Link href="/owner/pos">Mulai Transaksi</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2 pb-3">
                <div>
                    <CardTitle className="text-base">
                        Transaksi Terbaru
                    </CardTitle>
                    <CardDescription>10 transaksi terakhir</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                    <Link href="/owner/pos/history">
                        Lihat semua <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[60px]">ID</TableHead>
                                <TableHead>Waktu</TableHead>
                                <TableHead>Metode</TableHead>
                                <TableHead className="hidden md:table-cell">
                                    Channel
                                </TableHead>
                                <TableHead className="hidden md:table-cell">
                                    Item
                                </TableHead>
                                <TableHead className="text-right">
                                    Total
                                </TableHead>
                                <TableHead className="w-[40px]" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((trx) => (
                                <TableRow key={trx.id}>
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
                                    <TableCell className="hidden md:table-cell">
                                        {trx.order_channel &&
                                        trx.order_channel !== "dine_in" ? (
                                            <PaymentBadge
                                                method={trx.order_channel}
                                            />
                                        ) : (
                                            <PaymentBadge method="dine_in" />
                                        )}
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
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                >
                                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    Detail transaksi
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    Cetak struk
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
