import { useState, useEffect } from "react";
import { route } from "ziggy-js";
import { Head, router, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/dashboard/AppLayout";
import { UserTable } from "./_components/UserTable";
import { DeleteUserDialog } from "./_components/DeleteUserDialog";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    UserPlus,
    Users as UsersIcon,
    ShieldCheck,
    Crown,
    Receipt,
    Loader2,
} from "lucide-react";
import { Toaster, toast } from "sonner";

export default function UsersPage({ users, filters }) {
    const [deleteUser, setDeleteUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const countByRole = (role) =>
        users.data?.filter((u) => u.role === role).length ?? 0;

    const totalUsers = users.total ?? users.data?.length ?? 0;

    // Handle search dengan debounce
    const handleSearch = (value) => {
        setLoading(true);
        router.get(
            route("admin.users"),
            { search: value, role: filters?.role || "all" },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setLoading(false),
            },
        );
    };

    // Handle filter role
    const handleRoleChange = (value) => {
        setLoading(true);
        router.get(
            route("admin.users"),
            { search: filters?.search || "", role: value },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setLoading(false),
            },
        );
    };

    return (
        <>
            <Head title="Admin — Users" />

            <div className="space-y-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Users
                        </h1>
                        {loading && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                    </div>
                    <Button
                        onClick={() =>
                            router.visit(route("admin.users.create"))
                        }
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add User
                    </Button>
                </div>

                {/* Stat Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 ">
                    <Card className="shadow-none!">
                        <CardHeader>
                            <CardDescription>Total Users</CardDescription>
                            <CardTitle className="font-display text-2xl lg:text-3xl">
                                {totalUsers}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    <UsersIcon className="h-3 w-3" />
                                </Badge>
                            </CardAction>
                        </CardHeader>
                    </Card>
                    <Card className="shadow-none!">
                        <CardHeader>
                            <CardDescription>Super Admins</CardDescription>
                            <CardTitle className="font-display text-2xl lg:text-3xl">
                                {countByRole("super_admin")}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    <ShieldCheck className="h-3 w-3 text-violet-600" />
                                </Badge>
                            </CardAction>
                        </CardHeader>
                    </Card>
                    <Card className="shadow-none!">
                        <CardHeader>
                            <CardDescription>Owners</CardDescription>
                            <CardTitle className="font-display text-2xl lg:text-3xl">
                                {countByRole("owner")}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    <Crown className="h-3 w-3 text-amber-600" />
                                </Badge>
                            </CardAction>
                        </CardHeader>
                    </Card>
                    <Card className="shadow-none!">
                        <CardHeader>
                            <CardDescription>Cashiers</CardDescription>
                            <CardTitle className="font-display text-2xl lg:text-3xl">
                                {countByRole("cashier")}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    <Receipt className="h-3 w-3 text-sky-600" />
                                </Badge>
                            </CardAction>
                        </CardHeader>
                    </Card>
                </div>

                {/* Table */}
                <div className="pt-4">
                    <UserTable
                        users={users}
                        filters={filters}
                        onDelete={setDeleteUser}
                        onEdit={(user) =>
                            router.visit(route("admin.users.edit", user.id))
                        }
                        onSearch={handleSearch}
                        onFilterChange={handleRoleChange}
                    />
                    <UserTable
                        users={users}
                        filters={filters}
                        onDelete={setDeleteUser}
                        onEdit={(user) =>
                            router.visit(route("admin.users.edit", user.id))
                        }
                        onSearch={handleSearch}
                        onFilterChange={handleRoleChange}
                    />
                </div>
            </div>

            <DeleteUserDialog
                user={deleteUser}
                open={!!deleteUser}
                onOpenChange={(open) => !open && setDeleteUser(null)}
            />
            <Toaster position="top-right" richColors />
        </>
    );
}

UsersPage.layout = (page) => <AppLayout>{page}</AppLayout>;
