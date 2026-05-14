"use client";

import { ChevronRight } from "lucide-react";
import { Link, usePage, router } from "@inertiajs/react";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from "@/components/ui/sidebar";

// Helper function to check if URL matches the menu item
function isUrlActive(currentUrl, itemUrl) {
    if (!itemUrl) return false;

    // Exact match
    if (currentUrl === itemUrl) return true;

    // Check if current URL starts with item URL (for nested routes like /admin/users/create)
    // But make sure we don't match /admin/users when on /admin/users/roles
    if (itemUrl !== "/admin/users" && currentUrl.startsWith(itemUrl + "/")) {
        return true;
    }

    // Special handling for /admin/users to match /admin/users, /admin/users/create, /admin/users/1/edit
    if (
        itemUrl === "/admin/users" &&
        currentUrl.match(/^\/admin\/users(\/create|\/\d+\/edit)?$/)
    ) {
        return true;
    }

    return false;
}

// Helper function to check if any submenu item is active
function isAnySubItemActive(items, currentUrl) {
    if (!items) return false;

    for (const item of items) {
        if (isUrlActive(currentUrl, item.href)) return true;
        if (item.items && isAnySubItemActive(item.items, currentUrl))
            return true;
    }
    return false;
}

// ─── Helper: render badge setiap item / sub ────────────────────────────
function ItemBadge({ item, className = "" }) {
    if (item.isComing) {
        return (
            <SidebarMenuBadge
                className={`opacity-50 absolute right-2 top-1/2 -translate-y-1/2 ${className}`}
            >
                Coming
            </SidebarMenuBadge>
        );
    }
    if (item.isNew) {
        return (
            <SidebarMenuBadge
                className={`border border-green-400 text-green-600 absolute right-2 top-1/2 -translate-y-1/2 ${className}`}
            >
                New
            </SidebarMenuBadge>
        );
    }
    if (item.isDataBadge) {
        return (
            <SidebarMenuBadge
                className={`absolute right-2 top-1/2 -translate-y-1/2 ${className}`}
            >
                {item.isDataBadge}
            </SidebarMenuBadge>
        );
    }
    return null;
}

// ─── Helper: render badge inline ────────────────────────────
function InlineBadge({ item }) {
    if (item.isComing) {
        return (
            <span className="ml-auto text-xs opacity-50 leading-none">
                Coming
            </span>
        );
    }
    if (item.isNew) {
        return (
            <span className="ml-auto text-xs border border-green-400 text-green-600 rounded px-1 leading-none">
                New
            </span>
        );
    }
    if (item.isDataBadge) {
        return (
            <span className="ml-auto text-xs leading-none">
                {item.isDataBadge}
            </span>
        );
    }
    return null;
}

