import { router } from "@inertiajs/react";
import { Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionRow } from "./TransactionRow";

export function TransactionList({ transactions }) {
    return (
        <div className="rounded-xl border bg-card">
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <h2 className="text-sm font-semibold">Daftar Transaksi</h2>
                <span className="text-xs text-muted-foreground">
                    {transactions.total} transaksi
                </span>
            </div>

            {transactions.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                    <Receipt className="h-10 w-10 opacity-30" />
                    <p className="text-sm">
                        Tidak ada transaksi pada periode ini
                    </p>
                </div>
            ) : (
                <div className="p-2 space-y-1">
                    {transactions.data.map((tx) => (
                        <TransactionRow key={tx.id} transaction={tx} />
                    ))}
                </div>
            )}

            {transactions.last_page > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                    <span className="text-xs text-muted-foreground">
                        Halaman {transactions.current_page} dari{" "}
                        {transactions.last_page}
                    </span>
                    <div className="flex gap-2">
                        {transactions.prev_page_url && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.get(transactions.prev_page_url)
                                }
                            >
                                Sebelumnya
                            </Button>
                        )}
                        {transactions.next_page_url && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.get(transactions.next_page_url)
                                }
                            >
                                Berikutnya
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
