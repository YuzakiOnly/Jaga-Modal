import { useEffect, useState, useCallback } from "react";
import { Head, Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Clock, CheckCircle2, XCircle, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const POLL_INTERVAL_MS = 5000;

export default function EmployeePending({ status: initialStatus, name }) {
    const [status, setStatus] = useState(initialStatus);

    const checkStatus = useCallback(async () => {
        try {
            const res = await fetch(route("employee.pending.status"), {
                headers: { Accept: "application/json" },
            });
            if (!res.ok) return;
            const data = await res.json();
            setStatus(data.status);
        } catch {
            // silently ignore network hiccups, next poll will retry
        }
    }, []);

    useEffect(() => {
        if (status !== "pending") return;

        const interval = setInterval(checkStatus, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [status, checkStatus]);

    return (
        <>
            <Head title="Waiting for Approval" />
            <div className="flex min-h-screen items-center justify-center bg-[#fff8f0] px-4">
                <Card className="w-full max-w-sm shadow-sm">
                    <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                        {status === "pending" && (
                            <>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fe5e00]/10">
                                    <Clock className="h-6 w-6 animate-pulse text-[#fe5e00]" />
                                </div>
                                <h1 className="text-lg font-bold tracking-tight text-[#1a1110]">
                                    Waiting for Approval
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Hi {name}, your account has been created.
                                    Please wait for the store owner to approve
                                    your access. This page will update
                                    automatically.
                                </p>
                            </>
                        )}

                        {status === "approved" && (
                            <>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                </div>
                                <h1 className="text-lg font-bold tracking-tight text-[#1a1110]">
                                    Your account is now active
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    You're approved. Log in to start working.
                                </p>
                                <Button asChild className="mt-2 w-full">
                                    <Link href={route("login")}>
                                        <Store className="mr-2 h-4 w-4" />
                                        Go to Login
                                    </Link>
                                </Button>
                            </>
                        )}

                        {status === "rejected" && (
                            <>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                                    <XCircle className="h-6 w-6 text-destructive" />
                                </div>
                                <h1 className="text-lg font-bold tracking-tight text-[#1a1110]">
                                    Request Declined
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    The store owner declined this request.
                                    Contact them if you believe this is a
                                    mistake.
                                </p>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="mt-2 w-full"
                                >
                                    <Link href={route("login")}>
                                        Back to Login
                                    </Link>
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
