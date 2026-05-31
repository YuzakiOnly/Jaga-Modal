import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { templateSchema } from "@/schemas/templateSchema";

import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { useState } from "react";
import {
    ChevronLeft,
    Loader2,
    Plus,
    Trash2,
    Package,
    FlaskConical,
    Wrench,
    Calculator,
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
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const formatRp = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value || 0);

export default function TemplateForm({ template }) {
    const isEditing = !!template;
    const [processing, setProcessing] = useState(false);

    const form = useForm({
        resolver: zodResolver(templateSchema),
        defaultValues: {
            name: template?.name ?? "",
            product_name: template?.product_name ?? "",
            ingredients: template?.ingredients?.length
                ? template.ingredients.map((i) => ({
                      name: i.name,
                      unit: i.unit,
                      qty: Number(i.qty),
                      price: Number(i.price),
                  }))
                : [{ name: "", unit: "", qty: 1, price: 0 }],
            labor_cost: Number(template?.labor_cost) || 0,
            overhead_cost: Number(template?.overhead_cost) || 0,
            output_qty: Number(template?.output_qty) || 1,
            description: template?.description ?? "",
            is_active: template?.is_active ?? true,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "ingredients",
    });

    const watched = useWatch({ control: form.control });

    const totalIngredients = (watched.ingredients || []).reduce((sum, ing) => {
        return sum + (Number(ing.qty) || 0) * (Number(ing.price) || 0);
    }, 0);

    const totalCost =
        totalIngredients +
        (Number(watched.labor_cost) || 0) +
        (Number(watched.overhead_cost) || 0);

    const outputQty = Math.max(1, Number(watched.output_qty) || 1);
    const hppPerUnit = totalCost / outputQty;

    const onSubmit = form.handleSubmit((data) => {
        setProcessing(true);
        const options = {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        };

        if (isEditing) {
            router.put(
                route("owner.capital-prices.update", template.id),
                data,
                options,
            );
        } else {
            router.post(route("owner.capital-prices.store"), data, options);
        }
    });

    return (
        <Form {...form}>
            <form onSubmit={onSubmit}>
                <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                            onClick={() =>
                                router.visit(route("owner.capital-prices"))
                            }
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Template HPP
                            </p>
                            <h1 className="text-lg sm:text-2xl font-bold tracking-tight">
                                {isEditing
                                    ? `Edit "${template.name}"`
                                    : "Tambah Template HPP"}
                            </h1>
                        </div>
                    </div>
                    <div className="flex gap-2 sm:shrink-0">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1 sm:flex-none"
                            onClick={() =>
                                router.visit(route("owner.capital-prices"))
                            }
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="flex-1 sm:flex-none"
                        >
                            {processing && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isEditing ? "Simpan Perubahan" : "Buat Template"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                    <div className="space-y-4 sm:space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    <CardTitle className="text-base">
                                        Informasi Produk
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Nama Template{" "}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="e.g. HPP Kopi Arabika 1kg"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Akan muncul di dropdown saat
                                                memilih HPP produk.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="product_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nama Produk</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="e.g. Kopi Arabika Drip"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Produk yang dikalkulasi HPP-nya
                                                (opsional).
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <FlaskConical className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <div>
                                            <CardTitle className="text-base">
                                                Bahan yang Dibeli
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Tambahkan semua bahan beserta
                                                harga belinya.
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="shrink-0"
                                        onClick={() =>
                                            append({
                                                name: "",
                                                unit: "",
                                                qty: 1,
                                                price: 0,
                                            })
                                        }
                                    >
                                        <Plus className="mr-1 h-3 w-3" />
                                        Tambah
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="hidden sm:grid sm:grid-cols-[1fr_72px_100px_100px_32px] gap-2 text-xs font-medium text-muted-foreground">
                                    <span>Nama Bahan</span>
                                    <span>Satuan</span>
                                    <span>Jumlah</span>
                                    <span>Harga Beli (Rp)</span>
                                    <span />
                                </div>

                                {fields.length === 0 && (
                                    <p className="py-4 text-center text-sm text-muted-foreground">
                                        Belum ada bahan. Klik "Tambah".
                                    </p>
                                )}

                                {fields.map((field, index) => (
                                    <div
                                        key={field.id}
                                        className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-[1fr_72px_100px_100px_32px] sm:items-start sm:gap-2 rounded-lg border p-3 sm:border-0 sm:p-0"
                                    >
                                        <div className="flex items-center justify-between sm:contents">
                                            <p className="text-xs font-medium text-muted-foreground sm:hidden">
                                                Bahan {index + 1}
                                            </p>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-destructive hover:text-destructive sm:hidden"
                                                onClick={() => remove(index)}
                                                disabled={fields.length === 1}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name={`ingredients.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground sm:hidden">
                                                        Nama Bahan
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Gula pasir"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-3 gap-2 sm:contents">
                                            <FormField
                                                control={form.control}
                                                name={`ingredients.${index}.unit`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs text-muted-foreground sm:hidden">
                                                            Satuan
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="kg"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`ingredients.${index}.qty`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs text-muted-foreground sm:hidden">
                                                            Jumlah
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                                min="0.001"
                                                                step="0.001"
                                                                placeholder="1"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`ingredients.${index}.price`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs text-muted-foreground sm:hidden">
                                                            Harga (Rp)
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                                min="0"
                                                                placeholder="0"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="hidden sm:flex mt-0.5 h-9 w-8 text-destructive hover:text-destructive"
                                            onClick={() => remove(index)}
                                            disabled={fields.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}

                                {fields.length > 0 && (
                                    <>
                                        <Separator className="my-2" />
                                        <div className="space-y-1">
                                            {(watched.ingredients || []).map(
                                                (ing, i) => {
                                                    const sub =
                                                        (Number(ing.qty) || 0) *
                                                        (Number(ing.price) ||
                                                            0);
                                                    if (!ing.name && sub === 0)
                                                        return null;
                                                    return (
                                                        <div
                                                            key={i}
                                                            className="flex justify-between text-xs text-muted-foreground"
                                                        >
                                                            <span>
                                                                {ing.name ||
                                                                    `Bahan ${i + 1}`}
                                                            </span>
                                                            <span>
                                                                {formatRp(sub)}
                                                            </span>
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                        <div className="flex justify-between text-sm font-medium">
                                            <span>Total Bahan</span>
                                            <span>
                                                {formatRp(totalIngredients)}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Wrench className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <CardTitle className="text-base">
                                            Biaya Operasional
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Opsional — isi jika ada biaya
                                            tambahan per unit.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="labor_cost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Biaya Tenaga Kerja per Unit
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                                        Rp
                                                    </span>
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        min={0}
                                                        className="pl-9"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="overhead_cost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Biaya Overhead per Unit
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                                        Rp
                                                    </span>
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        min={0}
                                                        className="pl-9"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Jumlah Produk yang Dihasilkan
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="output_qty"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Jumlah Produk (Unit){" "}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    min={1}
                                                    placeholder="1"
                                                    className="max-w-40"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Berapa unit produk yang
                                                dihasilkan dari bahan di atas?
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Pengaturan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Deskripsi (opsional)
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    placeholder="Catatan singkat tentang template ini..."
                                                    rows={3}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="is_active"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-sm font-medium">
                                                    Aktif
                                                </FormLabel>
                                                <FormDescription className="text-xs">
                                                    Template nonaktif tidak
                                                    muncul di dropdown produk.
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

                    <div className="lg:col-span-1">
                        <div className="lg:sticky lg:top-20">
                            <Card className="border-primary/20 bg-primary/5">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Calculator className="h-4 w-4 text-primary" />
                                        <CardTitle className="text-base text-primary">
                                            Hasil Kalkulasi HPP
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Total Bahan
                                        </span>
                                        <span>
                                            {formatRp(totalIngredients)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Tenaga Kerja
                                        </span>
                                        <span>
                                            {formatRp(
                                                Number(watched.labor_cost) || 0,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Overhead
                                        </span>
                                        <span>
                                            {formatRp(
                                                Number(watched.overhead_cost) ||
                                                    0,
                                            )}
                                        </span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-medium">
                                        <span>Total Biaya</span>
                                        <span>{formatRp(totalCost)}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>÷ {outputQty} unit</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-lg font-bold text-primary">
                                        <span>HPP per Unit</span>
                                        <span>{formatRp(hppPerUnit)}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Nilai ini akan tersimpan sebagai{" "}
                                        <strong>amount</strong> template dan
                                        bisa dipilih di form produk.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    );
}
