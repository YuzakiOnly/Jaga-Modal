"use client";

import { PanelLeftIcon } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import Notifications from "@/components/navbar/header/notifications";
import Search from "@/components/navbar/header/search";
import ThemeSwitch from "@/components/navbar/header/theme-switch";
import UserMenu from "@/components/navbar/header/user-menu";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

export function AppHeader() {
    const { toggleSidebar, isMobile } = useSidebar();

    return (
        <header className="bg-background/40 sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) md:rounded-tl-xl md:rounded-tr-xl">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2">
                <Button
                    onClick={toggleSidebar}
                    size="icon"
                    variant="ghost"
                    className="hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                    <PanelLeftIcon className="h-5 w-5" />
                </Button>
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <Search />

                <div className="ml-auto flex items-center gap-2">
                    <Notifications />
                    <ThemeSwitch />
                    <Separator
                        orientation="vertical"
                        className="mx-2 data-[orientation=vertical]:h-4"
                    />
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}
