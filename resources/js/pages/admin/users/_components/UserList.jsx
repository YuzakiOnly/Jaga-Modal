import { MoreVertical, Pencil, Trash2, Users as UsersIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar } from "./Useravatar";
import { roleConfig } from "@/lib/users/userConstants";

export function UserList({
    users,
    currentUserId,
    currentUserRole,
    onEdit,
    onDelete,
}) {
    const data = users?.data ?? [];

    return (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {data.length === 0 ? (
                <div className="col-span-2 flex items-center justify-center py-12 text-center md:col-span-3">
                    <div className="space-y-2">
                        <UsersIcon className="mx-auto h-8 w-8 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                            No users found
                        </p>
                    </div>
                </div>
            ) : (
                data.map((user) => {
                    const isCurrentUser = user.id === currentUserId;
                    const isSuperAdmin = user.role === "super_admin";
                    const isPrimary = !!user.is_primary;
                    const isSelfSuperAdmin =
                        isCurrentUser && user.role === "super_admin";
                    const canEdit =
                        !isPrimary &&
                        !isSelfSuperAdmin &&
                        (currentUserRole === "super_admin" ||
                            (!isSuperAdmin && !isCurrentUser));
                    const canDelete =
                        !isPrimary &&
                        !isCurrentUser &&
                        !isSuperAdmin &&
                        currentUserRole === "super_admin";

                    const role = roleConfig[user.role];

                    return (
                        <Card
                            key={user.id}
                            className="overflow-hidden shadow-sm"
                        >
                            <CardContent className="p-2">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-start justify-between gap-1">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Avatar name={user.name} />
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium truncate">
                                                    {user.name}
                                                    {isCurrentUser && (
                                                        <span className="ml-1 text-[9px] text-muted-foreground">
                                                            (you)
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-[9px] text-muted-foreground truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 shrink-0 -mt-1 -mr-1"
                                                >
                                                    <MoreVertical className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel className="text-xs">
                                                    Actions
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => onEdit(user)}
                                                    disabled={!canEdit}
                                                    className="gap-2 text-xs"
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                    Edit user
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onDelete(user)
                                                    }
                                                    disabled={!canDelete}
                                                    className="gap-2 text-xs text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <p className="text-[10px] text-muted-foreground truncate">
                                        @{user.username}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-1">
                                        {role && (
                                            <Badge
                                                variant="outline"
                                                className={`gap-1 text-[9px] px-1.5 py-0 ${role.className}`}
                                            >
                                                {role.icon && (
                                                    <role.icon className="h-2.5 w-2.5" />
                                                )}
                                                {role.label}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between mt-1 pt-1 border-t">
                                        <div>
                                            <p className="text-[8px] text-muted-foreground">
                                                Phone
                                            </p>
                                            <p className="text-[10px] font-medium">
                                                {user.phone
                                                    ? `+${user.phone}`
                                                    : "—"}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] text-muted-foreground">
                                                Joined
                                            </p>
                                            <p className="text-[10px] font-medium">
                                                {new Date(
                                                    user.created_at,
                                                ).toLocaleDateString("en-GB", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })
            )}
        </div>
    );
}
