import { User, Phone, ShoppingBag, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price);

const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });

export function CustomerList({ customers = [] }) {
    if (customers.length === 0) {
        return (
            <div className="rounded-xl border bg-card">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h2 className="text-sm font-semibold">Data Pelanggan</h2>
                    <span className="text-xs text-muted-foreground">
                        0 pelanggan
                    </span>
                </div>
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                    <User className="h-10 w-10 opacity-30" />
                    <p className="text-sm">
                        Belum ada data pelanggan pada periode ini
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-card">
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <h2 className="text-sm font-semibold">Data Pelanggan</h2>
                <span className="text-xs text-muted-foreground">
                    {customers.length} pelanggan
                </span>
            </div>

            <div className="divide-y">
                {customers.map((customer) => (
                    <div
                        key={customer.id}
                        className="flex items-center justify-between px-4 py-3 gap-3"
                    >
                        {/* Avatar + identity */}
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                                #{customer.customer_number}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <p className="text-sm font-semibold truncate">
                                        {customer.name ?? (
                                            <span className="text-muted-foreground font-normal italic">
                                                Pelanggan #
                                                {customer.customer_number}
                                            </span>
                                        )}
                                    </p>
                                    {customer.name && (
                                        <Badge
                                            variant="outline"
                                            className="text-[10px] px-1 py-0 h-4"
                                        >
                                            #{customer.customer_number}
                                        </Badge>
                                    )}
                                </div>
                                {customer.phone ? (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                        <Phone className="h-3 w-3" />
                                        {customer.phone}
                                    </p>
                                ) : (
                                    <p className="text-xs text-muted-foreground/50 mt-0.5">
                                        Tanpa nomor HP
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 shrink-0">
                            <div className="hidden sm:flex flex-col items-end">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <ShoppingBag className="h-3 w-3" />
                                    <span>
                                        {customer.total_transactions}x beli
                                    </span>
                                </div>
                                <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                                    Terakhir: {formatDate(customer.last_visit)}
                                </p>
                            </div>
                            <div className="flex flex-col items-end">
                                <p className="text-sm font-bold tabular-nums text-primary">
                                    {formatPrice(customer.total_spent)}
                                </p>
                                <p className="text-[10px] text-muted-foreground sm:hidden">
                                    {customer.total_transactions}x transaksi
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
