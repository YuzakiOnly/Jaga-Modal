import {
    ArrowUpDown,
    MoreHorizontal,
    Pencil,
    Trash2,
    Tags,
} from "lucide-react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);

export const columns = (onDelete) => [
    // ── Name ──────────────────────────────────────────────────────────────────
    {
        accessorKey: "name",
        enableHiding: false,
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Nama Template
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const name = row.getValue("name");
            return (
                <div className="flex items-center gap-3">
                    <Tags className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                        <p className="text-sm font-medium">{name}</p>
                    </div>
                </div>
            );
        },
    },

    // ── Amount (HPP) ──────────────────────────────────────────────────────────
    {
        accessorKey: "amount",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Nominal HPP
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"));
            return (
                <span className="font-mono font-semibold text-emerald-600">
                    {formatRupiah(amount)}
                </span>
            );
        },
    },

    // ── Description ───────────────────────────────────────────────────────────
    {
        accessorKey: "description",
        header: "Deskripsi",
        cell: ({ row }) => {
            const desc = row.getValue("description");
            return desc ? (
                <span className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
                    {desc}
                </span>
            ) : (
                <span className="text-muted-foreground/40">—</span>
            );
        },
    },

    // ── Status toggle ─────────────────────────────────────────────────────────
    {
        accessorKey: "is_active",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Status
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const isActive = row.getValue("is_active");

            const handleToggle = () => {
                router.patch(
                    route("owner.capital-prices.toggle", row.original.id),
                    {},
                    { preserveScroll: true },
                );
            };

            return (
                <div className="flex items-center gap-2">
                    <Switch
                        checked={isActive}
                        onCheckedChange={handleToggle}
                        className="data-[state=checked]:bg-emerald-500"
                    />
                    <span
                        className={`text-xs ${isActive ? "text-emerald-600" : "text-muted-foreground"}`}
                    >
                        {isActive ? "Aktif" : "Nonaktif"}
                    </span>
                </div>
            );
        },
    },

    // ── Created at ────────────────────────────────────────────────────────────
    {
        accessorKey: "created_at",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Dibuat
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) =>
            new Date(row.getValue("created_at")).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
            }),
    },

    // ── Actions ───────────────────────────────────────────────────────────────
    {
        id: "actions",
        enableHiding: false,
        header: () => <div className="text-center">Aksi</div>,
        cell: ({ row }) => {
            const template = row.original;

            return (
                <div className="flex justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 ring-0! hover:bg-transparent!"
                            >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={() =>
                                    router.visit(
                                        route(
                                            "owner.capital-prices.edit",
                                            template.id,
                                        ),
                                    )
                                }
                                className="gap-2 text-sm"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => onDelete(template)}
                                className="gap-2 text-sm text-destructive focus:text-destructive"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Hapus
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
