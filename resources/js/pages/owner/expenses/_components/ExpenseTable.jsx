"use client";

import * as React from "react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    ColumnsIcon,
    FilterIcon,
    SearchIcon,
    X,
    ChevronDown,
    Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import { columns } from "./ExpenseColumns";

export function ExpenseTable({ expenses, onDelete }) {
    const data = expenses?.data ?? [];

    const [sorting, setSorting] = React.useState([]);
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});

    const tableCols = columns(onDelete);

    const table = useReactTable({
        data,
        columns: tableCols,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: { sorting, columnFilters, columnVisibility },
    });

    const goToPage = (url) => {
        if (!url) return;
        const parsed = new URL(url);
        const page = parsed.searchParams.get("page");
        router.get(
            route("owner.expenses"),
            { page },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <div className="w-full space-y-4">
            <div className="border overflow-x-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="h-10 px-4"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext(),
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="px-4 py-3"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={tableCols.length}
                                    className="h-24 text-center text-sm text-muted-foreground"
                                >
                                    Belum ada data transaksi
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Menampilkan {expenses?.from ?? 0}–{expenses?.to ?? 0} dari{" "}
                    {expenses?.total ?? 0} transaksi
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(expenses?.prev_page_url)}
                        disabled={!expenses?.prev_page_url}
                    >
                        Sebelumnya
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(expenses?.next_page_url)}
                        disabled={!expenses?.next_page_url}
                    >
                        Selanjutnya
                    </Button>
                </div>
            </div>
        </div>
    );
}
