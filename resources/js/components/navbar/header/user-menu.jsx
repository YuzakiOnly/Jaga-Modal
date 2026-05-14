import {
    BadgeCheck,
    Bell,
    ChevronRightIcon,
    CreditCard,
    LogOut,
    Sparkles,
} from "lucide-react";
import { Link, router, usePage } from "@inertiajs/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

export default function UserMenu() {
    const { auth } = usePage().props;
    const user = auth?.user;

    const handleLogout = () => {
        router.post(route("logout"));
    };

    const initials = user?.name
        ? user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "TB";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                    <AvatarImage
                        src={
                            user?.avatar
                                ? `/storage/${user.avatar}`
                                : "/images/avatars/01.png"
                        }
                        alt={user?.name ?? "User"}
                    />
                    <AvatarFallback className="rounded-lg">
                        {initials}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-60"
                align="end"
            >
                <DropdownMenuLabel className="p-0">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar>
                            <AvatarImage
                                src={
                                    user?.avatar
                                        ? `/storage/${user.avatar}`
                                        : "/images/avatars/01.png"
                                }
                                alt={user?.name ?? "User"}
                            />
                            <AvatarFallback className="rounded-lg">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">
                                {user?.name ?? "Guest"}
                            </span>
                            <span className="text-muted-foreground truncate text-xs">
                                {user?.email ?? ""}
                            </span>
                        </div>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href="/pricing">
                            <Sparkles className="mr-2 size-4" />
                            Upgrade to Pro
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href="/profile">
                            <BadgeCheck className="mr-2 size-4" />
                            Account
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <CreditCard className="mr-2 size-4" />
                        Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Bell className="mr-2 size-4" />
                        Notifications
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                >
                    <LogOut className="mr-2 size-4" />
                    Log out
                </DropdownMenuItem>

                <div className="bg-muted mt-1.5 rounded-md border">
                    <div className="space-y-3 p-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">Credits</h4>
                            <div className="text-muted-foreground flex cursor-pointer items-center text-sm">
                                <span>5 left</span>
                                <ChevronRightIcon className="ml-1 h-4 w-4" />
                            </div>
                        </div>
                        <Progress value={40} />
                        <div className="text-muted-foreground flex items-center text-sm">
                            Daily credits used first
                        </div>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
