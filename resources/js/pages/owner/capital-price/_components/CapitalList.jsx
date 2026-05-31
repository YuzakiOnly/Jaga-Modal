import { useState } from "react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import {
    Pencil,
    Trash2,
    Tags,
    MoreVertical,
    FilterIcon,
    SearchIcon,
    X,
    ChevronDown,
    Check,
    Wallet,
    Package,
    Calculator,
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

const statusOptions = [
    { value: "all", label: "Semua Status" },
    { value: "active", label: "Aktif" },
    { value: "inactive", label: "Nonaktif" },
];

const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);

export function CapitalList({
    templates,
    filters,
    onDelete,
    onSearch,
    onFilterChange,
}) {
    const data = templates?.data ?? [];
    const [loadingId, setLoadingId] = useState(null);
    const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);

    const handleToggleStatus = (templateId) => {
        setLoadingId(templateId);
        router.patch(
            route("owner.capital-prices.toggle", templateId),
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

    return (
        <div className="space-y-3">
            <div className="space-y-2">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Cari template HPP..."
                        value={filters?.search || ""}
                        onChange={(e) => onSearch(e.target.value)}
                        className="h-10 pl-9 pr-9 text-sm"
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
                            className="h-10 w-full justify-between text-sm"
                        >
                            <span className="flex items-center gap-2">
                                <FilterIcon className="h-3.5 w-3.5" />
                                <span className="truncate">
                                    {getSelectedStatusLabel()}
                                </span>
                            </span>
                            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-44 p-0" align="start">
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
                                            <Check className="h-3.5 w-3.5" />
                                        )}
                                </button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>

                {filters?.status && filters.status !== "all" && (
                    <div className="flex flex-wrap gap-2">
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
            </div>

            <div className="space-y-2">
                {data.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-center">
                        <div className="space-y-2">
                            <Tags className="mx-auto h-8 w-8 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">
                                Tidak ada template HPP ditemukan
                            </p>
                        </div>
                    </div>
                ) : (
                    data.map((template) => (
                        <Card
                            key={template.id}
                            className="overflow-hidden shadow-sm"
                        >
                            <CardContent className="p-3">
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                        <Calculator className="h-5 w-5 text-emerald-600" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-1">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium truncate">
                                                    {template.name}
                                                </h3>
                                                {template.product_name && (
                                                    <p className="text-[10px] text-muted-foreground truncate">
                                                        Produk:{" "}
                                                        {template.product_name}
                                                    </p>
                                                )}
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 shrink-0 -mt-1 -mr-1"
                                                    >
                                                        <MoreVertical className="h-3.5 w-3.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            router.visit(
                                                                route(
                                                                    "owner.capital-prices.edit",
                                                                    template.id,
                                                                ),
                                                            )
                                                        }
                                                        className="gap-2 text-xs"
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            onDelete(template)
                                                        }
                                                        className="gap-2 text-xs text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                        Hapus
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="mt-1">
                                            <p className="text-sm font-semibold text-emerald-600 tabular-nums">
                                                {formatRupiah(template.amount)}
                                            </p>
                                        </div>

                                        {template.description && (
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                {template.description}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between mt-2 pt-2 border-t">
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[10px] px-1.5 py-0"
                                                >
                                                    <Package className="h-2.5 w-2.5 mr-0.5" />
                                                    {template.ingredients
                                                        ?.length || 0}{" "}
                                                    bahan
                                                </Badge>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {new Date(
                                                        template.created_at,
                                                    ).toLocaleDateString(
                                                        "id-ID",
                                                        {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric",
                                                        },
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-[10px] text-muted-foreground">
                                                    Aktif
                                                </span>
                                                <Switch
                                                    checked={template.is_active}
                                                    onCheckedChange={() =>
                                                        handleToggleStatus(
                                                            template.id,
                                                        )
                                                    }
                                                    disabled={
                                                        loadingId ===
                                                        template.id
                                                    }
                                                    className="data-[state=checked]:bg-emerald-500 scale-75"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {(templates?.prev_page_url || templates?.next_page_url) && (
                <div className="flex flex-col gap-2 pt-2">
                    <div className="text-xs text-muted-foreground text-center">
                        Menampilkan {templates?.from ?? 0}–{templates?.to ?? 0}{" "}
                        dari {templates?.total ?? 0} template
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (templates?.prev_page_url) {
                                    router.get(
                                        templates.prev_page_url,
                                        {},
                                        { preserveState: true },
                                    );
                                }
                            }}
                            disabled={!templates?.prev_page_url}
                            className="h-8 text-xs"
                        >
                            Sebelumnya
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (templates?.next_page_url) {
                                    router.get(
                                        templates.next_page_url,
                                        {},
                                        { preserveState: true },
                                    );
                                }
                            }}
                            disabled={!templates?.next_page_url}
                            className="h-8 text-xs"
                        >
                            Berikutnya
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
