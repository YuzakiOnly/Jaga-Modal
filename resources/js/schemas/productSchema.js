import { z } from "zod";

const coerceNumber = (min, intOnly = false) => {
    let schema = z
        .union([z.string(), z.number()])
        .transform((val) => {
            if (val === "" || val === null || val === undefined) return undefined;
            return Number(val);
        })
        .pipe(
            intOnly
                ? z.number({ invalid_type_error: "Must be a number" }).int("Must be a whole number").min(min, `Must be ${min} or more`)
                : z.number({ invalid_type_error: "Must be a number" }).min(min, `Must be ${min} or more`),
        );
    return schema;
};

const coerceOptionalNumber = (min, intOnly = false) => {
    let schema = z
        .union([z.string(), z.number(), z.null(), z.undefined()])
        .transform((val) => {
            if (val === "" || val === null || val === undefined) return null;
            return Number(val);
        })
        .pipe(
            intOnly
                ? z.number({ invalid_type_error: "Must be a number" }).int("Must be a whole number").min(min, `Must be ${min} or more`).nullable()
                : z.number({ invalid_type_error: "Must be a number" }).min(min, `Must be ${min} or more`).nullable(),
        );
    return schema;
};

export const productSchema = z.object({
    category_id: z.string().optional().or(z.literal("")),
    name: z
        .string()
        .min(1, "Name is required")
        .max(150, "Name must be at most 150 characters"),
    sku: z
        .string()
        .max(100, "SKU must be at most 100 characters")
        .optional()
        .or(z.literal("")),
    barcode: z
        .string()
        .max(100, "Barcode must be at most 100 characters")
        .optional()
        .or(z.literal("")),
    description: z
        .string()
        .max(1000, "Description must be at most 1000 characters")
        .optional()
        .or(z.literal("")),
    capital_price: coerceNumber(0),
    selling_price: coerceNumber(0),
    stock_type: z.enum(["limited", "unlimited"], {
        required_error: "Stock type is required",
    }),
    stock: coerceOptionalNumber(0, true),
    minimum_stock: coerceOptionalNumber(0, true),
    unit: z
        .string()
        .min(1, "Unit is required")
        .max(20, "Unit must be at most 20 characters"),
    is_active: z.boolean().default(true),
});

/** @typedef {import("zod").infer<typeof productSchema>} ProductFormValues */