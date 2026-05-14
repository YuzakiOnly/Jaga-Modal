import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar } from "./Useravatar";
import { roleConfig } from "@/lib/users/Userconstants";

// ─── Column definitions ───────────────────────────────────────────────────────
export const columns = (currentUserId, currentUserRole, onEdit, onDelete) => [
    {
        id: "select",
        header: ({ table }) => (
            <div className="flex justify-center">
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) =>
                        table.toggleAllPageRowsSelected(!!value)
                    }
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex justify-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
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
                User
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const isCurrentUser = row.original.id === currentUserId;
            return (
                <div className="flex items-center gap-3">
                    <Avatar name={row.original.name} />
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            {row.original.name}
                            {isCurrentUser && (
                                <span className="ml-1.5 text-[10px] text-muted-foreground">
                                    (you)
                                </span>
                            )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {row.original.email}
                        </p>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "username",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Username
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <span className="text-sm text-muted-foreground">
                @{row.getValue("username")}
            </span>
        ),
    },
    {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => {
            const phone = row.getValue("phone");
            return phone ? (
                <span className="text-sm text-muted-foreground">+{phone}</span>
            ) : (
                <span className="text-muted-foreground/40">—</span>
            );
        },
    },
    {
        accessorKey: "role",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Role
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const role = roleConfig[row.getValue("role")];
            if (!role) return null;
            const RoleIcon = role.icon;
            return (
                <Badge
                    variant="outline"
                    className={`gap-1 text-xs font-medium ${role.className}`}
                >
                    <RoleIcon className="h-3 w-3" />
                    {role.label}
                </Badge>
            );
        },
    },
    {
        accessorKey: "locale",
        header: "Language",
        cell: ({ row }) => (
            <span className="text-sm uppercase text-muted-foreground">
                {row.getValue("locale")}
            </span>
        ),
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Joined
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) =>
            new Date(row.getValue("created_at")).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
            }),
    },
    {
        id: "actions",
        enableHiding: false,
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => {
            const user = row.original;
            const isCurrentUser = user.id === currentUserId;
            const isSuperAdmin = user.role === "super_admin";
            const isSelfSuperAdmin =
                isCurrentUser && user.role === "super_admin";
            const canEdit =
                !isSelfSuperAdmin &&
                (currentUserRole === "super_admin" ||
                    (!isSuperAdmin && !isCurrentUser));
            const canDelete =
                !isCurrentUser &&
                !isSuperAdmin &&
                currentUserRole === "super_admin";

            return (
                <div className="flex justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 ring-0! hover:bg-transparent!">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onEdit(user)}
                                disabled={!canEdit}
                                className="gap-2 text-sm"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit user
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(user)}
                                disabled={!canDelete}
                                className="gap-2 text-sm text-destructive focus:text-destructive"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
