import { z } from "zod";

const parseNumberInput = (value) => {
    if (value === undefined || value === null || value === "") return 0;
    const clean = String(value).replace(/[^0-9]/g, "");
    return clean ? parseInt(clean, 10) : 0;
};

export const categorySchema = z.object({
    name: z.string()
        .min(1, "Name is required")
        .max(100, "Name must be at most 100 characters"),
    description: z.string()
        .max(500, "Description must be at most 500 characters")
        .optional()
        .or(z.literal("")),
    is_active: z.boolean().default(true),
    sort_order: z.preprocess(
        (val) => parseNumberInput(val),
        z.number()
            .int("Sort order must be a whole number")
            .min(0, "Sort order must be 0 or more")
            .max(9999, "Sort order must be at most 9999")
            .default(0)
    ),
});

export const searchFilterSchema = z.object({
    search: z.string().max(100, "Search query too long").optional(),
    status: z.enum(["all", "active", "inactive"]).default("all"),
});

export const bulkActionSchema = z.object({
    ids: z.array(z.number()).min(1, "Select at least one category"),
    action: z.enum(["activate", "deactivate", "delete"]),
});