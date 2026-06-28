// owner/variant-group/create/page.jsx atau edit/page.jsx
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { ChevronLeft, Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { variantGroupSchema } from "@/schemas/owner/variantSchema";

function SortableOptionRow({
    field,
    index,
    register,
    errors,
    update,
    removeOption,
    disableRemove,
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: field.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`rounded-lg border border-border bg-background p-2 sm:p-3 ${
                isDragging ? "shadow-md ring-1 ring-emerald-500/40" : ""
            }`}
        >
            <div className="grid grid-cols-[auto_1fr_5rem_auto_auto] sm:grid-cols-[auto_1fr_7rem_auto_auto] items-center gap-1.5 sm:gap-2">
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="flex h-8 w-6 shrink-0 cursor-grab touch-none items-center justify-center text-muted-foreground active:cursor-grabbing"
                    aria-label="Urutkan opsi"
                >
                    <GripVertical className="h-4 w-4" />
                </button>

                <div className="min-w-0">
                    <Input
                        {...register(`options.${index}.name`)}
                        placeholder="Nama opsi"
                        className="h-8 text-sm w-full"
                        type="text"
                    />
                    {errors?.options?.[index]?.name && (
                        <p className="text-[10px] text-destructive mt-0.5">
                            {errors.options[index].name.message}
                        </p>
                    )}
                </div>

                <div className="min-w-0">
                    <Input
                        type="text"
                        inputMode="numeric"
                        value={
                            field.price_modifier === 0
                                ? ""
                                : field.price_modifier
                        }
                        onChange={(e) => {
                            const clean = e.target.value.replace(/[^0-9]/g, "");
                            update(index, {
                                ...field,
                                price_modifier:
                                    clean === "" ? 0 : parseInt(clean, 10),
                            });
                        }}
                        placeholder="Harga"
                        className="h-8 text-sm w-full"
                    />
                    {errors?.options?.[index]?.price_modifier && (
                        <p className="text-[10px] text-destructive mt-0.5">
                            {errors.options[index].price_modifier.message}
                        </p>
                    )}
                </div>

                <Switch
                    checked={field.is_active}
                    onCheckedChange={(checked) => {
                        update(index, { ...field, is_active: checked });
                    }}
                    className="scale-75 sm:scale-100 shrink-0"
                />

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 sm:h-8 sm:w-8 p-0 shrink-0"
                    disabled={disableRemove}
                >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
            </div>
        </div>
    );
}

