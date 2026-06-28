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

import { columns } from "./CategoryColumns";
import { statusOptions } from "@/lib/owner/category/categoryConstants";

export function CategoryTable({
    categories,
    filters,
    onDelete,
    onSearch,
    onFilterChange,
}) {
    const data = categories?.data ?? [];

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

    const goToPage = (url) => {
        if (!url) return;
        const parsed = new URL(url);
        const page = parsed.searchParams.get("page");
        router.get(
            route("owner.categories"),
            {
                search: filters?.search || "",
                status: filters?.status || "all",
                page,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search categories..."
                        value={filters?.search || ""}
                        onChange={(e) => onSearch(e.target.value)}
                        className="h-9 pl-9 pr-9"
                    />
                    {filters?.search && (
                        <button
                            type="button"
                            onClick={() => onSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <Popover
                    open={statusPopoverOpen}
                    onOpenChange={setStatusPopoverOpen}
                >
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="h-9 w-40 justify-between"
                        >
                            <span className="flex items-center gap-2">
                                <FilterIcon className="h-4 w-4" />
                                <span className="truncate text-sm">
                                    {getSelectedStatusLabel()}
                                </span>
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-0" align="start">
                        <div className="py-1">
                            {statusOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() =>
                                        handleStatusSelect(opt.value)
                                    }
                                    className={`flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-accent ${
                                        (filters?.status || "all") === opt.value
                                            ? "bg-accent text-accent-foreground"
                                            : ""
                                    }`}
                                >
                                    {opt.label}
                                    {(filters?.status || "all") === opt.value &&
                                        opt.value !== "all" && (
                                            <Check className="h-4 w-4" />
                                        )}
                                </button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-9 px-3">
                            <ColumnsIcon className="h-4 w-4 mr-2" />
                            <span className="text-sm">Columns</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((col) => col.getCanHide())
                            .map((col) => (
                                <DropdownMenuCheckboxItem
                                    key={col.id}
                                    className="capitalize text-sm"
                                    checked={col.getIsVisible()}
                                    onCheckedChange={(val) =>
                                        col.toggleVisibility(val)
                                    }
                                >
                                    {col.id}
                                </DropdownMenuCheckboxItem>
                            ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {filters?.status && filters.status !== "all" && (
                <div className="flex gap-2">
                    <Badge variant="secondary" className="gap-1 text-xs">
                        <FilterIcon className="h-3 w-3" />
                        Status: {getSelectedStatusLabel()}
                        <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={clearStatusFilter}
                        />
                    </Badge>
                </div>
            )}

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
                                    No categories found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {categories?.from ?? 0}–{categories?.to ?? 0} of{" "}
                    {categories?.total ?? 0} categories
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(categories?.prev_page_url)}
                        disabled={!categories?.prev_page_url}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(categories?.next_page_url)}
                        disabled={!categories?.next_page_url}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
