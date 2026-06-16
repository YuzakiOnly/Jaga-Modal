"use client";

import * as React from "react";
import { useEffect } from "react";
import { ChevronsUpDown, Plus } from "lucide-react";
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
import { NavMain } from "@/components/sidebar-v1/NavMain";
import { NavUser } from "@/components/sidebar-v1/NavUser";
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
import { getNavItemsByRole } from "@/lib/sidebar-data";

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
    const { url, props: pageProps } = usePage();
    const { setOpenMobile, isMobile } = useSidebar();
    const userRole = pageProps.auth?.user?.role || "owner";

    const filteredNavItems = React.useMemo(() => {
        if (navItems && navItems.length > 0) {
            return filterNavItemsByRole(navItems, userRole);
        }
        return getNavItemsByRole(userRole);
    }, [navItems, userRole]);

    useEffect(() => {
        if (isMobile) setOpenMobile(false);
    }, [url, isMobile, setOpenMobile]);

    return (
        <Sidebar collapsible="icon" className="border-none" {...props}>
            <SidebarHeader className="px-3.5 pt-4 group-data-[collapsible=icon]:px-2.5 shrink-0">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="hover:text-foreground h-10 group-data-[collapsible=icon]:px-0! hover:bg-primary/5">
                                    <Logo />
                                    <span className="font-semibold truncate">
                                        {appName}
                                    </span>
                                    <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden shrink-0" />
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

            <SidebarContent className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                    <NavMain navItems={filteredNavItems} />
                </ScrollArea>
            </SidebarContent>

            <SidebarFooter className="shrink-0">
                <NavUser user={user} />
            </SidebarFooter>
        </Sidebar>
    );
}

function filterNavItemsByRole(navItems, role) {
    const filtered = [];

    for (const group of navItems) {
        if (group.permission && !group.permission.includes(role)) {
            continue;
        }

        const filteredItems = [];
        for (const item of group.items) {
            if (item.permission && !item.permission.includes(role)) {
                continue;
            }

            if (item.items) {
                const filteredSubItems = [];
                for (const subItem of item.items) {
                    if (
                        subItem.permission &&
                        !subItem.permission.includes(role)
                    ) {
                        continue;
                    }
                    filteredSubItems.push(subItem);
                }
                if (filteredSubItems.length > 0) {
                    filteredItems.push({
                        ...item,
                        items: filteredSubItems,
                    });
                }
            } else {
                filteredItems.push(item);
            }
        }

        if (filteredItems.length > 0) {
            filtered.push({
                ...group,
                items: filteredItems,
            });
        }
    }

    return filtered;
}
