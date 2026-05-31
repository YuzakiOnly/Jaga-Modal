// resources/js/schemas/categorySchema.js

import { z } from "zod";

export const categorySchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
    description: z.string().max(500, "Description must be at most 500 characters").optional().or(z.literal("")),
    is_active: z.boolean().default(true),
    sort_order: z.coerce.number().int("Sort order must be a whole number").min(0, "Sort order must be 0 or more").default(0),
});

/** @typedef {import("zod").infer<typeof categorySchema>} CategoryFormValues */
