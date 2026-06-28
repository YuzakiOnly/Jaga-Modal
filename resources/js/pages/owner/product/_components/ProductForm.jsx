import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { useState, useRef, useEffect } from "react";
import {
    ChevronLeft,
    Loader2,
    ImagePlus,
    X,
    PenLine,
    ListChecks,
    Check,
    ChevronsUpDown,
    ExternalLink,
} from "lucide-react";

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
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

import { UNIT_PRESETS } from "@/lib/owner/product/productConstants";
import { productSchema } from "@/schemas/owner/productSchema";

const formatRupiah = (value) => {
    const rounded = Math.round(Number(value) || 0);
    return `Rp ${rounded.toLocaleString("id-ID")}`;
};

export default function ProductForm({ product, categories }) {
    const isEditing = !!product;
    const [processing, setProcessing] = useState(false);
    const [showDiscardDialog, setShowDiscardDialog] = useState(false);

    const [hppMode, setHppMode] = useState("manual");
    const [templates, setTemplates] = useState([]);
    const [templatesLoading, setTemplatesLoading] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [templatePopoverOpen, setTemplatePopoverOpen] = useState(false);

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(
        product?.image ? `/storage/${product.image}` : null,
    );
    const fileInputRef = useRef(null);

    const form = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: {
            category_id: product?.category_id
                ? String(product.category_id)
                : "",
            name: product?.name ?? "",
            sku: product?.sku ?? "",
            barcode: product?.barcode ?? "",
            description: product?.description ?? "",
            capital_price:
                product?.capital_price != null
                    ? String(product.capital_price)
                    : "",
            selling_price:
                product?.selling_price != null
                    ? String(product.selling_price)
                    : "",
            stock_type: product?.stock_type ?? "limited",
            stock: product?.stock != null ? String(product.stock) : "",
            minimum_stock:
                product?.minimum_stock != null
                    ? String(product.minimum_stock)
                    : "",
            unit: product?.unit ?? "pcs",
            is_active: product?.is_active ?? true,
        },
    });

    const {
        formState: { isDirty },
        reset,
    } = form;

    const stockType = form.watch("stock_type");
    const capitalPrice = parseFloat(form.watch("capital_price")) || 0;
    const sellingPrice = parseFloat(form.watch("selling_price")) || 0;
    const profit = sellingPrice - capitalPrice;
    const profitMargin =
        sellingPrice > 0 ? ((profit / sellingPrice) * 100).toFixed(1) : 0;

    useEffect(() => {
        if (hppMode !== "template") return;
        setTemplatesLoading(true);
        fetch(route("owner.capital-prices.options"))
            .then((r) => r.json())
            .then((data) => setTemplates(data))
            .catch(() => setTemplates([]))
            .finally(() => setTemplatesLoading(false));
    }, [hppMode]);

    const handleSelectTemplate = (tpl) => {
        setSelectedTemplate(tpl);
        form.setValue("capital_price", String(tpl.amount), {
            shouldValidate: true,
        });
        setTemplatePopoverOpen(false);
    };

    const handleModeChange = (mode) => {
        setHppMode(mode);
        if (mode === "manual") setSelectedTemplate(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const onSubmit = form.handleSubmit((data) => {
        setProcessing(true);
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("category_id", data.category_id ?? "");
        formData.append("sku", data.sku ?? "");
        formData.append("barcode", data.barcode ?? "");
        formData.append("description", data.description ?? "");
        formData.append("capital_price", String(data.capital_price));
        formData.append("selling_price", String(data.selling_price));
        formData.append("stock_type", data.stock_type);
        formData.append(
            "stock",
            data.stock_type === "limited" ? String(data.stock ?? 0) : "",
        );
        formData.append(
            "minimum_stock",
            data.minimum_stock != null ? String(data.minimum_stock) : "",
        );
        formData.append("unit", data.unit);
        formData.append("is_active", data.is_active ? "1" : "0");
        if (imageFile) formData.append("image", imageFile);

        if (isEditing) {
            formData.append("_method", "PUT");
            router.post(route("owner.products.update", product.id), formData, {
                preserveScroll: true,
                onSuccess: () => {
                    reset(data);
                },
                onFinish: () => setProcessing(false),
            });
        } else {
            router.post(route("owner.products.store"), formData, {
                preserveScroll: true,
                onSuccess: () => {
                    reset(data);
                },
                onFinish: () => setProcessing(false),
            });
        }
    });

    const handleDiscard = () => {
        if (isDirty || imageFile) {
            setShowDiscardDialog(true);
        } else {
            router.visit(route("owner.products"));
        }
    };

    const confirmDiscard = () => {
        setShowDiscardDialog(false);
        router.visit(route("owner.products"));
    };

    return (
        <>
            <Form {...form}>
                <form onSubmit={onSubmit}>
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleDiscard}
                                className="h-9 w-9 shrink-0"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                    Products
                                </p>
                                <h1 className="text-xl font-bold tracking-tight">
                                    {isEditing
                                        ? `Edit "${product.name}"`
                                        : "Add Product"}
                                </h1>
                            </div>
                        </div>
                        {/* Desktop Actions - Hidden on Mobile */}
                        <div className="hidden sm:flex gap-2 sm:shrink-0">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleDiscard}
                                className="flex-1 sm:flex-none"
                            >
                                Discard
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="flex-1 sm:flex-none"
                            >
                                {processing && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {isEditing ? "Save Changes" : "Create Product"}
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-6">
                        <div className="space-y-4 lg:col-span-4">
                            <Card className="shadow-none">
                                <CardHeader className="px-6 py-4">
                                    <CardTitle className="text-base">
                                        Product Information
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
                                                        placeholder="e.g. Es Teh Manis"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="sku"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>SKU</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Auto or manual"
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Leave blank to skip.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="barcode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Barcode
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Scan or type"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Description
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        placeholder="Optional product description..."
                                                        rows={3}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="shadow-none">
                                <CardHeader className="px-6 py-4">
                                    <CardTitle className="text-base">
                                        Pricing
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 px-6 pb-6 pt-0">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="capital_price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center justify-between">
                                                        <FormLabel>
                                                            Capital Price (HPP)
                                                        </FormLabel>
                                                        <Tabs
                                                            value={hppMode}
                                                            onValueChange={
                                                                handleModeChange
                                                            }
                                                        >
                                                            <TabsList className="h-7 px-1">
                                                                <TabsTrigger
                                                                    value="manual"
                                                                    className="h-5 px-2 text-xs gap-1"
                                                                >
                                                                    <PenLine className="h-3 w-3" />
                                                                    Manual
                                                                </TabsTrigger>
                                                                <TabsTrigger
                                                                    value="template"
                                                                    className="h-5 px-2 text-xs gap-1"
                                                                >
                                                                    <ListChecks className="h-3 w-3" />
                                                                    Template
                                                                </TabsTrigger>
                                                            </TabsList>
                                                        </Tabs>
                                                    </div>

                                                    {hppMode === "manual" && (
                                                        <FormControl>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">
                                                                    Rp
                                                                </span>
                                                                <Input
                                                                    {...field}
                                                                    inputMode="numeric"
                                                                    placeholder="e.g. 5000"
                                                                    className="pl-9"
                                                                />
                                                            </div>
                                                        </FormControl>
                                                    )}

                                                    {hppMode === "template" && (
                                                        <div className="space-y-2">
                                                            <Popover
                                                                open={
                                                                    templatePopoverOpen
                                                                }
                                                                onOpenChange={
                                                                    setTemplatePopoverOpen
                                                                }
                                                            >
                                                                <PopoverTrigger
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        role="combobox"
                                                                        className="w-full justify-between font-normal"
                                                                    >
                                                                        {selectedTemplate
                                                                            ? selectedTemplate.name
                                                                            : templatesLoading
                                                                              ? "Loading templates..."
                                                                              : "Select HPP template..."}
                                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent
                                                                    className="w-72 p-0"
                                                                    align="start"
                                                                >
                                                                    {templatesLoading ? (
                                                                        <div className="flex items-center justify-center py-6">
                                                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                                        </div>
                                                                    ) : templates.length ===
                                                                      0 ? (
                                                                        <div className="py-6 text-center text-sm text-muted-foreground space-y-2 px-4">
                                                                            <p>
                                                                                No
                                                                                HPP
                                                                                templates
                                                                                yet.
                                                                            </p>
                                                                            <Button
                                                                                type="button"
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() =>
                                                                                    router.visit(
                                                                                        route(
                                                                                            "owner.capital-prices.create",
                                                                                        ),
                                                                                    )
                                                                                }
                                                                                className="gap-1 text-xs"
                                                                            >
                                                                                <ExternalLink className="h-3 w-3" />
                                                                                Create
                                                                                Template
                                                                            </Button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="max-h-60 overflow-y-auto py-1">
                                                                            {templates.map(
                                                                                (
                                                                                    tpl,
                                                                                ) => (
                                                                                    <button
                                                                                        key={
                                                                                            tpl.id
                                                                                        }
                                                                                        type="button"
                                                                                        onClick={() =>
                                                                                            handleSelectTemplate(
                                                                                                tpl,
                                                                                            )
                                                                                        }
                                                                                        className={`flex w-full items-center justify-between px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                                                                                            selectedTemplate?.id ===
                                                                                            tpl.id
                                                                                                ? "bg-accent"
                                                                                                : ""
                                                                                        }`}
                                                                                    >
                                                                                        <div className="text-left">
                                                                                            <p className="font-medium text-sm">
                                                                                                {
                                                                                                    tpl.name
                                                                                                }
                                                                                            </p>
                                                                                            {tpl.description && (
                                                                                                <p className="text-xs text-muted-foreground truncate max-w-45">
                                                                                                    {
                                                                                                        tpl.description
                                                                                                    }
                                                                                                </p>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="flex items-center gap-2 ml-2 shrink-0">
                                                                                            <span className="text-xs font-mono font-semibold text-emerald-600">
                                                                                                {formatRupiah(
                                                                                                    tpl.amount,
                                                                                                )}
                                                                                            </span>
                                                                                            {selectedTemplate?.id ===
                                                                                                tpl.id && (
                                                                                                <Check className="h-4 w-4 text-primary" />
                                                                                            )}
                                                                                        </div>
                                                                                    </button>
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                    {templates.length >
                                                                        0 && (
                                                                        <div className="border-t px-3 py-2">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    router.visit(
                                                                                        route(
                                                                                            "owner.capital-prices",
                                                                                        ),
                                                                                    )
                                                                                }
                                                                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                                                            >
                                                                                <ExternalLink className="h-3 w-3" />
                                                                                Manage
                                                                                HPP
                                                                                templates
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </PopoverContent>
                                                            </Popover>

                                                            {selectedTemplate && (
                                                                <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2">
                                                                    <span className="text-xs text-muted-foreground">
                                                                        Selected
                                                                        HPP
                                                                    </span>
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="font-mono text-xs"
                                                                    >
                                                                        {formatRupiah(
                                                                            selectedTemplate.amount,
                                                                        )}
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="selling_price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Selling Price
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">
                                                                Rp
                                                            </span>
                                                            <Input
                                                                {...field}
                                                                inputMode="numeric"
                                                                placeholder="e.g. 10000"
                                                                className="pl-9"
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/30 p-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Profit
                                            </p>
                                            <p
                                                className={`text-sm font-semibold tabular-nums ${profit >= 0 ? "text-emerald-600" : "text-destructive"}`}
                                            >
                                                {formatRupiah(profit)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Margin
                                            </p>
                                            <p
                                                className={`text-sm font-semibold tabular-nums ${profit >= 0 ? "text-emerald-600" : "text-destructive"}`}
                                            >
                                                {profitMargin}%
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-none">
                                <CardHeader className="px-6 py-4">
                                    <CardTitle className="text-base">
                                        Stock
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 px-6 pb-6 pt-0">
                                    <FormField
                                        control={form.control}
                                        name="stock_type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Stock Type
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="limited">
                                                            Limited
                                                        </SelectItem>
                                                        <SelectItem value="unlimited">
                                                            Unlimited
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {stockType === "limited" && (
                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <FormField
                                                control={form.control}
                                                name="stock"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Current Stock
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                inputMode="numeric"
                                                                value={
                                                                    field.value ??
                                                                    ""
                                                                }
                                                                placeholder="e.g. 100"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="minimum_stock"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Minimum Stock
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                inputMode="numeric"
                                                                value={
                                                                    field.value ??
                                                                    ""
                                                                }
                                                                placeholder="Low stock alert"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="unit"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Unit
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
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {UNIT_PRESETS.map(
                                                                    (u) => (
                                                                        <SelectItem
                                                                            key={
                                                                                u
                                                                            }
                                                                            value={
                                                                                u
                                                                            }
                                                                        >
                                                                            {u}
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    )}

                                    {stockType === "unlimited" && (
                                        <FormField
                                            control={form.control}
                                            name="unit"
                                            render={({ field }) => (
                                                <FormItem className="max-w-40">
                                                    <FormLabel>Unit</FormLabel>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        defaultValue={
                                                            field.value
                                                        }
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {UNIT_PRESETS.map(
                                                                (u) => (
                                                                    <SelectItem
                                                                        key={u}
                                                                        value={
                                                                            u
                                                                        }
                                                                    >
                                                                        {u}
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-4 lg:col-span-2">
                            <Card className="shadow-none">
                                <CardHeader className="px-6 py-4">
                                    <CardTitle className="text-base">
                                        Image
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 px-6 pb-6 pt-0">
                                    {imagePreview ? (
                                        <div className="relative group">
                                            <img
                                                src={imagePreview}
                                                alt="Product preview"
                                                className="h-48 w-full rounded-lg object-cover border"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-muted-foreground/60 hover:text-foreground"
                                        >
                                            <ImagePlus className="h-8 w-8" />
                                            <span className="text-sm">
                                                Click to upload image
                                            </span>
                                            <span className="text-xs">
                                                JPG, PNG, WebP — max 2 MB
                                            </span>
                                        </button>
                                    )}

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />

                                    {imagePreview && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                        >
                                            Change Image
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="shadow-none">
                                <CardHeader className="px-6 py-4">
                                    <CardTitle className="text-base">
                                        Category
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-6 pb-6 pt-0">
                                    <FormField
                                        control={form.control}
                                        name="category_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                    disabled={
                                                        categories.length === 0
                                                    }
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue
                                                                placeholder={
                                                                    categories.length ===
                                                                    0
                                                                        ? "No categories"
                                                                        : "Select category..."
                                                                }
                                                            />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {categories.length >
                                                        0 ? (
                                                            categories.map(
                                                                (cat) => (
                                                                    <SelectItem
                                                                        key={
                                                                            cat.id
                                                                        }
                                                                        value={String(
                                                                            cat.id,
                                                                        )}
                                                                    >
                                                                        {
                                                                            cat.name
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )
                                                        ) : (
                                                            <div className="px-3 py-2 text-sm text-muted-foreground">
                                                                No categories
                                                                available
                                                            </div>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Optional — can be set later.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="shadow-none">
                                <CardHeader className="px-6 py-4">
                                    <CardTitle className="text-base">
                                        Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 px-6 pb-6 pt-0">
                                    <FormField
                                        control={form.control}
                                        name="is_active"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5 pr-4">
                                                    <FormLabel>
                                                        Active in Store
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Inactive products are
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
                                disabled={processing}
                            >
                                {processing && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {isEditing ? "Save" : "Create"}
                            </Button>
                        </div>
                    </div>

                    {/* Spacer for mobile floating actions */}
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
