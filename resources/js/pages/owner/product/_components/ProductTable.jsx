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

import { columns } from "./ProductColumns";
import { statusOptions } from "@/lib/owner/product/productConstants";

export function ProductTable({
    products,
    categories,
    filters,
    onDelete,
    onSearch,
    onFilterChange,
    onCategoryChange,
}) {
    const data = products?.data ?? [];

    const [sorting, setSorting] = React.useState([]);
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [statusPopoverOpen, setStatusPopoverOpen] = React.useState(false);
    const [categoryPopoverOpen, setCategoryPopoverOpen] = React.useState(false);

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

    const getStatusLabel = () =>
        statusOptions.find((s) => s.value === (filters?.status || "all"))
            ?.label || "Status";

    const getCategoryLabel = () => {
        if (!filters?.category_id) return "Category";
        return (
            categories.find((c) => String(c.id) === String(filters.category_id))
                ?.name || "Category"
        );
    };

    return (
        <div className="w-full space-y-3 sm:space-y-4">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div className="w-full lg:max-w-md">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search name, SKU, barcode..."
                            value={filters?.search || ""}
                            onChange={(e) => onSearch(e.target.value)}
                            className="h-10 pl-9 pr-9"
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
                </div>

                <div className="flex items-center gap-2">
                    <Popover
                        open={categoryPopoverOpen}
                        onOpenChange={setCategoryPopoverOpen}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-10 flex-1 justify-between lg:flex-none lg:min-w-[180px]"
                            >
                                <span className="truncate">
                                    {getCategoryLabel()}
                                </span>
                                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-56 p-0 max-h-60 overflow-y-auto"
                            align="end"
                        >
                            <div className="py-1">
                                <button
                                    onClick={() => {
                                        onCategoryChange("");
                                        setCategoryPopoverOpen(false);
                                    }}
                                    className={`flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-accent ${!filters?.category_id ? "bg-accent text-accent-foreground" : ""}`}
                                >
                                    All Categories
                                    {!filters?.category_id && (
                                        <Check className="h-4 w-4" />
                                    )}
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            onCategoryChange(cat.id);
                                            setCategoryPopoverOpen(false);
                                        }}
                                        className={`flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-accent ${String(filters?.category_id) === String(cat.id) ? "bg-accent text-accent-foreground" : ""}`}
                                    >
                                        {cat.name}
                                        {String(filters?.category_id) ===
                                            String(cat.id) && (
                                            <Check className="h-4 w-4" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Popover
                        open={statusPopoverOpen}
                        onOpenChange={setStatusPopoverOpen}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-10 flex-1 justify-between lg:flex-none lg:min-w-[140px]"
                            >
                                <span className="truncate">
                                    {getStatusLabel()}
                                </span>
                                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-44 p-0" align="end">
                            <div className="py-1">
                                {statusOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => {
                                            onFilterChange(opt.value);
                                            setStatusPopoverOpen(false);
                                        }}
                                        className={`flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-accent ${(filters?.status || "all") === opt.value ? "bg-accent text-accent-foreground" : ""}`}
                                    >
                                        {opt.label}
                                        {(filters?.status || "all") ===
                                            opt.value &&
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
                            <Button variant="outline" className="h-10">
                                <ColumnsIcon className="mr-2 h-4 w-4" />
                                Columns
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((col) => col.getCanHide())
                                .map((col) => (
                                    <DropdownMenuCheckboxItem
                                        key={col.id}
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
            </div>

            {(filters?.status && filters.status !== "all") ||
            filters?.category_id ? (
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {filters?.category_id && (
                        <Badge
                            variant="secondary"
                            className="gap-1 text-[10px] sm:text-xs px-2 py-0.5 sm:px-3 sm:py-1"
                        >
                            <FilterIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            {getCategoryLabel()}
                            <X
                                className="h-2.5 w-2.5 sm:h-3 sm:w-3 cursor-pointer hover:text-destructive"
                                onClick={() => onCategoryChange("")}
                            />
                        </Badge>
                    )}
                    {filters?.status && filters.status !== "all" && (
                        <Badge
                            variant="secondary"
                            className="gap-1 text-[10px] sm:text-xs px-2 py-0.5 sm:px-3 sm:py-1"
                        >
                            <FilterIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            {getStatusLabel()}
                            <X
                                className="h-2.5 w-2.5 sm:h-3 sm:w-3 cursor-pointer hover:text-destructive"
                                onClick={() => onFilterChange("all")}
                            />
                        </Badge>
                    )}
                </div>
            ) : null}

            <div className="border overflow-x-auto">
                <Table className="shadow-none min-w-160 sm:min-w-full">
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="py-2 sm:py-3 px-2 sm:px-3"
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
                                            className="py-2 sm:py-3 px-2 sm:px-3"
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
                                    className="h-24 text-center"
                                >
                                    <div className="flex items-center justify-center h-24 text-muted-foreground text-xs sm:text-sm">
                                        No products found.
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-[10px] sm:text-sm text-muted-foreground text-center sm:text-left">
                    Showing {products?.from ?? 0} to {products?.to ?? 0} of{" "}
                    {products?.total ?? 0} products
                </div>
                <div className="flex items-center justify-center sm:justify-end space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            if (products?.prev_page_url) {
                                router.get(
                                    products.prev_page_url,
                                    {},
                                    { preserveState: true },
                                );
                            }
                        }}
                        disabled={!products?.prev_page_url}
                        className="h-8 sm:h-9 text-xs sm:text-sm"
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            if (products?.next_page_url) {
                                router.get(
                                    products.next_page_url,
                                    {},
                                    { preserveState: true },
                                );
                            }
                        }}
                        disabled={!products?.next_page_url}
                        className="h-8 sm:h-9 text-xs sm:text-sm"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
