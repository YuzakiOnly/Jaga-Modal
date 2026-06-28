import { z } from "zod";

const usernameRule = z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(20, "Username maksimal 20 karakter")
    .regex(/^[a-z0-9_]+$/, "Hanya huruf kecil, angka, dan underscore");

const passwordRule = z
    .string()
    .min(8, "Password minimal 8 karakter");

export const employeeManualSchema = z.object({
    name: z.string().min(1, "Nama wajib diisi").max(255),
    username: usernameRule,
    phone: z.string().min(8, "Nomor telepon tidak valid").max(20),
    role: z.string().min(1, "Role wajib dipilih"),
    password: passwordRule,
});

export const employeeInviteSchema = z.object({
    name: z.string().max(255).optional().or(z.literal("")),
    role: z.string().min(1, "Role wajib dipilih"),
});