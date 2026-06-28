// schemas/owner/variantSchema.js
import { z } from "zod";

export const variantOptionSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Nama opsi wajib diisi").max(150, "Nama opsi maksimal 150 karakter"),
    price_modifier: z.preprocess(
        (val) => {
            if (val === "" || val === null || val === undefined) return 0;
            const parsed = parseFloat(String(val).replace(/[^0-9.]/g, ""));
            return isNaN(parsed) ? 0 : parsed;
        },
        z.number().min(0, "Harga tidak boleh negatif").max(999999, "Maksimal 999.999")
    ),
    is_active: z.boolean().default(true),
});

export const variantGroupSchema = z.object({
    name: z.string().min(1, "Nama grup varian wajib diisi").max(150, "Nama grup varian maksimal 150 karakter"),
    internal_note: z.string().max(500, "Catatan internal maksimal 500 karakter").nullable().optional(),
    min_select: z.preprocess(
        (val) => {
            if (val === "" || val === null || val === undefined) return 0;
            return parseInt(String(val), 10);
        },
        z.number().min(0, "Minimal pilih tidak boleh kurang dari 0").max(999, "Maksimal 999")
    ),
    max_select: z.preprocess(
        (val) => {
            if (val === "" || val === null || val === undefined) return 1;
            return parseInt(String(val), 10);
        },
        z.number().min(1, "Maksimal pilih minimal 1").max(999, "Maksimal 999")
    ),
    is_active: z.boolean().default(true),
    options: z.array(variantOptionSchema).min(1, "Minimal 1 opsi"),
    product_ids: z.array(z.number()).optional().default([]),
}).refine(
    (data) => data.max_select >= data.min_select,
    {
        message: "Maksimal pilih tidak boleh kurang dari minimal pilih",
        path: ["max_select"],
    }
);

export const variantGroupFormSchema = z.object({
    variant_groups: z.array(variantGroupSchema).optional().default([]),
});

export const updateVariantGroupSchema = variantGroupSchema.extend({
    id: z.number().optional(),
});

export const bulkVariantGroupSchema = z.object({
    groups: z.array(variantGroupSchema),
});

export const variantGroupFilterSchema = z.object({
    search: z.string().optional(),
    status: z.enum(["active", "inactive", "all"]).optional().default("all"),
    per_page: z.number().min(1).max(100).optional().default(15),
});