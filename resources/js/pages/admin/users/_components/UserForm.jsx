import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { ChevronLeft, Loader2, AlertTriangle, Eye, EyeOff } from "lucide-react";

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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const countryCodes = [
    { code: "+62", label: "🇮🇩 +62" },
    { code: "+1", label: "🇺🇸 +1" },
    { code: "+44", label: "🇬🇧 +44" },
    { code: "+65", label: "🇸🇬 +65" },
    { code: "+60", label: "🇲🇾 +60" },
    { code: "+61", label: "🇦🇺 +61" },
];

// Schema untuk Create (password required)
const createSchema = z.object({
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

// Schema untuk Edit (password optional)
const editSchema = z.object({
    name: z.string().min(1, "Name is required"),
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email address"),
    country_code: z.string().default("+62"),
    phone: z.string().optional(),
    role: z.enum(["super_admin", "owner", "cashier"], {
        required_error: "Role is required",
    }),
    locale: z.enum(["en", "id"]).default("en"),
    password: z.string().optional(),
});

function extractLocalPhone(fullPhone, countryCode) {
    if (!fullPhone) return "";
    const code = countryCode?.replace("+", "") ?? "62";
    return fullPhone.startsWith(code)
        ? fullPhone.slice(code.length)
        : fullPhone;
}

export default function UserForm({ user = null, isEdit = false }) {
    const [processing, setProcessing] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { auth, flash } = usePage().props;
    const currentUser = auth?.user;

    // Edit mode specific checks
    const isSelfEdit = isEdit && currentUser?.id === user?.id;
    const isEditingSuperAdmin = isEdit && user?.role === "super_admin";
    const isSuperAdminSelfEdit =
        isEdit && isSelfEdit && currentUser?.role === "super_admin";
    const isRoleDisabled = isEdit && (isEditingSuperAdmin || isSelfEdit);
    const showPasswordField = !isEdit || !isEditingSuperAdmin;
    const isDeleteDisabled = isEdit && (isEditingSuperAdmin || isSelfEdit);

    const form = useForm({
        resolver: zodResolver(isEdit ? editSchema : createSchema),
        defaultValues: isEdit
            ? {
                  name: user.name ?? "",
                  username: user.username ?? "",
                  email: user.email ?? "",
                  country_code: user.country_code ?? "+62",
                  phone: extractLocalPhone(user.phone, user.country_code),
                  role: user.role ?? "owner",
                  locale: user.locale ?? "en",
                  password: "",
              }
            : {
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
        if (isEdit) {
            // Edit mode
            if (isEditingSuperAdmin || isSelfEdit) {
                delete data.role;
            }
            if (!data.password) {
                delete data.password;
            }

            setProcessing(true);
            router.put(route("admin.users.update", user.id), data, {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            });
        } else {
            // Create mode
            setProcessing(true);
            router.post(route("admin.users.store"), data, {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            });
        }
    });

    const handleDiscard = () => {
        router.visit(route("admin.users"));
    };

    const handleDelete = () => {
        if (deleteConfirmText !== "DELETE") return;

        setDeleteProcessing(true);
        router.delete(route("admin.users.destroy", user.id), {
            preserveScroll: true,
            onSuccess: () => {
                router.visit(route("admin.users"));
            },
            onFinish: () => {
                setDeleteProcessing(false);
                setDeleteDialogOpen(false);
                setDeleteConfirmText("");
            },
        });
    };

    // Super Admin self edit restriction
    if (isSuperAdminSelfEdit) {
        return (
            <Card>
                <CardContent className="py-8">
                    <div className="text-center space-y-4">
                        <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
                        <div>
                            <h2 className="text-xl font-semibold mb-2">
                                Access Restricted
                            </h2>
                            <p className="text-muted-foreground">
                                Super Admin accounts cannot be edited for
                                security reasons.
                                <br />
                                Please contact the system administrator if you
                                need to make changes.
                            </p>
                        </div>
                        <Button onClick={() => router.visit(route("admin.users"))}>
                            Back to Users List
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={onSubmit}>
                {/* Header */}
                <div className="mb-4 flex flex-col justify-between space-y-4 lg:flex-row lg:items-center lg:space-y-0">
                    <div className="flex items-center gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleDiscard}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Users
                            </p>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {isEdit ? "Edit User" : "Add User"}
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
                            {isEdit ? "Save Changes" : "Create User"}
                        </Button>
                    </div>
                </div>

                {/* Warning Banners (Edit mode only) */}
                {isEdit && isEditingSuperAdmin && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>
                            This is a Super Admin account. Role cannot be
                            changed and password management is restricted for
                            security reasons.
                        </span>
                    </div>
                )}

                {isEdit && isSelfEdit && !isEditingSuperAdmin && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-600">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>
                            You are editing your own account. Role changes may
                            affect your permissions.
                        </span>
                    </div>
                )}

                {/* Form Body */}
                <div className="grid gap-4 lg:grid-cols-6">
                    {/* Left col */}
                    <div className="space-y-4 lg:col-span-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
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

                        {/* Password Section */}
                        {showPasswordField && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {isEdit ? "Password" : "Password"}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {isEdit
                                                        ? "New Password"
                                                        : "Password"}
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            {...field}
                                                            type={
                                                                showPassword
                                                                    ? "text"
                                                                    : "password"
                                                            }
                                                            placeholder={
                                                                isEdit
                                                                    ? "Leave blank to keep current password"
                                                                    : "Min. 8 characters"
                                                            }
                                                            autoComplete={
                                                                isEdit
                                                                    ? "new-password"
                                                                    : "off"
                                                            }
                                                        />
                                                        {isEdit && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                                onClick={() =>
                                                                    setShowPassword(
                                                                        !showPassword,
                                                                    )
                                                                }
                                                            >
                                                                {showPassword ? (
                                                                    <EyeOff className="h-4 w-4" />
                                                                ) : (
                                                                    <Eye className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </FormControl>
                                                <FormDescription>
                                                    {isEdit
                                                        ? "Leave blank to keep the current password unchanged."
                                                        : "Choose a strong password for this account."}
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Password Info for Super Admin Edit */}
                        {isEdit && !showPasswordField && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Password Management</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md bg-muted p-3 text-sm">
                                        <p className="text-muted-foreground">
                                            🔒 Password for this account is
                                            managed through secure channels
                                            only. For security reasons, password
                                            cannot be changed through this
                                            interface.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right col */}
                    <div className="space-y-4 lg:col-span-2">
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
                                                    disabled={isRoleDisabled}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select a role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="super_admin">
                                                            <span className="size-2 rounded-full bg-violet-500 inline-block mr-1" />
                                                            Super Admin
                                                            {isRoleDisabled &&
                                                                " (Locked)"}
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
                                                {isRoleDisabled
                                                    ? "Role cannot be modified for this user account"
                                                    : "Set the access level for this user"}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

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
                                                this user
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Danger Zone - Edit mode only */}
                        {isEdit && !isDeleteDisabled && (
                            <Card className="border-destructive/40">
                                <CardHeader>
                                    <CardTitle className="text-destructive">
                                        Danger Zone
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-3 text-sm text-muted-foreground">
                                        Deleting this user is permanent and
                                        cannot be undone. All associated data
                                        will be removed.
                                    </p>

                                    <Dialog
                                        open={deleteDialogOpen}
                                        onOpenChange={setDeleteDialogOpen}
                                    >
                                        <DialogTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="w-full"
                                            >
                                                Delete User
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Are you absolutely sure?
                                                </DialogTitle>
                                                <DialogDescription>
                                                    This action cannot be
                                                    undone. This will
                                                    permanently delete the user
                                                    account and remove all
                                                    associated data from the
                                                    server.
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div className="space-y-4 py-4">
                                                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                                                    <p className="text-sm font-medium text-destructive">
                                                        User to delete:{" "}
                                                        <span className="font-bold">
                                                            {user.name}
                                                        </span>{" "}
                                                        (@
                                                        {user.username})
                                                    </p>
                                                    {user.role === "owner" && (
                                                        <p className="text-xs text-destructive/70 mt-1">
                                                            ⚠️ This user has
                                                            Owner role. Deleting
                                                            may affect business
                                                            ownership.
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Please type{" "}
                                                        <span className="font-bold text-destructive">
                                                            DELETE
                                                        </span>{" "}
                                                        to confirm.
                                                    </p>
                                                    <Input
                                                        type="text"
                                                        placeholder="Type DELETE here"
                                                        value={
                                                            deleteConfirmText
                                                        }
                                                        onChange={(e) =>
                                                            setDeleteConfirmText(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="font-mono"
                                                        autoComplete="off"
                                                    />
                                                </div>
                                            </div>

                                            <DialogFooter>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setDeleteDialogOpen(
                                                            false,
                                                        );
                                                        setDeleteConfirmText(
                                                            "",
                                                        );
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={handleDelete}
                                                    disabled={
                                                        deleteConfirmText !==
                                                            "DELETE" ||
                                                        deleteProcessing
                                                    }
                                                >
                                                    {deleteProcessing && (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    )}
                                                    Permanently Delete
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </CardContent>
                            </Card>
                        )}

                        {/* Protected Account Info - Edit mode only */}
                        {isEdit && isDeleteDisabled && (
                            <Card className="border-muted">
                                <CardHeader>
                                    <CardTitle className="text-muted-foreground">
                                        Protected Account
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            {isEditingSuperAdmin
                                                ? "🔒 Super Admin accounts cannot be deleted through this interface for security reasons."
                                                : "🔒 You cannot delete your own account. Please contact another administrator if you need to remove this account."}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </form>
        </Form>
    );
}