export default function VariantGroupForm({
    variantGroup = null,
    products = [],
}) {
    const isEditing = !!variantGroup;
    const [showDiscardDialog, setShowDiscardDialog] = useState(false);

    const form = useForm({
        resolver: zodResolver(variantGroupSchema),
        defaultValues: {
            name: variantGroup?.name ?? "",
            internal_note: variantGroup?.internal_note ?? "",
            min_select: variantGroup?.min_select ?? 0,
            max_select: variantGroup?.max_select ?? 1,
            is_active: variantGroup?.is_active ?? true,
            options: variantGroup?.options?.map((opt) => ({
                id: opt.id,
                name: opt.name,
                price_modifier: opt.price_modifier ?? 0,
                is_active: opt.is_active ?? true,
            })) ?? [{ name: "", price_modifier: 0, is_active: true }],
            product_ids: variantGroup?.products?.map((p) => p.id) ?? [],
        },
    });

    const {
        formState: { isSubmitting, errors, isDirty },
        control,
        setValue,
        getValues,
        register,
        reset,
    } = form;

    const { fields, append, remove, move, update } = useFieldArray({
        control,
        name: "options",
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 4 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 150, tolerance: 8 },
        }),
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = fields.findIndex((f) => f.id === active.id);
        const newIndex = fields.findIndex((f) => f.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;
        move(oldIndex, newIndex);
    };

    const onSubmit = form.handleSubmit((data) => {
        if (isEditing) {
            router.put(
                route("owner.variant-groups.update", variantGroup.id),
                data,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        reset(data);
                    },
                },
            );
        } else {
            router.post(route("owner.variant-groups.store"), data, {
                preserveScroll: true,
                onSuccess: () => {
                    reset(data);
                },
            });
        }
    });

    const addOption = () => {
        append({ name: "", price_modifier: 0, is_active: true });
    };

    const removeOption = (index) => {
        if (fields.length <= 1) return;
        remove(index);
    };

    const watchProductIds = form.watch("product_ids");

    const handleDiscard = () => {
        if (isDirty) {
            setShowDiscardDialog(true);
        } else {
            router.visit(route("owner.variant-groups"));
        }
    };

    const confirmDiscard = () => {
        setShowDiscardDialog(false);
        router.visit(route("owner.variant-groups"));
    };

    return (
        <>
            <Form {...form}>
                <form onSubmit={onSubmit}>
                    <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleDiscard}
                                className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:text-xs">
                                    Variant Groups
                                </p>
                                <h1 className="text-base font-bold tracking-tight sm:text-xl">
                                    {isEditing
                                        ? `Edit "${variantGroup.name}"`
                                        : "Add Variant Group"}
                                </h1>
                            </div>
                        </div>
                        {/* Desktop Actions - Hidden on Mobile */}
                        <div className="hidden sm:flex gap-2 sm:shrink-0">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={handleDiscard}
                            >
                                Discard
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isSubmitting}
                            >
                                {isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {isEditing ? "Save" : "Create"}
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:gap-4 lg:grid-cols-6">
                        <div className="space-y-3 sm:space-y-4 lg:col-span-4">
                            <Card className="shadow-none">
                                <CardHeader className="px-3 py-2 sm:px-6 sm:py-4">
                                    <CardTitle className="text-sm sm:text-base">
                                        Variant Group Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 px-3 pb-3 pt-0 sm:space-y-4 sm:px-6 sm:pb-6">
                                    <FormField
                                        control={control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs sm:text-sm">
                                                    Name
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="e.g. Level Pedas, Ukuran"
                                                        className="h-8 sm:h-10 text-sm"
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-[10px] sm:text-xs">
                                                    Nama grup varian yang akan
                                                    tampil di POS.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name="internal_note"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs sm:text-sm">
                                                    Internal Note
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        placeholder="Catatan internal (tidak terlihat di POS)..."
                                                        rows={2}
                                                        className="text-sm"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                        <FormField
                                            control={control}
                                            name="min_select"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs sm:text-sm">
                                                        Min Select
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            min={0}
                                                            placeholder="0"
                                                            className="h-8 sm:h-10 text-sm"
                                                            onChange={(e) =>
                                                                field.onChange(
                                                                    e.target
                                                                        .value ===
                                                                        ""
                                                                        ? 0
                                                                        : parseInt(
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                              10,
                                                                          ),
                                                                )
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormDescription className="text-[10px] sm:text-xs">
                                                        0 = opsional, &gt;0 =
                                                        wajib
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={control}
                                            name="max_select"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs sm:text-sm">
                                                        Max Select
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            min={1}
                                                            placeholder="1"
                                                            className="h-8 sm:h-10 text-sm"
                                                            onChange={(e) =>
                                                                field.onChange(
                                                                    e.target
                                                                        .value ===
                                                                        ""
                                                                        ? 1
                                                                        : parseInt(
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                              10,
                                                                          ),
                                                                )
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormDescription className="text-[10px] sm:text-xs">
                                                        1 = pilih satu, &gt;1 =
                                                        multi pilih
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-2 sm:space-y-3">
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="text-sm font-medium">
                                                Options
                                            </FormLabel>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addOption}
                                                className="h-7 sm:h-9 text-xs sm:text-sm"
                                            >
                                                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                                Add
                                            </Button>
                                        </div>

                                        <div className="hidden sm:grid sm:grid-cols-[auto_1fr_7rem_auto_auto] gap-2 px-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                            <span className="w-6" />
                                            <span>Nama</span>
                                            <span>Harga</span>
                                            <span className="text-center">
                                                Aktif
                                            </span>
                                            <span className="w-7" />
                                        </div>

                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <SortableContext
                                                items={fields.map((f) => f.id)}
                                                strategy={
                                                    verticalListSortingStrategy
                                                }
                                            >
                                                <div className="space-y-2">
                                                    {fields.map(
                                                        (field, index) => (
                                                            <SortableOptionRow
                                                                key={field.id}
                                                                field={field}
                                                                index={index}
                                                                register={
                                                                    register
                                                                }
                                                                errors={errors}
                                                                update={update}
                                                                removeOption={
                                                                    removeOption
                                                                }
                                                                disableRemove={
                                                                    fields.length <=
                                                                    1
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-3 sm:space-y-4 lg:col-span-2">
                            <Card className="shadow-none">
                                <CardHeader className="px-3 py-2 sm:px-6 sm:py-4">
                                    <CardTitle className="text-sm sm:text-base">
                                        Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-3 pb-3 pt-0 sm:px-6 sm:pb-6">
                                    <FormField
                                        control={control}
                                        name="is_active"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between rounded-lg border p-2 sm:p-4">
                                                <div className="space-y-0.5 pr-2">
                                                    <FormLabel className="text-xs sm:text-sm">
                                                        Active
                                                    </FormLabel>
                                                    <FormDescription className="text-[10px] sm:text-xs">
                                                        Hide from POS when
                                                        inactive
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

                            <Card className="shadow-none">
                                <CardHeader className="px-3 py-2 sm:px-6 sm:py-4">
                                    <CardTitle className="text-sm sm:text-base">
                                        Linked Products
                                    </CardTitle>
                                    <p className="text-[10px] sm:text-sm text-muted-foreground">
                                        Products using this variant group
                                    </p>
                                </CardHeader>
                                <CardContent className="px-3 pb-3 pt-0 sm:px-6 sm:pb-6">
                                    <FormField
                                        control={control}
                                        name="product_ids"
                                        render={() => (
                                            <FormItem>
                                                <ScrollArea className="h-36 sm:h-48 rounded-lg border p-1.5 sm:p-2">
                                                    {products.length === 0 ? (
                                                        <div className="flex h-full items-center justify-center text-xs sm:text-sm text-muted-foreground">
                                                            No products
                                                            available.
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-0.5 sm:space-y-1">
                                                            {products.map(
                                                                (product) => (
                                                                    <div
                                                                        key={
                                                                            product.id
                                                                        }
                                                                        className="flex items-center gap-1.5 sm:gap-2 rounded-lg px-1.5 py-1 sm:px-2 sm:py-1.5 hover:bg-muted/50 transition-colors"
                                                                    >
                                                                        <Checkbox
                                                                            id={`product-${product.id}`}
                                                                            checked={watchProductIds?.includes(
                                                                                product.id,
                                                                            )}
                                                                            onCheckedChange={(
                                                                                checked,
                                                                            ) => {
                                                                                const current =
                                                                                    getValues(
                                                                                        "product_ids",
                                                                                    ) ??
                                                                                    [];
                                                                                if (
                                                                                    checked
                                                                                ) {
                                                                                    setValue(
                                                                                        "product_ids",
                                                                                        [
                                                                                            ...current,
                                                                                            product.id,
                                                                                        ],
                                                                                    );
                                                                                } else {
                                                                                    setValue(
                                                                                        "product_ids",
                                                                                        current.filter(
                                                                                            (
                                                                                                id,
                                                                                            ) =>
                                                                                                id !==
                                                                                                product.id,
                                                                                        ),
                                                                                    );
                                                                                }
                                                                            }}
                                                                            className="h-3 w-3 sm:h-4 sm:w-4"
                                                                        />
                                                                        <Label
                                                                            htmlFor={`product-${product.id}`}
                                                                            className="text-xs sm:text-sm cursor-pointer flex-1 truncate"
                                                                        >
                                                                            {
                                                                                product.name
                                                                            }
                                                                        </Label>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                                </ScrollArea>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Mobile Floating Actions - Hidden on Desktop */}
                    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 sm:hidden">
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                className="flex-1"
                                onClick={handleDiscard}
                            >
                                Discard
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={isSubmitting}
                            >
                                {isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {isEditing ? "Save" : "Create"}
                            </Button>
                        </div>
                    </div>

                    <div className="h-[72px] sm:h-0" />
                </form>
            </Form>

            <AlertDialog
                open={showDiscardDialog}
                onOpenChange={setShowDiscardDialog}
            >
                <AlertDialogContent className="max-w-[95vw] sm:max-w-106.25">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Discard changes?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved changes. Are you sure you want to
                            discard them? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-3">
                        <AlertDialogCancel className="mt-0 sm:mt-0 cursor-pointer">
                            Continue Editing
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDiscard}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                        >
                            Discard
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
