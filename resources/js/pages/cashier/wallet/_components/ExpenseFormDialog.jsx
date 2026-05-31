// // File: resources/js/pages/owner/expenses/_components/ExpenseFormDialog.jsx
// //
// // Perubahan dari versi sebelumnya:
// //   • Tambah tipe "owner_withdrawal" di TYPES
// //   • Form owner_withdrawal sama dengan simple (cukup amount + description)
// //   • Badge khusus (warna ungu/violet) untuk tipe owner_withdrawal

// import { useEffect, useState } from "react";
// import { router } from "@inertiajs/react";
// import { route } from "ziggy-js";
// import { X, Wallet } from "lucide-react";

// const TYPES = [
//     { value: "simple", label: "Pengeluaran Biasa" },
//     { value: "raw_material", label: "Bahan Baku" },
//     { value: "salary", label: "Gaji Karyawan" },
//     { value: "owner_withdrawal", label: "💰 Masuk Dompetku" },
// ];

// const defaultForm = {
//     type: "simple",
//     description: "",
//     amount: "",
//     quantity: "",
//     unit_price: "",
//     employee_name: "",
//     salary_period: "",
//     expensed_at: new Date().toISOString().split("T")[0],
//     notes: "",
// };

// export function ExpenseFormDialog({ open, onOpenChange, editTarget }) {
//     const [form, setForm] = useState(defaultForm);
//     const [errors, setErrors] = useState({});
//     const [loading, setLoading] = useState(false);

//     const isEdit = !!editTarget;

//     useEffect(() => {
//         if (open) {
//             if (editTarget) {
//                 setForm({
//                     type: editTarget.type ?? "simple",
//                     description: editTarget.description ?? "",
//                     amount: editTarget.amount ?? "",
//                     quantity: editTarget.quantity ?? "",
//                     unit_price: editTarget.unit_price ?? "",
//                     employee_name: editTarget.employee_name ?? "",
//                     salary_period: editTarget.salary_period ?? "",
//                     expensed_at:
//                         editTarget.expensed_at ?? defaultForm.expensed_at,
//                     notes: editTarget.notes ?? "",
//                 });
//             } else {
//                 setForm(defaultForm);
//             }
//             setErrors({});
//         }
//     }, [open, editTarget]);

//     const set = (field) => (e) =>
//         setForm((prev) => ({ ...prev, [field]: e.target.value }));

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         setLoading(true);

//         const routeName = isEdit
//             ? "owner.expenses.update"
//             : "owner.expenses.store";
//         const method = isEdit ? "put" : "post";
//         const url = isEdit ? route(routeName, editTarget.id) : route(routeName);

//         router[method](url, form, {
//             preserveScroll: true,
//             onSuccess: () => {
//                 onOpenChange();
//                 setLoading(false);
//             },
//             onError: (e) => {
//                 setErrors(e);
//                 setLoading(false);
//             },
//         });
//     };

//     if (!open) return null;

//     const isRaw = form.type === "raw_material";
//     const isSalary = form.type === "salary";
//     const isWithdraw = form.type === "owner_withdrawal";

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//             <div className="bg-background rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
//                 {/* Header */}
//                 <div className="flex items-center justify-between mb-5">
//                     <h2 className="text-lg font-semibold">
//                         {isEdit ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
//                     </h2>
//                     <button
//                         onClick={onOpenChange}
//                         className="text-muted-foreground hover:text-foreground"
//                     >
//                         <X className="h-5 w-5" />
//                     </button>
//                 </div>

//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     {/* Tipe */}
//                     <div>
//                         <label className="text-sm font-medium">
//                             Tipe Pengeluaran
//                         </label>
//                         <div className="mt-1.5 grid grid-cols-2 gap-2">
//                             {TYPES.map((t) => (
//                                 <button
//                                     key={t.value}
//                                     type="button"
//                                     onClick={() =>
//                                         setForm((prev) => ({
//                                             ...prev,
//                                             type: t.value,
//                                         }))
//                                     }
//                                     className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all text-left ${
//                                         form.type === t.value
//                                             ? t.value === "owner_withdrawal"
//                                                 ? "border-violet-500 bg-violet-50 text-violet-700 ring-1 ring-violet-400"
//                                                 : "border-primary bg-primary/5 text-primary ring-1 ring-primary"
//                                             : "hover:bg-muted"
//                                     }`}
//                                 >
//                                     {t.label}
//                                 </button>
//                             ))}
//                         </div>

//                         {/* Info banner untuk owner_withdrawal */}
//                         {isWithdraw && (
//                             <div className="mt-2 flex items-start gap-2 rounded-lg bg-violet-50 border border-violet-200 px-3 py-2 text-xs text-violet-700">
//                                 <Wallet className="h-4 w-4 mt-0.5 shrink-0" />
//                                 <span>
//                                     Jumlah ini akan otomatis masuk ke{" "}
//                                     <strong>Dompet Pemilik</strong> dan tercatat
//                                     sebagai pengeluaran toko.
//                                 </span>
//                             </div>
//                         )}
//                     </div>

//                     {/* Deskripsi */}
//                     <div>
//                         <label className="text-sm font-medium">
//                             {isWithdraw ? "Keterangan" : "Deskripsi"}
//                         </label>
//                         <input
//                             type="text"
//                             maxLength={200}
//                             placeholder={
//                                 isWithdraw
//                                     ? "Misal: Ambil laba minggu ini"
//                                     : "Misal: Beli sabun, dll"
//                             }
//                             className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
//                             value={form.description}
//                             onChange={set("description")}
//                         />
//                         {errors.description && (
//                             <p className="text-xs text-red-500 mt-1">
//                                 {errors.description}
//                             </p>
//                         )}
//                     </div>

