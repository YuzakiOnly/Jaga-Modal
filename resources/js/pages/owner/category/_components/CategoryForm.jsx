import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { categorySchema } from "@/schemas/categorySchema";

export default function CategoryForm({ category }) {
    const isEditing = !!category;

    const form = useForm({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: category?.name ?? "",
            description: category?.description ?? "",
            is_active: category?.is_active ?? true,
            sort_order: category?.sort_order ?? 0,
        },
    });

    const {
        formState: { isSubmitting },
    } = form;

    const onSubmit = form.handleSubmit((data) => {
        if (isEditing) {
            router.put(route("owner.categories.update", category.id), data, {
                preserveScroll: true,
            });
        } else {
            router.post(route("owner.categories.store"), data, {
                preserveScroll: true,
            });
        }
    });

    return (
        <Form {...form}>
            <form onSubmit={onSubmit}>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() =>
                                router.visit(route("owner.categories"))
                            }
                            className="h-9 w-9 shrink-0"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Categories
                            </p>
                            <h1 className="text-xl font-bold tracking-tight">
                                {isEditing
                                    ? `Edit "${category.name}"`
                                    : "Add Category"}
                            </h1>
                        </div>
                    </div>
                    <div className="flex gap-2 sm:shrink-0">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                                router.visit(route("owner.categories"))
                            }
                            className="flex-1 sm:flex-none"
                        >
                            Discard
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 sm:flex-none"
                        >
                            {isSubmitting && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isEditing ? "Save Changes" : "Create Category"}
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-6">
                    <div className="space-y-4 lg:col-span-4">
                        <Card className="shadow-none">
                            <CardHeader className="px-6 py-4">
                                <CardTitle className="text-base">
                                    Category Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 px-6 pb-6 pt-0">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="e.g. Beverages"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Slug will be auto-generated from
                                                the name.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    placeholder="Optional short description..."
                                                    rows={3}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="sort_order"
                                    render={({ field }) => (
                                        <FormItem className="max-w-[160px]">
                                            <FormLabel>Sort Order</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    min={0}
                                                    placeholder="0"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Lower number = shown first.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4 lg:col-span-2">
                        <Card className="shadow-none">
                            <CardHeader className="px-6 py-4">
                                <CardTitle className="text-base">
                                    Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 pb-6 pt-0">
                                <FormField
                                    control={form.control}
                                    name="is_active"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5 pr-4">
                                                <FormLabel>Active</FormLabel>
                                                <FormDescription>
                                                    Inactive categories are
                                                    hidden from the POS.
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                    className="data-[state=checked]:bg-emerald-500"
                                                />
                                            </FormControl>
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
