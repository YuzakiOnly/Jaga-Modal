import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { router } from "@inertiajs/react";
import { useState } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const countryCodes = [
    { code: "+62", label: "🇮🇩 +62" },
    { code: "+1", label: "🇺🇸 +1" },
    { code: "+44", label: "🇬🇧 +44" },
    { code: "+65", label: "🇸🇬 +65" },
    { code: "+60", label: "🇲🇾 +60" },
    { code: "+61", label: "🇦🇺 +61" },
];

const schema = z.object({
    name: z.string().min(1, "Name is required"),
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email address"),
    country_code: z.string().default("+62"),
    phone: z.string().optional(),
    role: z.enum(["super_admin", "owner", "cashier"], {
        required_error: "Role is required",
    }),
    locale: z.enum(["en", "id"]).default("en"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function CreateUserForm() {
    const [processing, setProcessing] = useState(false);

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            username: "",
            email: "",
            country_code: "+62",
            phone: "",
            role: "owner",
            locale: "en",
            password: "",
        },
    });

    const onSubmit = form.handleSubmit((data) => {
        setProcessing(true);
        router.post(route("admin.users.store"), data, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    });

    const handleDiscard = () => {
        router.visit(route("admin.users"));
    };

    return (
        <Form {...form}>
            <form onSubmit={onSubmit}>
                {/* ── Header ── */}
                <div className="mb-4 flex flex-col justify-between space-y-4 lg:flex-row lg:items-center lg:space-y-0">
                    <div className="flex items-center gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => router.visit(route("admin.users"))}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Admin / Users
                            </p>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Add User
                            </h1>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleDiscard}
                        >
                            Discard
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Create User
                        </Button>
                    </div>
                </div>

                {/* ── Body: 4+2 grid like add-product-form ── */}
                <div className="grid gap-4 lg:grid-cols-6">
                    {/* Left col — main fields */}
                    <div className="space-y-4 lg:col-span-4">
                        {/* Account Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Full Name */}
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="John Doe"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Username + Email */}
                                <div className="grid gap-4 lg:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Username</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                                            @
                                                        </span>
                                                        <Input
                                                            {...field}
                                                            placeholder="john_doe"
                                                            className="pl-7"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="email"
                                                        placeholder="john@example.com"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Phone */}
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Phone{" "}
                                                <span className="font-normal text-muted-foreground">
                                                    (optional)
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <div className="flex gap-2">
                                                    <FormField
                                                        control={form.control}
                                                        name="country_code"
                                                        render={({
                                                            field: cc,
                                                        }) => (
                                                            <Select
                                                                value={cc.value}
                                                                onValueChange={
                                                                    cc.onChange
                                                                }
                                                            >
                                                                <SelectTrigger className="w-28 shrink-0">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {countryCodes.map(
                                                                        (c) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    c.code
                                                                                }
                                                                                value={
                                                                                    c.code
                                                                                }
                                                                            >
                                                                                {
                                                                                    c.label
                                                                                }
                                                                            </SelectItem>
                                                                        ),
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                    <Input
                                                        {...field}
                                                        placeholder="812 3456 7890"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Password */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Password</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="password"
                                                    placeholder="Min. 8 characters"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Choose a strong password for
                                                this account.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right col — role & locale */}
                    <div className="space-y-4 lg:col-span-2">
                        {/* Role */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Role</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select a role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="super_admin">
                                                            <span className="size-2 rounded-full bg-violet-500 inline-block mr-1" />
                                                            Super Admin
                                                        </SelectItem>
                                                        <SelectItem value="owner">
                                                            <span className="size-2 rounded-full bg-amber-500 inline-block mr-1" />
                                                            Owner
                                                        </SelectItem>
                                                        <SelectItem value="cashier">
                                                            <span className="size-2 rounded-full bg-sky-500 inline-block mr-1" />
                                                            Cashier
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormDescription>
                                                Set the access level for this
                                                user.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Language */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Language</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="locale"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="en">
                                                            🇺🇸 English
                                                        </SelectItem>
                                                        <SelectItem value="id">
                                                            🇮🇩 Indonesia
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormDescription>
                                                Default interface language for
                                                this user.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </Form>
    );
}
