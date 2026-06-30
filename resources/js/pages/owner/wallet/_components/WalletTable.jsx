import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, PiggyBank } from "lucide-react";
import { Link } from "@inertiajs/react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { walletColumns } from "./WalletColumns";

export function WalletTable({ transactions, onDelete }) {
    const data = transactions?.data ?? [];

    const columns = walletColumns(onDelete);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (data.length === 0) {
        return (
            <div className="rounded-xl border bg-card flex flex-col items-center justify-center py-12 sm:py-16 text-center gap-3">
                <PiggyBank className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50" />
                <p className="font-medium text-muted-foreground text-sm">
                    Belum ada transaksi dompet
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground/60">
                    Tarik saldo dari toko atau tambah saldo manual
                </p>
            </div>
        );
    }

    const { links, meta } = transactions;

    const Pagination = () =>
        meta && meta.last_page > 1 ? (
            <div className="flex items-center justify-between border-t px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-muted-foreground">
                <span>
                    {meta.from}–{meta.to} dari {meta.total} transaksi
                </span>
                <div className="flex gap-1">
                    {links.prev ? (
                        <Link
                            href={links.prev}
                            preserveScroll
                            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md border hover:bg-accent transition-colors"
                        >
                            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Link>
                    ) : (
                        <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md border opacity-40 cursor-not-allowed">
                            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </span>
                    )}
                    {links.next ? (
                        <Link
                            href={links.next}
                            preserveScroll
                            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md border hover:bg-accent transition-colors"
                        >
                            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Link>
                    ) : (
                        <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md border opacity-40 cursor-not-allowed">
                            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </span>
                    )}
                </div>
            </div>
        ) : null;

    return (
        <div className="border overflow-hidden bg-background">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                key={headerGroup.id}
                                className="hover:bg-transparent"
                            >
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext(),
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                className={
                                    row.original.source === "store_transfer"
                                        ? "bg-blue-50/30 dark:bg-blue-950/20"
                                        : ""
                                }
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <Pagination />
        </div>
    );
}
