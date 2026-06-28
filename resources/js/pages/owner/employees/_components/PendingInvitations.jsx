import { useState } from "react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Copy, Check, X, Link2, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const roleLabel = (role) => {
    if (role === "cashier") return "Cashier";
    return role;
};

function timeLeft(expiresAt) {
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    if (diffMs <= 0) return "Expired";
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours < 1) return "Expires soon";
    if (hours < 24) return `${hours}h left`;
    const days = Math.floor(hours / 24);
    return `${days}d left`;
}

export function PendingInvitations({ invitations, onRevoke }) {
    const [copiedId, setCopiedId] = useState(null);

    if (!invitations || invitations.length === 0) return null;

    const handleCopy = async (invitation) => {
        const url = `${window.location.origin}/invite/${invitation.token}`;
        await navigator.clipboard.writeText(url);
        setCopiedId(invitation.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
                Pending Invitations
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
                {invitations.map((invitation) => (
                    <Card key={invitation.id} className="shadow-none">
                        <CardContent className="flex items-center gap-3 p-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff3e8]">
                                <Link2 className="h-4 w-4 text-[#fe5e00]" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">
                                    {invitation.name || "Unnamed invite"}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Badge
                                        variant="outline"
                                        className="capitalize text-[10px] py-0"
                                    >
                                        {roleLabel(invitation.role)}
                                    </Badge>
                                    <span className="inline-flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {timeLeft(invitation.expires_at)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex shrink-0 gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleCopy(invitation)}
                                >
                                    {copiedId === invitation.id ? (
                                        <Check className="h-4 w-4 text-emerald-600" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => onRevoke(invitation)}
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
