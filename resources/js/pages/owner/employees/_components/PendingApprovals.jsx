import { useState } from "react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Check, X, Clock, UserRound, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const roleLabel = (role) => {
    if (role === "cashier") return "Cashier";
    return role;
};

export function PendingApprovals({ approvals }) {
    const [processingId, setProcessingId] = useState(null);

    if (!approvals || approvals.length === 0) return null;

    const handleApprove = (employee) => {
        setProcessingId(employee.id);
        router.patch(
            route("owner.employees.approve", employee.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessingId(null),
            },
        );
    };

    const handleReject = (employee) => {
        setProcessingId(employee.id);
        router.patch(
            route("owner.employees.reject", employee.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessingId(null),
            },
        );
    };

    return (
        <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
                Pending Approval
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
                {approvals.map((employee) => (
                    <Card
                        key={employee.id}
                        className="shadow-none border-[#fe5e00]/30"
                    >
                        <CardContent className="flex items-center gap-3 p-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff3e8]">
                                <UserRound className="h-4 w-4 text-[#fe5e00]" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">
                                    {employee.name}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Badge
                                        variant="outline"
                                        className="capitalize text-[10px] py-0"
                                    >
                                        {roleLabel(employee.role)}
                                    </Badge>
                                    <span className="inline-flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Awaiting approval
                                    </span>
                                </div>
                            </div>
                            <div className="flex shrink-0 gap-1">
                                <Button
                                    type="button"
                                    size="icon"
                                    className="h-8 w-8 bg-emerald-600 hover:bg-emerald-700"
                                    onClick={() => handleApprove(employee)}
                                    disabled={processingId === employee.id}
                                >
                                    {processingId === employee.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Check className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => handleReject(employee)}
                                    disabled={processingId === employee.id}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
