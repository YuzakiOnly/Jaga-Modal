"use client";

import { ChevronRight } from "lucide-react";
import { Link, usePage } from "@inertiajs/react";

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

// ─── Helper: render badge untuk setiap item / sub ────────────────────────────
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

// ─── Helper: render badge inline (untuk dropdown) ────────────────────────────
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
            {navItems.map((nav) => (
                <SidebarGroup key={nav.title}>
                    <SidebarGroupLabel>{nav.title}</SidebarGroupLabel>
                    <SidebarGroupContent className="flex flex-col gap-2">
                        <SidebarMenu>
                            {nav.items.map((item) => (
                                <SidebarMenuItem
                                    key={item.title}
                                    className="relative"
                                >
                                    {Array.isArray(item.items) &&
                                    item.items.length > 0 ? (
                                        <>
                                            {/* ── Collapsed icon mode → Dropdown ── */}
                                            <div className="hidden group-data-[collapsible=icon]:block">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <SidebarMenuButton
                                                            tooltip={item.title}
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
                                                            (sub) => (
                                                                <DropdownMenuItem
                                                                    className="hover:text-foreground active:text-foreground hover:bg-(--primary)/10! active:bg-(--primary)/10!"
                                                                    asChild
                                                                    key={
                                                                        sub.title
                                                                    }
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
                                                    !!item.items.find(
                                                        (s) => s.href === url,
                                                    )
                                                }
                                            >
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton
                                                        className="hover:text-foreground active:text-foreground hover:bg-(--primary)/10 active:bg-(--primary)/10"
                                                        tooltip={item.title}
                                                    >
                                                        {item.icon && (
                                                            <item.icon />
                                                        )}
                                                        <span>
                                                            {item.title}
                                                        </span>
                                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>

                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        {item.items?.map(
                                                            (sub) => (
                                                                <SidebarMenuSubItem
                                                                    key={
                                                                        sub.title
                                                                    }
                                                                    className="relative"
                                                                >
                                                                    <SidebarMenuSubButton
                                                                        className="hover:text-foreground active:text-foreground hover:bg-(--primary)/10 active:bg-(--primary)/10"
                                                                        isActive={
                                                                            url ===
                                                                            sub.href
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
                                                            ),
                                                        )}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </Collapsible>

                                            <ItemBadge item={item} />
                                        </>
                                    ) : (
                                        <SidebarMenuButton
                                            className="hover:text-foreground active:text-foreground hover:bg-(--primary)/10 active:bg-(--primary)/10"
                                            isActive={url === item.href}
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
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            ))}
        </>
    );
}
