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
import { navItems } from "@/lib/sidebar-data";

export function NavMain() {
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
                                <SidebarMenuItem key={item.title}>
                                    {Array.isArray(item.items) &&
                                    item.items.length > 0 ? (
                                        <>
                                            {/* Collapsed icon mode → dropdown */}
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
                                                                        {
                                                                            sub.title
                                                                        }
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            ),
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            {/* Expanded mode → collapsible */}
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
                                                                </SidebarMenuSubItem>
                                                            ),
                                                        )}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        </>
                                    ) : (
                                        <SidebarMenuButton
                                            className="hover:text-foreground active:text-foreground hover:bg-(--primary)/10 active:bg-(--primary)/10"
                                            isActive={url === item.href}
                                            tooltip={item.title}
                                            asChild
                                        >
                                            <Link
                                                href={item.href}
                                                target={
                                                    item.newTab
                                                        ? "_blank"
                                                        : undefined
                                                }
                                            >
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    )}

                                    {!!item.isComing && (
                                        <SidebarMenuBadge className="peer-hover/menu-button:text-foreground opacity-50">
                                            Coming
                                        </SidebarMenuBadge>
                                    )}
                                    {!!item.isNew && (
                                        <SidebarMenuBadge className="border border-green-400 text-green-600 peer-hover/menu-button:text-green-600">
                                            New
                                        </SidebarMenuBadge>
                                    )}
                                    {!!item.isDataBadge && (
                                        <SidebarMenuBadge className="peer-hover/menu-button:text-foreground">
                                            {item.isDataBadge}
                                        </SidebarMenuBadge>
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
