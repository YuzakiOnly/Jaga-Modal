import { z } from "zod";

export const transactionItemSchema = z.object({
    product_id: z.number().nullable().optional(),
    name: z.string()
        .min(1, "Nama produk harus diisi")
        .max(200, "Nama produk maksimal 200 karakter"),
    unit_price: z.number()
        .min(0, "Harga satuan tidak boleh negatif")
        .refine((val) => !isNaN(val) && val !== null, "Harga satuan harus diisi"),
    capital_price: z.number()
        .min(0, "Harga modal tidak boleh negatif"),
    qty: z.number()
        .int("Quantity harus bilangan bulat")
        .min(1, "Quantity minimal 1"),
    discount: z.number()
        .min(0, "Diskon tidak boleh negatif")
        .default(0),
    subtotal: z.number()
        .min(0, "Subtotal tidak boleh negatif"),
    is_custom: z.boolean().default(false),
});

export const transactionSchema = z.object({
    payment_method: z.enum(["cash", "qris"], {
        required_error: "Metode pembayaran harus dipilih",
    }),
    amount_paid: z.number()
        .min(0, "Jumlah bayar tidak boleh negatif"),
    change_amount: z.number()
        .min(0, "Kembalian tidak boleh negatif"),
    subtotal: z.number()
        .min(0, "Subtotal tidak boleh negatif"),
    discount: z.number()
        .min(0, "Diskon tidak boleh negatif")
        .default(0),
    total: z.number()
        .min(0, "Total tidak boleh negatif"),
    notes: z.string().max(500, "Catatan maksimal 500 karakter").nullable().optional(),
    transacted_at: z.string().nullable().optional(),
    items: z.array(transactionItemSchema)
        .min(1, "Minimal 1 item dalam transaksi"),
}).refine((data) => {
    if (data.payment_method === "cash") {
        return data.amount_paid >= data.total;
    }
    return true;
}, {
    message: "Jumlah bayar kurang dari total transaksi",
    path: ["amount_paid"],
});

export const stockAdjustmentSchema = z.object({
    items: z.array(z.object({
        id: z.number().min(1, "ID produk harus diisi"),
        qty: z.number()
            .int("Quantity harus bilangan bulat")
            .min(1, "Quantity minimal 1"),
    })).min(1, "Minimal 1 produk untuk penyesuaian stok"),
});

export const customItemSchema = z.object({
    name: z.string()
        .min(1, "Nama item harus diisi")
        .max(100, "Nama item maksimal 100 karakter"),
    selling_price: z.number()
        .min(1, "Harga jual minimal 1")
        .refine((val) => !isNaN(val) && val > 0, "Harga jual harus lebih dari 0"),
    capital_price: z.number()
        .min(0, "Harga modal tidak boleh negatif")
        .default(0),
    qty: z.number()
        .int("Quantity harus bilangan bulat")
        .min(1, "Quantity minimal 1")
        .default(1),
});

export const discountInputSchema = z.object({
    discount: z.number()
        .min(0, "Diskon tidak boleh negatif")
        .max(10000000, "Diskon melebihi batas maksimal"),
});

export const qtyInputSchema = z.object({
    qty: z.number()
        .int("Quantity harus bilangan bulat")
        .min(1, "Quantity minimal 1")
        .max(9999, "Quantity maksimal 9999"),
});