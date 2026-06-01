"use client";

import * as React from "react";
import { router } from "@inertiajs/react";
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
    SearchIcon,
    X,
    ChevronDown,
    FilterIcon,
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

import { columns } from "./CapitalColumn";

const statusOptions = [
    { value: "all", label: "Semua Status" },
    { value: "active", label: "Aktif" },
    { value: "inactive", label: "Nonaktif" },
];

export function CapitalTable({
    templates,
    filters,
    onDelete,
    onSearch,
    onFilterChange,
}) {
    const data = templates?.data ?? [];

    const [sorting, setSorting] = React.useState([]);
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [statusPopoverOpen, setStatusPopoverOpen] = React.useState(false);

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

    const getSelectedStatusLabel = () => {
        const selected = statusOptions.find(
            (s) => s.value === (filters?.status || "all"),
        );
        return selected?.label || "Status";
    };

    const handleStatusSelect = (value) => {
        onFilterChange(value);
        setStatusPopoverOpen(false);
    };

    const clearStatusFilter = () => {
        onFilterChange("all");
    };

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1 max-w-sm">
                    <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Cari template HPP..."
                        value={filters?.search || ""}
                        onChange={(e) => onSearch(e.target.value)}
                        className="pl-9 pr-10 shadow-none! ring-0!"
                    />
                    {filters?.search && (
                        <button
                            type="button"
                            onClick={() => onSearch("")}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Popover
                        open={statusPopoverOpen}
                        onOpenChange={setStatusPopoverOpen}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-10 w-44 justify-between"
                            >
                                <span className="flex items-center gap-2">
                                    <FilterIcon className="h-4 w-4" />
                                    <span className="truncate">
                                        {getSelectedStatusLabel()}
                                    </span>
                                </span>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-44 p-0" align="end">
                            <div className="py-1">
                                {statusOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() =>
                                            handleStatusSelect(opt.value)
                                        }
                                        className={`flex w-full items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                                            (filters?.status || "all") ===
                                            opt.value
                                                ? "bg-accent text-accent-foreground"
                                                : ""
                                        }`}
                                    >
                                        {opt.label}
                                        {(filters?.status || "all") ===
                                            opt.value &&
                                            opt.value !== "all" && (
                                                <Check className="h-4 w-4 text-primary" />
                                            )}
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-10 w-10 shrink-0 shadow-none! ring-0! sm:w-auto sm:px-3"
                            >
                                <ColumnsIcon className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Kolom</span>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((col) => col.getCanHide())
                                .map((col) => (
                                    <DropdownMenuCheckboxItem
                                        key={col.id}
                                        className="capitalize"
                                        checked={col.getIsVisible()}
                                        onCheckedChange={(val) =>
                                            col.toggleVisibility(val)
                                        }
                                    >
                                        {col.id === "name" && "Nama Template"}
                                        {col.id === "amount" && "Nominal HPP"}
                                        {col.id === "description" &&
                                            "Deskripsi"}
                                        {col.id === "is_active" && "Status"}
                                        {col.id === "created_at" && "Dibuat"}
                                        {col.id === "actions" && "Aksi"}
                                    </DropdownMenuCheckboxItem>
                                ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {filters?.status && filters.status !== "all" && (
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="gap-1">
                        <FilterIcon className="h-3 w-3" />
                        Status: {getSelectedStatusLabel()}
                        <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={clearStatusFilter}
                        />
                    </Badge>
                </div>
            )}

            <div className="border overflow-hidden">
                <div className="overflow-x-auto">
                    <Table className="shadow-none!">
                        <TableHeader>
                            {table.getHeaderGroups().map((hg) => (
                                <TableRow key={hg.id}>
                                    {hg.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            className="whitespace-nowrap"
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
                                            <TableCell key={cell.id}>
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
                                        className="h-24 text-center"
                                    >
                                        <div className="flex items-center justify-center h-24 text-muted-foreground">
                                            Tidak ada template HPP ditemukan.
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {(templates?.prev_page_url || templates?.next_page_url) && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-2">
                    <p className="text-sm text-muted-foreground text-center sm:text-left">
                        Menampilkan {templates?.from ?? 0}–{templates?.to ?? 0}{" "}
                        dari {templates?.total ?? 0} template
                    </p>
                    <div className="flex gap-2 justify-center sm:justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!templates?.prev_page_url}
                            onClick={() => {
                                router.get(
                                    templates.prev_page_url,
                                    {},
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                );
                            }}
                        >
                            Sebelumnya
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!templates?.next_page_url}
                            onClick={() => {
                                router.get(
                                    templates.next_page_url,
                                    {},
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                );
                            }}
                        >
                            Berikutnya
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
