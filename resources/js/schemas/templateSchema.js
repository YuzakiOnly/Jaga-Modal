import { z } from "zod";

export const ingredientSchema = z.object({
    name: z
        .string()
        .min(1, "Nama bahan wajib diisi")
        .max(150, "Nama bahan maksimal 150 karakter"),
    unit: z
        .string()
        .min(1, "Satuan wajib diisi")
        .max(30, "Satuan maksimal 30 karakter"),
    qty: z.coerce
        .number()
        .min(0.001, "Jumlah harus lebih dari 0"),
    price: z.coerce
        .number()
        .min(0, "Harga tidak boleh negatif"),
});

export const templateSchema = z.object({
    name: z
        .string()
        .min(1, "Nama template wajib diisi")
        .max(150, "Nama template maksimal 150 karakter"),
    product_name: z
        .string()
        .max(150, "Nama produk maksimal 150 karakter")
        .optional()
        .or(z.literal("")),
    ingredients: z.array(ingredientSchema),
    labor_cost: z.coerce.number().min(0, "Biaya tenaga kerja tidak boleh negatif").optional().default(0),
    overhead_cost: z.coerce.number().min(0, "Biaya overhead tidak boleh negatif").optional().default(0),
    output_qty: z.coerce
        .number()
        .int("Jumlah produk harus bilangan bulat")
        .min(1, "Minimal 1 unit"),
    description: z
        .string()
        .max(500, "Deskripsi maksimal 500 karakter")
        .optional()
        .or(z.literal("")),
    is_active: z.boolean().default(true),
});

/**
 * @typedef {import("zod").infer<typeof ingredientSchema>} IngredientFormValues
 * @typedef {import("zod").infer<typeof templateSchema>} TemplateFormValues
 */