export function NavMain({ navItems = [] }) {
    const { url } = usePage();
    const { isMobile } = useSidebar();

    return (
        <>
            {navItems.map((nav, navIdx) => (
                <SidebarGroup
                    className="px-4 group-data-[collapsible=icon]:px-2!"
                    key={`${nav.title}-${navIdx}`}
                >
                    <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
                        {nav.title}
                    </SidebarGroupLabel>
                    <SidebarGroupContent className="flex flex-col gap-2">
                        <SidebarMenu className="group-data-[collapsible=icon]:px-0">
                            {nav.items.map((item, itemIdx) => {
                                const isActive = isUrlActive(url, item.href);
                                const hasActiveChild = item.items
                                    ? isAnySubItemActive(item.items, url)
                                    : false;
                                const isCollapsibleOpen =
                                    hasActiveChild || isActive;

                                return (
                                    <SidebarMenuItem
                                        key={`${nav.title}-${item.title}-${itemIdx}`}
                                        className="relative"
                                    >
                                        {Array.isArray(item.items) &&
                                        item.items.length > 0 ? (
                                            <>
                                                {/* ── Collapsed icon mode ── */}
                                                <div className="hidden group-data-[collapsible=icon]:block">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <SidebarMenuButton
                                                                tooltip={
                                                                    item.title
                                                                }
                                                                isActive={
                                                                    isActive ||
                                                                    hasActiveChild
                                                                }
                                                            >
                                                                {item.icon && (
                                                                    <item.icon />
                                                                )}
                                                                <span>
                                                                    {item.title}
                                                                </span>
                                                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                            </SidebarMenuButton>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            side={
                                                                isMobile
                                                                    ? "bottom"
                                                                    : "right"
                                                            }
                                                            align={
                                                                isMobile
                                                                    ? "end"
                                                                    : "start"
                                                            }
                                                            className="min-w-48 rounded-lg"
                                                        >
                                                            <DropdownMenuLabel>
                                                                {item.title}
                                                            </DropdownMenuLabel>
                                                            {item.items?.map(
                                                                (
                                                                    sub,
                                                                    subIdx,
                                                                ) => (
                                                                    <DropdownMenuItem
                                                                        className="hover:text-foreground active:text-foreground hover:bg-(--primary)/10! active:bg-(--primary)/10!"
                                                                        asChild
                                                                        key={`${item.title}-${sub.title}-${subIdx}`}
                                                                    >
                                                                        <Link
                                                                            href={
                                                                                sub.href
                                                                            }
                                                                        >
                                                                            <span>
                                                                                {
                                                                                    sub.title
                                                                                }
                                                                            </span>
                                                                            <InlineBadge
                                                                                item={
                                                                                    sub
                                                                                }
                                                                            />
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                ),
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>

                                                <Collapsible
                                                    className="group/collapsible block group-data-[collapsible=icon]:hidden"
                                                    defaultOpen={
                                                        isCollapsibleOpen
                                                    }
                                                >
                                                    <CollapsibleTrigger asChild>
                                                        <SidebarMenuButton
                                                            className="hover:text-foreground active:text-foreground hover:bg-(--primary)/10 active:bg-(--primary)/10"
                                                            isActive={
                                                                isActive ||
                                                                hasActiveChild
                                                            }
                                                            tooltip={item.title}
                                                            asChild
                                                        >
                                                            <Link
                                                                href={item.href}
                                                            >
                                                                {item.icon && (
                                                                    <item.icon />
                                                                )}
                                                                <span>
                                                                    {item.title}
                                                                </span>
                                                                <ItemBadge
                                                                    item={item}
                                                                />
                                                            </Link>
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>

                                                    <CollapsibleContent>
                                                        <SidebarMenuSub>
                                                            {item.items?.map(
                                                                (
                                                                    sub,
                                                                    subIdx,
                                                                ) => {
                                                                    const isSubActive =
                                                                        isUrlActive(
                                                                            url,
                                                                            sub.href,
                                                                        );
                                                                    return (
                                                                        <SidebarMenuSubItem
                                                                            key={`${item.title}-${sub.title}-${subIdx}`}
                                                                            className="relative"
                                                                        >
                                                                            <SidebarMenuSubButton
                                                                                className="hover:text-foreground active:text-foreground hover:bg-(--primary)/10 active:bg-(--primary)/10"
                                                                                isActive={
                                                                                    isSubActive
                                                                                }
                                                                                asChild
                                                                            >
                                                                                <Link
                                                                                    href={
                                                                                        sub.href
                                                                                    }
                                                                                    target={
                                                                                        sub.newTab
                                                                                            ? "_blank"
                                                                                            : undefined
                                                                                    }
                                                                                >
                                                                                    <span>
                                                                                        {
                                                                                            sub.title
                                                                                        }
                                                                                    </span>
                                                                                </Link>
                                                                            </SidebarMenuSubButton>

                                                                            <ItemBadge
                                                                                item={
                                                                                    sub
                                                                                }
                                                                            />
                                                                        </SidebarMenuSubItem>
                                                                    );
                                                                },
                                                            )}
                                                        </SidebarMenuSub>
                                                    </CollapsibleContent>
                                                </Collapsible>

                                                <ItemBadge item={item} />
                                            </>
                                        ) : (
                                            <SidebarMenuButton
                                                className="hover:text-foreground active:text-foreground hover:bg-(--primary)/10 active:bg-(--primary)/10"
                                                isActive={isActive}
                                                tooltip={item.title}
                                                onClick={() =>
                                                    router.visit(item.href)
                                                }
                                            >
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                                <ItemBadge item={item} />
                                            </SidebarMenuButton>
                                        )}
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            ))}
        </>
    );
}
