import { useState } from "react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import {
    Trash2,
    MoreVertical,
    SearchIcon,
    X,
    Phone,
    UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const roleLabel = (role) => {
    if (role === "cashier") return "Cashier";
    return role;
};

export function EmployeeList({
    employees,
    filters,
    onDelete,
    onSearch,
    deviceType,
}) {
    const data = employees?.data ?? [];

    const goToPage = (url) => {
        if (!url) return;
        const parsed = new URL(url);
        const page = parsed.searchParams.get("page");
        router.get(
            route("owner.employees"),
            {
                search: filters?.search || "",
                page,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <div className="space-y-3">
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search employees..."
                    value={filters?.search || ""}
                    onChange={(e) => onSearch(e.target.value)}
                    className="h-9 pl-9 pr-9 text-sm"
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

            <div
                className={`grid gap-2 ${deviceType === "tablet" ? "grid-cols-2" : "grid-cols-1"}`}
            >
                {data.length === 0 ? (
                    <div
                        className={`${deviceType === "tablet" ? "col-span-2" : "col-span-1"} flex items-center justify-center h-24 text-sm text-muted-foreground rounded-md border`}
                    >
                        No employees found.
                    </div>
                ) : (
                    data.map((employee) => (
                        <Card key={employee.id} className="shadow-sm">
                            <CardContent className="p-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-2 min-w-0 flex-1">
                                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                                            <UserRound className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {employee.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground font-mono truncate">
                                                @{employee.username}
                                            </p>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 shrink-0"
                                            >
                                                <MoreVertical className="h-3.5 w-3.5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    onDelete(employee)
                                                }
                                                className="gap-2 text-xs text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Remove
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="mt-2 flex items-center justify-between border-t pt-2">
                                    <Badge
                                        variant="outline"
                                        className="capitalize text-[10px]"
                                    >
                                        {roleLabel(employee.role)}
                                    </Badge>
                                    {employee.phone && (
                                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                            <Phone className="h-3 w-3" />
                                            {employee.phone}
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <div className="flex flex-col items-center gap-2 pt-1">
                <p className="text-xs text-muted-foreground">
                    Showing {employees?.from ?? 0}–{employees?.to ?? 0} of{" "}
                    {employees?.total ?? 0} employees
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(employees?.prev_page_url)}
                        disabled={!employees?.prev_page_url}
                        className="h-7 text-xs"
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(employees?.next_page_url)}
                        disabled={!employees?.next_page_url}
                        className="h-7 text-xs"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
