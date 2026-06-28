// schemas/posSchema.js
import { z } from "zod";

export const qtyInputSchema = z.object({
    qty: z.number().min(1, "Quantity minimal 1"),
});

export const variantOptionSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Nama opsi wajib diisi").max(150, "Nama opsi maksimal 150 karakter"),
    price_modifier: z.preprocess(
        (val) => {
            if (val === "" || val === null || val === undefined) return 0;
            const parsed = parseFloat(String(val).replace(/[^0-9.-]/g, ""));
            return isNaN(parsed) ? 0 : parsed;
        },
        z.number().min(-999999, "Minimal -999.999").max(999999, "Maksimal 999.999")
    ),
    is_active: z.boolean().default(true),
});

export const variantGroupSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Nama grup varian wajib diisi").max(150, "Nama grup varian maksimal 150 karakter"),
    internal_note: z.string().max(500, "Catatan internal maksimal 500 karakter").nullable().optional(),
    min_select: z.preprocess(
        (val) => {
            if (val === "" || val === null || val === undefined) return 0;
            return parseInt(String(val), 10);
        },
        z.number().min(0, "Minimal pilih minimal 0").max(999, "Maksimal 999")
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

export const productVariantSchema = z.object({
    product_id: z.number(),
    variant_group_id: z.number(),
    selected_options: z.array(z.number()),
});

export const cartItemVariantSchema = z.object({
    _key: z.string(),
    product_id: z.number().nullable(),
    name: z.string(),
    base_unit_price: z.number(),
    unit_price: z.number(),
    capital_price: z.number(),
    qty: z.number().min(1),
    discount: z.number().default(0),
    subtotal: z.number(),
    is_custom: z.boolean(),
    selectedOptions: z.record(z.array(z.object({
        id: z.number(),
        name: z.string(),
        price_modifier: z.number(),
    }))).optional().default({}),
    optionNames: z.array(z.string()).optional().default([]),
    modifier_total: z.number().optional().default(0),
});

// Tambahkan ini
export const customItemSchema = z.object({
    name: z.string().min(1, "Nama item wajib diisi"),
    selling_price: z.preprocess(
        (val) => {
            if (val === "" || val === null || val === undefined) return 0;
            const parsed = parseFloat(String(val).replace(/[^0-9.]/g, ""));
            return isNaN(parsed) ? 0 : parsed;
        },
        z.number().min(0, "Harga jual tidak boleh negatif")
    ),
    capital_price: z.preprocess(
        (val) => {
            if (val === "" || val === null || val === undefined) return 0;
            const parsed = parseFloat(String(val).replace(/[^0-9.]/g, ""));
            return isNaN(parsed) ? 0 : parsed;
        },
        z.number().min(0, "Harga modal tidak boleh negatif")
    ),
});