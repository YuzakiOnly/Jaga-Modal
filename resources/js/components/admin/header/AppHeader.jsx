"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AppHeader() {
    return (
        <header className="flex h-14 shrink-0 items-center gap-3 px-4 border-b border-border">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />

            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                    placeholder="Search..."
                    className="pl-8 h-8 bg-background/60 border-border/50 text-sm focus-visible:ring-1"
                />
            </div>

            <div className="ml-auto flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-foreground relative"
                >
                    <Bell className="size-4" />
                    <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary" />
                </Button>
            </div>
        </header>
    );
}
