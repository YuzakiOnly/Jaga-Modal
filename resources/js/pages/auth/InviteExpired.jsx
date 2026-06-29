import { Head, Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import { LinkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function InviteExpired() {
    return (
        <>
            <Head title="Invite Invalid" />
            <div className="flex min-h-screen items-center justify-center bg-[#fff8f0] px-4">
                <Card className="w-full max-w-sm shadow-sm">
                    <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                            <LinkIcon className="h-6 w-6 text-destructive" />
                        </div>
                        <h1 className="text-lg font-bold tracking-tight text-[#1a1110]">
                            This invite link is no longer valid
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            It may have expired or already been used. Ask your
                            employer for a new invite link.
                        </p>
                        <Button asChild className="mt-2 w-full">
                            <Link href={route("login")}>Go to Login</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
