import { z } from "zod";

export const expenseSchema = z
    .object({
        type: z.enum(["simple", "raw_material", "salary", "owner_withdrawal", "store_transfer_in"]),
        description: z.string().min(1, "Deskripsi wajib diisi").max(200),
        amount: z.string().optional(),
        quantity: z.string().optional(),
        unit_price: z.string().optional(),
        employee_name: z.string().optional(),
        salary_period: z.string().optional(),
        expensed_at: z.date(),
        notes: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.type === "raw_material") {
            const qty = parseFloat(data.quantity);
            const price = parseFloat(data.unit_price);
            if (!data.quantity || qty <= 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Jumlah harus lebih dari 0",
                    path: ["quantity"],
                });
            }
            if (!data.unit_price || price <= 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Harga satuan harus lebih dari 0",
                    path: ["unit_price"],
                });
            }
        } else if (data.type === "salary") {
            if (!data.employee_name?.trim()) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Nama karyawan wajib diisi",
                    path: ["employee_name"],
                });
            }
            if (!data.salary_period?.trim()) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Periode wajib diisi",
                    path: ["salary_period"],
                });
            }
            const amount = parseFloat(data.amount);
            if (!data.amount || amount <= 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Jumlah gaji harus lebih dari 0",
                    path: ["amount"],
                });
            }
        } else {
            const amount = parseFloat(data.amount);
            if (!data.amount || amount <= 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Jumlah harus lebih dari 0",
                    path: ["amount"],
                });
            }
        }
    });