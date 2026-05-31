"use client";

import * as React from "react";
import { router, usePage } from "@inertiajs/react";
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
    PlusCircle,
    X,
    Check,
    ChevronDown,
    SearchIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

import { columns } from "./Usercolumns";
import { roleOptions, roleColorMap } from "@/lib/users/userConstants";

export function UserTable({
    users,
    filters,
    onEdit,
    onDelete,
    onFilterChange,
    onSearch,
}) {
    const { auth } = usePage().props;
    const currentUserId = auth?.user?.id;
    const currentUserRole = auth?.user?.role;
    const data = users?.data ?? [];

    const [sorting, setSorting] = React.useState([]);
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [rolePopoverOpen, setRolePopoverOpen] = React.useState(false);

    const tableCols = columns(currentUserId, currentUserRole, onEdit, onDelete);

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
        onRowSelectionChange: setRowSelection,
        state: { sorting, columnFilters, columnVisibility, rowSelection },
    });

    const getSelectedRoleLabel = () => {
        const selected = roleOptions.find(
            (r) => r.value === (filters?.role || "all"),
        );
        return selected?.label || "Role";
    };

    const handleRoleSelect = (value) => {
        onFilterChange(value);
        setRolePopoverOpen(false);
    };

    const clearRoleFilter = () => {
        onFilterChange("role", "all");
    };

    return (
        <div className="w-full space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:max-w-sm">
                        <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

                        <Input
                            placeholder="Search users..."
                            value={filters?.search || ""}
                            onChange={(e) => onSearch(e.target.value)}
                            className="pr-10 pl-9 shadow-none! ring-0!"
                        />

                        {filters?.search && (
                            <button
                                type="button"
                                onClick={() => onSearch("")}
                                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <Popover
                        className="shadow-none!"
                        open={rolePopoverOpen}
                        onOpenChange={setRolePopoverOpen}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-between sm:w-48"
                            >
                                <span className="flex items-center gap-2">
                                    <FilterIcon className="h-4 w-4" />
                                    {getSelectedRoleLabel()}
                                </span>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-0" align="start">
                            <div className="py-1">
                                {roleOptions.map((role) => (
                                    <button
                                        key={role.value}
                                        onClick={() =>
                                            handleRoleSelect(role.value)
                                        }
                                        className={`flex w-full items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                                            (filters?.role || "all") ===
                                            role.value
                                                ? "bg-accent text-accent-foreground"
                                                : ""
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            {role.value !== "all" && (
                                                <div
                                                    className={`h-2 w-2 rounded-full bg-${role.color}-500`}
                                                    style={{
                                                        backgroundColor:
                                                            roleColorMap[
                                                                role.color
                                                            ],
                                                    }}
                                                />
                                            )}
                                            {role.label}
                                        </span>
                                        {(filters?.role || "all") ===
                                            role.value &&
                                            role.value !== "all" && (
                                                <Check className="h-4 w-4 text-primary" />
                                            )}
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="shadow-none! ring-0!"
                            >
                                <span className="hidden lg:inline">
                                    Columns
                                </span>{" "}
                                <ColumnsIcon className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter(
                                    (column) =>
                                        column.getCanHide() ||
                                        column.id === "name",
                                )
                                .map((column) => (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        disabled={column.id === "name"}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {filters?.role && filters.role !== "all" && (
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="gap-1">
                        <FilterIcon className="h-3 w-3" />
                        Role: {getSelectedRoleLabel()}
                        <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={clearRoleFilter}
                        />
                    </Badge>
                </div>
            )}

            <div className="border">
                <Table className="shadow-none! rounded-4xl!">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
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
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && "selected"
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
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={tableCols.length}
                                    className="h-24 text-center"
                                >
                                    <div className="flex items-center justify-center h-24">
                                        No results.
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Info */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                    Showing {users?.from ?? 0} to {users?.to ?? 0} of{" "}
                    {users?.total ?? 0} users
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            if (users?.prev_page_url) {
                                router.get(
                                    users.prev_page_url,
                                    {},
                                    { preserveState: true },
                                );
                            }
                        }}
                        disabled={!users?.prev_page_url}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            if (users?.next_page_url) {
                                router.get(
                                    users.next_page_url,
                                    {},
                                    { preserveState: true },
                                );
                            }
                        }}
                        disabled={!users?.next_page_url}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
