import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { ChevronLeft, Loader2, Copy, Check, Link2, UserPlus } from "lucide-react";
import { useState } from "react";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import {
    employeeManualSchema,
    employeeInviteSchema,
} from "@/schemas/owner/employeeSchema";

const ROLE_OPTIONS = [{ value: "cashier", label: "Cashier" }];

export default function EmployeeForm({ employeeCount = 0, maxEmployees = 5 }) {
    const [mode, setMode] = useState("manual");
    const [copied, setCopied] = useState(false);
    const [inviteResult, setInviteResult] = useState(null);
    const limitReached = employeeCount >= maxEmployees;

    const manualForm = useForm({
        resolver: zodResolver(employeeManualSchema),
        defaultValues: {
            name: "",
            username: "",
            phone: "",
            role: "cashier",
            password: "",
        },
    });

    const inviteForm = useForm({
        resolver: zodResolver(employeeInviteSchema),
        defaultValues: {
            name: "",
            role: "cashier",
        },
    });

    const {
        formState: { isSubmitting: isManualSubmitting },
    } = manualForm;

    const {
        formState: { isSubmitting: isInviteSubmitting },
    } = inviteForm;

    const handleDiscard = () => {
        router.visit(route("owner.employees"));
    };

    const onSubmitManual = manualForm.handleSubmit((data) => {
        router.post(route("owner.employees.store"), data, {
            preserveScroll: true,
            onSuccess: () => {
                router.visit(route("owner.employees"));
            },
        });
    });

    const onSubmitInvite = inviteForm.handleSubmit((data) => {
        router.post(
            route("owner.employees.invite"),
            data,
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    const token = page.props?.flash?.inviteToken;
                    if (token) {
                        const url = `${window.location.origin}/invite/${token}`;
                        setInviteResult(url);
                    }
                },
            },
        );
    });

    const handleCopy = async () => {
        if (!inviteResult) return;
        await navigator.clipboard.writeText(inviteResult);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <div className="mb-6 flex items-center gap-3">
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleDiscard}
                    className="h-9 w-9 shrink-0"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Employees
                    </p>
                    <h1 className="text-xl font-bold tracking-tight">
                        Add Employee
                    </h1>
                </div>
                <Badge
                    variant={limitReached ? "destructive" : "secondary"}
                    className="shrink-0"
                >
                    {employeeCount}/{maxEmployees}
                </Badge>
            </div>

            {limitReached ? (
                <Card className="shadow-none border-destructive/30 bg-destructive/5">
                    <CardContent className="py-6 text-center">
                        <p className="text-sm font-medium text-destructive">
                            Employee limit reached
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            You can only have up to {maxEmployees} employees
                            per store. Remove an existing employee to add a
                            new one.
                        </p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={handleDiscard}
                        >
                            Back to Employees
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Tabs value={mode} onValueChange={setMode}>
                    <TabsList className="grid w-full grid-cols-2 sm:w-auto">
                        <TabsTrigger value="manual" className="gap-2">
                            <UserPlus className="h-4 w-4" />
                            Manual
                        </TabsTrigger>
                        <TabsTrigger value="invite" className="gap-2">
                            <Link2 className="h-4 w-4" />
                            Invite Link
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="manual" className="mt-4">
                        <Form {...manualForm}>
                            <form onSubmit={onSubmitManual}>
                                <Card className="shadow-none">
                                    <CardHeader className="px-6 py-4">
                                        <CardTitle className="text-base">
                                            Account Details
                                        </CardTitle>
                                        <CardDescription>
                                            Set the username and password
                                            yourself. The employee can log in
                                            right away.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 px-6 pb-6 pt-0">
                                        <FormField
                                            control={manualForm.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Full Name
                                                    </FormLabel>
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
                                            control={manualForm.control}
                                            name="username"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Username
                                                    </FormLabel>
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
                                                        Lowercase letters,
                                                        numbers, and
                                                        underscores only.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={manualForm.control}
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
                                            control={manualForm.control}
                                            name="role"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Role
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        defaultValue={
                                                            field.value
                                                        }
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select role" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {ROLE_OPTIONS.map(
                                                                (opt) => (
                                                                    <SelectItem
                                                                        key={
                                                                            opt.value
                                                                        }
                                                                        value={
                                                                            opt.value
                                                                        }
                                                                    >
                                                                        {
                                                                            opt.label
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={manualForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Password
                                                    </FormLabel>
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
                                    </CardContent>
                                </Card>

                                <div className="mt-4 flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleDiscard}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isManualSubmitting}
                                    >
                                        {isManualSubmitting && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Create Account
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </TabsContent>

                    <TabsContent value="invite" className="mt-4">
                        {inviteResult ? (
                            <Card className="shadow-none">
                                <CardHeader className="px-6 py-4">
                                    <CardTitle className="text-base">
                                        Invite Link Ready
                                    </CardTitle>
                                    <CardDescription>
                                        Share this link with your new
                                        employee. It expires in 3 days and can
                                        only be used once.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 px-6 pb-6 pt-0">
                                    <div className="flex gap-2">
                                        <Input
                                            readOnly
                                            value={inviteResult}
                                            className="font-mono text-sm"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={handleCopy}
                                            className="shrink-0"
                                        >
                                            {copied ? (
                                                <Check className="h-4 w-4 text-emerald-600" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => {
                                                setInviteResult(null);
                                                inviteForm.reset();
                                            }}
                                        >
                                            Create Another
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleDiscard}
                                        >
                                            Done
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Form {...inviteForm}>
                                <form onSubmit={onSubmitInvite}>
                                    <Card className="shadow-none">
                                        <CardHeader className="px-6 py-4">
                                            <CardTitle className="text-base">
                                                Generate Invite Link
                                            </CardTitle>
                                            <CardDescription>
                                                The employee sets their own
                                                username and password when
                                                they open the link.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4 px-6 pb-6 pt-0">
                                            <FormField
                                                control={inviteForm.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Name (optional)
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="e.g. Budi Santoso"
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Helps you recognize
                                                            who this link is
                                                            for.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={inviteForm.control}
                                                name="role"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Role
                                                        </FormLabel>
                                                        <Select
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                            defaultValue={
                                                                field.value
                                                            }
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Select role" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {ROLE_OPTIONS.map(
                                                                    (opt) => (
                                                                        <SelectItem
                                                                            key={
                                                                                opt.value
                                                                            }
                                                                            value={
                                                                                opt.value
                                                                            }
                                                                        >
                                                                            {
                                                                                opt.label
                                                                            }
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>

                                    <div className="mt-4 flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={handleDiscard}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isInviteSubmitting}
                                        >
                                            {isInviteSubmitting && (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Generate Link
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        )}
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
