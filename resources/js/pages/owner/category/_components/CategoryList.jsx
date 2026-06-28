import { useState } from "react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import {
    Pencil,
    Trash2,
    MoreVertical,
    FilterIcon,
    SearchIcon,
    X,
    ChevronDown,
    Check,
    Package,
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

export function CategoryList({
    categories,
    filters,
    onDelete,
    onSearch,
    onFilterChange,
    deviceType,
}) {
    const data = categories?.data ?? [];
    const [loadingId, setLoadingId] = useState(null);
    const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);

    const handleToggleStatus = (categoryId) => {
        setLoadingId(categoryId);
        router.patch(
            route("owner.categories.toggle", categoryId),
            {},
            {
                preserveScroll: true,
                onFinish: () => setLoadingId(null),
            },
        );
    };

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

    const canDelete = (category) => (category.products_count ?? 0) === 0;

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
        <div className="space-y-3">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search categories..."
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

                <Popover
                    open={statusPopoverOpen}
                    onOpenChange={setStatusPopoverOpen}
                >
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="h-9 w-9 shrink-0 p-0"
                        >
                            <FilterIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-0" align="end">
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

            <div
                className={`grid gap-2 ${deviceType === "tablet" ? "grid-cols-3" : "grid-cols-2"}`}
            >
                {data.length === 0 ? (
                    <div
                        className={`${deviceType === "tablet" ? "col-span-3" : "col-span-2"} flex items-center justify-center h-24 text-sm text-muted-foreground rounded-md border`}
                    >
                        No categories found.
                    </div>
                ) : (
                    data.map((category) => (
                        <Card key={category.id} className="shadow-sm">
                            <CardContent className="p-2">
                                <div className="flex items-start justify-between gap-1">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium truncate">
                                            {category.name}
                                        </p>
                                        <p className="text-[9px] text-muted-foreground font-mono truncate">
                                            {category.slug}
                                        </p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 shrink-0"
                                            >
                                                <MoreVertical className="h-3 w-3" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    router.visit(
                                                        route(
                                                            "owner.categories.edit",
                                                            category.id,
                                                        ),
                                                    )
                                                }
                                                className="gap-2 text-xs"
                                            >
                                                <Pencil className="h-3 w-3" />
                                                Edit
                                            </DropdownMenuItem>

                                            {canDelete(category) ? (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onDelete(category)
                                                    }
                                                    className="gap-2 text-xs text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                    Delete
                                                </DropdownMenuItem>
                                            ) : (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-muted-foreground opacity-50">
                                                            <Trash2 className="h-3 w-3" />
                                                            Delete
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="left">
                                                        <p className="text-xs">
                                                            Remove{" "}
                                                            {
                                                                category.products_count
                                                            }{" "}
                                                            product
                                                            {category.products_count !==
                                                            1
                                                                ? "s"
                                                                : ""}{" "}
                                                            first
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {category.description && (
                                    <p className="mt-1 text-[9px] text-muted-foreground line-clamp-2">
                                        {category.description}
                                    </p>
                                )}

                                <div className="mt-2 flex items-center justify-between border-t pt-2">
                                    <Badge
                                        variant="secondary"
                                        className="gap-0.5 text-[8px] px-1 py-0"
                                    >
                                        <Package className="h-2 w-2" />
                                        {category.products_count ?? 0}
                                    </Badge>
                                    <div className="flex items-center gap-1">
                                        <Switch
                                            checked={category.is_active}
                                            onCheckedChange={() =>
                                                handleToggleStatus(category.id)
                                            }
                                            disabled={loadingId === category.id}
                                            className="data-[state=checked]:bg-emerald-500 scale-75"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <div className="flex flex-col items-center gap-2 pt-1">
                <p className="text-xs text-muted-foreground">
                    Showing {categories?.from ?? 0}–{categories?.to ?? 0} of{" "}
                    {categories?.total ?? 0} categories
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(categories?.prev_page_url)}
                        disabled={!categories?.prev_page_url}
                        className="h-7 text-xs"
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(categories?.next_page_url)}
                        disabled={!categories?.next_page_url}
                        className="h-7 text-xs"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
