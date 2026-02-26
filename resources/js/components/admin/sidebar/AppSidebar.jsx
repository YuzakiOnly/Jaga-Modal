"use client";

import * as React from "react";
import { useEffect } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Plus } from "lucide-react";
import { Link, usePage } from "@inertiajs/react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/admin/sidebar/NavMain";
import { NavUser } from "@/components/admin/sidebar/NavUser";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

function Logo() {
    return (
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold shrink-0">
            S
        </div>
    );
}

export function AppSidebar({
    appName = "Shadcn UI Kit",
    projects = [],
    navItems = [],
    user,
    ...props
}) {
    const { url } = usePage();
    const { setOpenMobile, isMobile } = useSidebar();

    useEffect(() => {
        if (isMobile) setOpenMobile(false);
    }, [url]);

    return (
        <Sidebar collapsible="icon" className="border-none" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="hover:text-foreground h-10 group-data-[collapsible=icon]:px-0! hover:bg-(--primary)/5">
                                    <Logo />
                                    <span className="font-semibold">
                                        {appName}
                                    </span>
                                    <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="mt-4 w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                                side={isMobile ? "bottom" : "right"}
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel>Projects</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {projects.map((project) => (
                                    <DropdownMenuItem
                                        key={project.id}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="flex size-8 items-center justify-center rounded-md border">
                                            <project.icon className="text-muted-foreground size-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">
                                                {project.name}
                                            </span>
                                            <span
                                                className={`text-xs ${project.statusColor}`}
                                            >
                                                {project.status}
                                            </span>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <Button className="w-full">
                                    <Plus />
                                    New Project
                                </Button>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <ScrollArea className="h-full">
                    <NavMain navItems={navItems} />
                </ScrollArea>
            </SidebarContent>

            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
        </Sidebar>
    );
}
