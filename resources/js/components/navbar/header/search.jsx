"use client";

import React, { useEffect, useState } from "react";
import { CommandIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { router, usePage } from "@inertiajs/react";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { navItems } from "@/lib/sidebar-data";

export default function Search() {
    const [open, setOpen] = useState(false);
    const { props } = usePage();
    const userRole = props.auth?.user?.role || "owner";

    useEffect(() => {
        const down = (e) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const checkItemPermission = (item, role) => {
        const href = item.href || "";

        const adminOnlyRoutes = [
            "/admin",
            "/admin/users",
            "/admin/invite-codes",
            "/admin/stores",
            "/admin/settings",
        ];

        const ownerOnlyRoutes = [
            "/owner",
            "/owner/dashboard",
            "/owner/products",
            "/owner/categories",
            "/owner/capital-prices",
            "/owner/transactions",
            "/owner/expenses",
            "/owner/wallet",
            "/owner/reports",
            "/owner/settings",
        ];

        const cashierOnlyRoutes = [
            "/cashier",
            "/cashier/pos",
            "/cashier/transactions",
        ];

        if (adminOnlyRoutes.some((route) => href.startsWith(route))) {
            return role === "super_admin";
        }

        if (ownerOnlyRoutes.some((route) => href.startsWith(route))) {
            return ["super_admin", "owner"].includes(role);
        }

        if (cashierOnlyRoutes.some((route) => href.startsWith(route))) {
            return ["super_admin", "owner", "cashier"].includes(role);
        }

        return true;
    };

    const getFilteredNavItems = () => {
        const adminRoles = ["super_admin"];

        const ownerRoles = ["owner"];

        const cashierRoles = ["owner", "cashier"];

        const filtered = [];

        for (const route of navItems) {
            let isRouteVisible = false;

            if (route.title === "Admin") {
                isRouteVisible = adminRoles.includes(userRole);
            } else if (route.title === "Owner") {
                isRouteVisible = ownerRoles.includes(userRole);
            } else if (route.title === "Cashier") {
                isRouteVisible = cashierRoles.includes(userRole);
            } else {
                isRouteVisible = true;
            }

            if (!isRouteVisible) continue;

            const filteredItems = [];

            for (const item of route.items) {
                if (item.items) {
                    const filteredSubItems = [];
                    for (const subItem of item.items) {
                        if (checkItemPermission(subItem, userRole)) {
                            filteredSubItems.push(subItem);
                        }
                    }

                    if (filteredSubItems.length > 0) {
                        filteredItems.push({
                            ...item,
                            items: filteredSubItems,
                        });
                    }
                } else {
                    if (checkItemPermission(item, userRole)) {
                        filteredItems.push(item);
                    }
                }
            }

            if (filteredItems.length > 0) {
                filtered.push({
                    ...route,
                    items: filteredItems,
                });
            }
        }

        return filtered;
    };

    const filteredNavItems = getFilteredNavItems();

    const getFlatItems = (route) => {
        const items = [];
        for (const item of route.items) {
            if (item.items) {
                for (const sub of item.items) {
                    items.push({
                        title: sub.title,
                        href: sub.href,
                        icon: item.icon,
                    });
                }
            } else {
                items.push({
                    title: item.title,
                    href: item.href,
                    icon: item.icon,
                });
            }
        }
        return items;
    };

    return (
        <div className="lg:flex-1">
            <div className="relative hidden max-w-sm flex-1 lg:block">
                <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                    className="h-9 w-full cursor-pointer rounded-md border pr-4 pl-10 text-sm shadow-xs"
                    placeholder="Search..."
                    type="search"
                    onFocus={() => setOpen(true)}
                />
                <div className="absolute top-1/2 right-2 hidden -translate-y-1/2 items-center gap-0.5 rounded-sm bg-zinc-200 p-1 font-mono text-xs font-medium sm:flex dark:bg-neutral-700">
                    <CommandIcon className="size-3" />
                    <span>k</span>
                </div>
            </div>
            <div className="block lg:hidden">
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setOpen(true)}
                >
                    <SearchIcon />
                </Button>
            </div>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <VisuallyHidden>
                    <DialogHeader>
                        <DialogTitle>Search Menu</DialogTitle>
                    </DialogHeader>
                </VisuallyHidden>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    {filteredNavItems.map((route) => (
                        <React.Fragment key={route.title}>
                            <CommandGroup heading={route.title}>
                                {getFlatItems(route).map((flatItem, key) => (
                                    <CommandItem
                                        key={key}
                                        onSelect={() => {
                                            setOpen(false);
                                            router.visit(flatItem.href);
                                        }}
                                    >
                                        {flatItem.icon && (
                                            <flatItem.icon className="mr-2 h-4 w-4" />
                                        )}
                                        <span>{flatItem.title}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                            <CommandSeparator />
                        </React.Fragment>
                    ))}
                </CommandList>
            </CommandDialog>
        </div>
    );
}
