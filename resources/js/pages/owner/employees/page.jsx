import { useState, useEffect } from "react";
import { route } from "ziggy-js";
import { Head, router, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/dashboard/AppLayout";
import { EmployeeTable } from "./_components/EmployeeTable";
import { EmployeeList } from "./_components/EmployeeList";
import { PendingInvitations } from "./_components/PendingInvitations";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users, ShieldCheck, Loader2 } from "lucide-react";
import { Toaster, toast } from "sonner";
import { DeleteDialog } from "@/components/shared/DeleteDialog";
import { useDeviceType } from "@/hooks/use-mobile";

export default function EmployeesPage({
    employees,
    pendingInvitations,
    filters,
    employeeCount,
    maxEmployees,
}) {
    const [deleteEmployee, setDeleteEmployee] = useState(null);
    const [revokeInvitation, setRevokeInvitation] = useState(null);
    const [loading, setLoading] = useState(false);
    const { flash } = usePage().props;
    const deviceType = useDeviceType();

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const limitReached = employeeCount >= maxEmployees;

    const handleSearch = (value) => {
        setLoading(true);
        router.get(
            route("owner.employees"),
            { search: value },
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
            <Head title="Owner — Employees" />
            <div className="space-y-6 p-4 md:p-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Employees
                        </h1>
                        {loading && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                    </div>
                    <Button
                        onClick={() =>
                            router.visit(route("owner.employees.create"))
                        }
                        disabled={limitReached}
                        className="h-9 w-9 p-0 sm:h-10 sm:w-auto sm:px-4"
                    >
                        <UserPlus className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Add Employee</span>
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Card className="shadow-none">
                        <CardHeader className="p-4 sm:p-6">
                            <CardDescription>Total Employees</CardDescription>
                            <CardTitle className="font-display text-2xl">
                                {employeeCount}/{maxEmployees}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline" className="p-2">
                                    <Users className="h-3.5 w-3.5" />
                                </Badge>
                            </CardAction>
                        </CardHeader>
                    </Card>

                    <Card className="shadow-none">
                        <CardHeader className="p-4 sm:p-6">
                            <CardDescription>Slots Available</CardDescription>
                            <CardTitle className="font-display text-2xl">
                                {Math.max(0, maxEmployees - employeeCount)}
                            </CardTitle>
                            <CardAction>
                                <Badge
                                    variant={
                                        limitReached ? "destructive" : "outline"
                                    }
                                    className="p-2"
                                >
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                </Badge>
                            </CardAction>
                        </CardHeader>
                    </Card>
                </div>

                <PendingInvitations
                    invitations={pendingInvitations}
                    onRevoke={setRevokeInvitation}
                />

                {deviceType !== "desktop" ? (
                    <EmployeeList
                        employees={employees}
                        filters={filters}
                        onDelete={setDeleteEmployee}
                        onSearch={handleSearch}
                        deviceType={deviceType}
                    />
                ) : (
                    <EmployeeTable
                        employees={employees}
                        filters={filters}
                        onDelete={setDeleteEmployee}
                        onSearch={handleSearch}
                    />
                )}
            </div>

            <DeleteDialog
                item={deleteEmployee}
                open={!!deleteEmployee}
                onOpenChange={(open) => !open && setDeleteEmployee(null)}
                routeName="owner.employees.destroy"
                title="Remove Employee"
                description="The employee will lose access immediately. Their transaction history will be kept."
                label="Remove Employee"
                meta={
                    <p className="text-sm font-medium text-destructive">
                        Employee to remove:{" "}
                        <span className="font-bold wrap-break-word">
                            {deleteEmployee?.name}
                        </span>
                    </p>
                }
            />

            <DeleteDialog
                item={revokeInvitation}
                open={!!revokeInvitation}
                onOpenChange={(open) => !open && setRevokeInvitation(null)}
                routeName="owner.employees.invitations.revoke"
                title="Revoke Invitation"
                description="The invite link will stop working immediately."
                label="Revoke Invitation"
                meta={
                    <p className="text-sm font-medium text-destructive">
                        Invitation to revoke:{" "}
                        <span className="font-bold wrap-break-word">
                            {revokeInvitation?.name || "Unnamed invite"}
                        </span>
                    </p>
                }
            />

            <Toaster position="top-right" richColors />
        </>
    );
}

EmployeesPage.layout = (page) => <AppLayout>{page}</AppLayout>;