//                     {/* ── Field tergantung tipe ── */}

//                     {/* Raw material */}
//                     {isRaw && (
//                         <div className="grid grid-cols-2 gap-3">
//                             <div>
//                                 <label className="text-sm font-medium">
//                                     Jumlah / Qty
//                                 </label>
//                                 <input
//                                     type="number"
//                                     min="0.01"
//                                     step="0.01"
//                                     className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
//                                     value={form.quantity}
//                                     onChange={set("quantity")}
//                                 />
//                                 {errors.quantity && (
//                                     <p className="text-xs text-red-500 mt-1">
//                                         {errors.quantity}
//                                     </p>
//                                 )}
//                             </div>
//                             <div>
//                                 <label className="text-sm font-medium">
//                                     Harga Satuan
//                                 </label>
//                                 <input
//                                     type="number"
//                                     min="0.01"
//                                     className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
//                                     value={form.unit_price}
//                                     onChange={set("unit_price")}
//                                 />
//                                 {errors.unit_price && (
//                                     <p className="text-xs text-red-500 mt-1">
//                                         {errors.unit_price}
//                                     </p>
//                                 )}
//                             </div>
//                             {form.quantity && form.unit_price && (
//                                 <div className="col-span-2 text-sm text-muted-foreground">
//                                     Total:{" "}
//                                     <strong>
//                                         {new Intl.NumberFormat("id-ID", {
//                                             style: "currency",
//                                             currency: "IDR",
//                                             minimumFractionDigits: 0,
//                                         }).format(
//                                             form.quantity * form.unit_price,
//                                         )}
//                                     </strong>
//                                 </div>
//                             )}
//                         </div>
//                     )}

//                     {/* Salary */}
//                     {isSalary && (
//                         <div className="space-y-3">
//                             <div>
//                                 <label className="text-sm font-medium">
//                                     Nama Karyawan
//                                 </label>
//                                 <input
//                                     type="text"
//                                     maxLength={100}
//                                     className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
//                                     value={form.employee_name}
//                                     onChange={set("employee_name")}
//                                 />
//                                 {errors.employee_name && (
//                                     <p className="text-xs text-red-500 mt-1">
//                                         {errors.employee_name}
//                                     </p>
//                                 )}
//                             </div>
//                             <div>
//                                 <label className="text-sm font-medium">
//                                     Periode Gaji
//                                 </label>
//                                 <input
//                                     type="text"
//                                     maxLength={50}
//                                     placeholder="Misal: Mei 2026"
//                                     className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
//                                     value={form.salary_period}
//                                     onChange={set("salary_period")}
//                                 />
//                                 {errors.salary_period && (
//                                     <p className="text-xs text-red-500 mt-1">
//                                         {errors.salary_period}
//                                     </p>
//                                 )}
//                             </div>
//                             <div>
//                                 <label className="text-sm font-medium">
//                                     Jumlah Gaji
//                                 </label>
//                                 <input
//                                     type="number"
//                                     min="1"
//                                     className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
//                                     value={form.amount}
//                                     onChange={set("amount")}
//                                 />
//                                 {errors.amount && (
//                                     <p className="text-xs text-red-500 mt-1">
//                                         {errors.amount}
//                                     </p>
//                                 )}
//                             </div>
//                         </div>
//                     )}

//                     {/* Simple & owner_withdrawal */}
//                     {(form.type === "simple" || isWithdraw) && (
//                         <div>
//                             <label className="text-sm font-medium">
//                                 {isWithdraw ? "Jumlah yang Diambil" : "Jumlah"}
//                             </label>
//                             <input
//                                 type="number"
//                                 min="1"
//                                 className={`mt-1 w-full rounded-md border px-3 py-2 text-sm ${isWithdraw ? "border-violet-300 focus:ring-violet-400" : ""}`}
//                                 value={form.amount}
//                                 onChange={set("amount")}
//                             />
//                             {errors.amount && (
//                                 <p className="text-xs text-red-500 mt-1">
//                                     {errors.amount}
//                                 </p>
//                             )}
//                         </div>
//                     )}

//                     {/* Tanggal */}
//                     <div>
//                         <label className="text-sm font-medium">Tanggal</label>
//                         <input
//                             type="date"
//                             className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
//                             value={form.expensed_at}
//                             onChange={set("expensed_at")}
//                         />
//                         {errors.expensed_at && (
//                             <p className="text-xs text-red-500 mt-1">
//                                 {errors.expensed_at}
//                             </p>
//                         )}
//                     </div>

//                     {/* Catatan */}
//                     <div>
//                         <label className="text-sm font-medium">
//                             Catatan (opsional)
//                         </label>
//                         <textarea
//                             rows={2}
//                             className="mt-1 w-full rounded-md border px-3 py-2 text-sm resize-none"
//                             value={form.notes}
//                             onChange={set("notes")}
//                         />
//                     </div>

//                     {/* Submit */}
//                     <div className="flex gap-2 pt-1">
//                         <button
//                             type="button"
//                             onClick={onOpenChange}
//                             className="flex-1 rounded-md border py-2 text-sm font-medium hover:bg-muted transition-colors"
//                         >
//                             Batal
//                         </button>
//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors text-white ${
//                                 isWithdraw
//                                     ? "bg-violet-600 hover:bg-violet-700"
//                                     : "bg-primary hover:bg-primary/90"
//                             }`}
//                         >
//                             {loading
//                                 ? "Menyimpan..."
//                                 : isEdit
//                                   ? "Perbarui"
//                                   : "Simpan"}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// }
