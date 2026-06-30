import { ChevronRight } from "lucide-react";
import { Link, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";

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
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

function resolveHref(item) {
    if (item.routeName) {
        try {
            const url = route(item.routeName);
            return url.replace(/^https?:\/\/[^/]+/, "");
        } catch {
            return "#";
        }
    }
    return item.href || "#";
}

function isUrlActive(currentUrl, itemUrl) {
    if (!itemUrl) return false;
    if (currentUrl === itemUrl) return true;
    if (
        itemUrl === "/admin/users" &&
        currentUrl.match(/^\/admin\/users(\/create|\/\d+\/edit)?$/)
    )
        return true;
    return false;
}

function isAnySubItemActive(items, currentUrl) {
    if (!items) return false;
    for (const item of items) {
        if (isUrlActive(currentUrl, resolveHref(item))) return true;
        if (item.items && isAnySubItemActive(item.items, currentUrl))
            return true;
    }
    return false;
}

function ItemBadge({ item }) {
    if (item.isComing)
        return (
            <SidebarMenuBadge className="opacity-50 absolute right-2 top-1/2 -translate-y-1/2 group-data-[collapsible=icon]:hidden">
                Coming
            </SidebarMenuBadge>
        );
    if (item.isNew)
        return (
            <SidebarMenuBadge className="border border-green-400 text-green-600 absolute right-2 top-1/2 -translate-y-1/2 group-data-[collapsible=icon]:hidden">
                New
            </SidebarMenuBadge>
        );
    if (item.isDataBadge)
        return (
            <SidebarMenuBadge className="absolute right-2 top-1/2 -translate-y-1/2 group-data-[collapsible=icon]:hidden">
                {item.isDataBadge}
            </SidebarMenuBadge>
        );
    return null;
}

function InlineBadge({ item }) {
    if (item.isComing)
        return (
            <span className="ml-auto text-xs opacity-50 leading-none">
                Coming
            </span>
        );
    if (item.isNew)
        return (
            <span className="ml-auto text-xs border border-green-400 text-green-600 rounded px-1 leading-none">
                New
            </span>
        );
    if (item.isDataBadge)
        return (
            <span className="ml-auto text-xs leading-none">
                {item.isDataBadge}
            </span>
        );
    return null;
}

export function NavMain({ navItems = [] }) {
    const { url } = usePage();
    const { isMobile, state } = useSidebar();
    const tooltipHidden = state !== "collapsed" || isMobile;

    return (
        <>
            {navItems.map((nav, navIdx) => (
                <SidebarGroup key={`${nav.title}-${navIdx}`}>
                    <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
                        {nav.title}
                    </SidebarGroupLabel>
                    <SidebarGroupContent className="flex flex-col gap-0.5">
                        <SidebarMenu>
                            {nav.items.map((item, itemIdx) => {
                                const itemHref = resolveHref(item);
                                const isActive = isUrlActive(url, itemHref);
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
                                                {/* Icon mode: dropdown */}
                                                <div className="hidden group-data-[collapsible=icon]:block">
                                                    <DropdownMenu>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <DropdownMenuTrigger
                                                                    asChild
                                                                >
                                                                    <SidebarMenuButton className="hover:text-foreground hover:bg-primary/10 transition-colors duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full">
                                                                        {item.icon && (
                                                                            <item.icon className="shrink-0" />
                                                                        )}
                                                                        <span className="group-data-[collapsible=icon]:hidden">
                                                                            {
                                                                                item.title
                                                                            }
                                                                        </span>
                                                                    </SidebarMenuButton>
                                                                </DropdownMenuTrigger>
                                                            </TooltipTrigger>
                                                            <TooltipContent
                                                                side="right"
                                                                align="center"
                                                                hidden={
                                                                    tooltipHidden
                                                                }
                                                            >
                                                                {item.title}
                                                            </TooltipContent>
                                                        </Tooltip>
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
                                                                        key={`${item.title}-${sub.title}-${subIdx}`}
                                                                        className="hover:text-foreground hover:bg-primary/10 transition-colors duration-200"
                                                                        asChild
                                                                    >
                                                                        <Link
                                                                            href={resolveHref(
                                                                                sub,
                                                                            )}
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

                                                {/* Expanded mode: collapsible */}
                                                <Collapsible
                                                    className="group/collapsible block group-data-[collapsible=icon]:hidden"
                                                    defaultOpen={
                                                        isCollapsibleOpen
                                                    }
                                                >
                                                    <CollapsibleTrigger asChild>
                                                        <SidebarMenuButton
                                                            className="hover:text-foreground hover:bg-primary/10 transition-colors duration-200"
                                                            isActive={
                                                                hasActiveChild
                                                            }
                                                            asChild
                                                        >
                                                            <Link
                                                                href={itemHref}
                                                            >
                                                                {item.icon && (
                                                                    <item.icon className="shrink-0" />
                                                                )}
                                                                <span>
                                                                    {item.title}
                                                                </span>
                                                                <ChevronRight className="ml-auto size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
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
                                                                    const subHref =
                                                                        resolveHref(
                                                                            sub,
                                                                        );
                                                                    const isSubActive =
                                                                        isUrlActive(
                                                                            url,
                                                                            subHref,
                                                                        );
                                                                    return (
                                                                        <SidebarMenuSubItem
                                                                            key={`${item.title}-${sub.title}-${subIdx}`}
                                                                            className="relative"
                                                                        >
                                                                            <SidebarMenuSubButton
                                                                                className="hover:text-foreground hover:bg-primary/10 transition-colors duration-200"
                                                                                isActive={
                                                                                    isSubActive
                                                                                }
                                                                                asChild
                                                                            >
                                                                                <Link
                                                                                    href={
                                                                                        subHref
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
                                            </>
                                        ) : (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <SidebarMenuButton
                                                        className="hover:text-foreground hover:bg-primary/10 transition-colors duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full"
                                                        isActive={isActive}
                                                        asChild
                                                    >
                                                        <Link href={itemHref}>
                                                            {item.icon && (
                                                                <item.icon className="shrink-0" />
                                                            )}
                                                            <span className="group-data-[collapsible=icon]:hidden">
                                                                {item.title}
                                                            </span>
                                                            <ItemBadge
                                                                item={item}
                                                            />
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </TooltipTrigger>
                                                <TooltipContent
                                                    side="right"
                                                    align="center"
                                                    hidden={tooltipHidden}
                                                >
                                                    {item.title}
                                                </TooltipContent>
                                            </Tooltip>
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
