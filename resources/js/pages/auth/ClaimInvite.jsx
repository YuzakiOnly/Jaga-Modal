import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Head, router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Loader2, Store, ShieldCheck } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const claimSchema = z.object({
    name: z.string().min(1, "Nama wajib diisi").max(255),
    username: z
        .string()
        .min(3, "Username minimal 3 karakter")
        .max(20, "Username maksimal 20 karakter")
        .regex(/^[a-z0-9_]+$/, "Hanya huruf kecil, angka, dan underscore"),
    phone: z.string().min(8, "Nomor telepon tidak valid").max(20),
    password: z.string().min(8, "Password minimal 8 karakter"),
});

const roleLabel = (role) => {
    if (role === "cashier") return "Cashier";
    return role;
};

export default function ClaimInvite({ token, storeName, role, suggestedName }) {
    const { errors: pageErrors } = usePage().props;

    const form = useForm({
        resolver: zodResolver(claimSchema),
        defaultValues: {
            name: suggestedName || "",
            username: "",
            phone: "",
            password: "",
        },
    });

    const {
        formState: { isSubmitting },
    } = form;

    const onSubmit = form.handleSubmit((data) => {
        router.post(route("invite.claim", token), data, {
            preserveScroll: true,
        });
    });

    return (
        <>
            <Head title="Join the Team" />
            <div className="flex min-h-screen items-center justify-center bg-[#fff8f0] px-4 py-10">
                <div className="w-full max-w-md space-y-4">
                    <div className="text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#fe5e00]/10">
                            <Store className="h-6 w-6 text-[#fe5e00]" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-[#1a1110]">
                            You're invited to join {storeName}
                        </h1>
                        <Badge variant="outline" className="mt-2 capitalize">
                            <ShieldCheck className="mr-1 h-3 w-3" />
                            {roleLabel(role)}
                        </Badge>
                    </div>

                    <Card className="shadow-sm">
                        <CardHeader className="px-6 py-4">
                            <CardTitle className="text-base">
                                Set Up Your Account
                            </CardTitle>
                            <CardDescription>
                                Choose a username and password to activate your
                                account.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 px-6 pb-6 pt-0">
                            <Form {...form}>
                                <form onSubmit={onSubmit} className="space-y-4">
                                    {pageErrors?.token && (
                                        <p className="text-sm font-medium text-destructive">
                                            {pageErrors.token}
                                        </p>
                                    )}
                                    {pageErrors?.limit && (
                                        <p className="text-sm font-medium text-destructive">
                                            {pageErrors.limit}
                                        </p>
                                    )}

                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="e.g. Budi Santoso"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Username</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="budisantoso"
                                                        autoCapitalize="none"
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.target.value.toLowerCase(),
                                                            )
                                                        }
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Lowercase letters, numbers,
                                                    and underscores only.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Phone Number
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="tel"
                                                        placeholder="08123456789"
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.target.value.replace(
                                                                    /\D/g,
                                                                    "",
                                                                ),
                                                            )
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

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
                                                        placeholder="Minimum 8 characters"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Activate Account
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
