// import { useState, useEffect } from "react";
// import { Head, usePage, router } from "@inertiajs/react";
// import { toast, Toaster } from "sonner";
// import { route } from "ziggy-js";
// import {
//     Wallet,
//     Plus,
//     Minus,
//     ArrowDownLeft,
//     ArrowUpRight,
//     Trash2,
//     X,
// } from "lucide-react";
// import AppLayout from "@/layouts/dashboard/AppLayout";
// import { PeriodFilter } from "./_components/PeriodFilter";

// // ── Format currency ──────────────────────────────────────────────────────────
// const fmt = (n) =>
//     new Intl.NumberFormat("id-ID", {
//         style: "currency",
//         currency: "IDR",
//         minimumFractionDigits: 0,
//     }).format(Number(n ?? 0));

// const SOURCE_LABEL = {
//     withdrawal: "Tarik dari Toko",
//     manual_topup: "Tambah Manual",
//     personal_out: "Pengeluaran Pribadi",
// };

// const SOURCE_COLOR = {
//     withdrawal: "text-emerald-600 bg-emerald-50",
//     manual_topup: "text-blue-600 bg-blue-50",
//     personal_out: "text-rose-600 bg-rose-50",
// };

// // ── Dialog komponen ──────────────────────────────────────────────────────────
// function WalletFormDialog({ open, onClose, mode }) {
//     const today = new Date().toISOString().split("T")[0];
//     const [form, setForm] = useState({
//         amount: "",
//         description: "",
//         notes: "",
//         transacted_at: today,
//     });
//     const [errors, setErrors] = useState({});
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         if (open) {
//             setForm({
//                 amount: "",
//                 description: "",
//                 notes: "",
//                 transacted_at: today,
//             });
//             setErrors({});
//         }
//     }, [open]);

//     const routeName =
//         mode === "topup" ? "owner.wallet.topup" : "owner.wallet.spend";
//     const title =
//         mode === "topup" ? "Tambah Uang ke Dompet" : "Catat Pengeluaran Dompet";
//     const amtLabel =
//         mode === "topup" ? "Jumlah Uang Masuk" : "Jumlah Pengeluaran";
//     const btnClass =
//         mode === "topup"
//             ? "bg-emerald-600 hover:bg-emerald-700 text-white"
//             : "bg-rose-600 hover:bg-rose-700 text-white";

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         setLoading(true);
//         router.post(route(routeName), form, {
//             preserveScroll: true,
//             onSuccess: () => {
//                 onClose();
//                 setLoading(false);
//             },
//             onError: (e) => {
//                 setErrors(e);
//                 setLoading(false);
//             },
//         });
//     };

//     if (!open) return null;

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//             <div className="bg-background rounded-xl shadow-xl w-full max-w-md p-6">
//                 <div className="flex items-center justify-between mb-4">
//                     <h2 className="text-lg font-semibold">{title}</h2>
//                     <button
//                         onClick={onClose}
//                         className="text-muted-foreground hover:text-foreground"
//                     >
//                         <X className="h-5 w-5" />
//                     </button>
//                 </div>
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <div>
//                         <label className="text-sm font-medium">
//                             {amtLabel}
//                         </label>
//                         <input
//                             type="number"
//                             min="1"
//                             className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
//                             value={form.amount}
//                             onChange={(e) =>
//                                 setForm({ ...form, amount: e.target.value })
//                             }
//                         />
//                         {errors.amount && (
//                             <p className="text-xs text-red-500 mt-1">
//                                 {errors.amount}
//                             </p>
//                         )}
//                     </div>
//                     <div>
//                         <label className="text-sm font-medium">
//                             Keterangan
//                         </label>
//                         <input
//                             type="text"
//                             maxLength={200}
//                             className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
//                             value={form.description}
//                             onChange={(e) =>
//                                 setForm({
//                                     ...form,
//                                     description: e.target.value,
//                                 })
//                             }
//                         />
//                         {errors.description && (
//                             <p className="text-xs text-red-500 mt-1">
//                                 {errors.description}
//                             </p>
//                         )}
//                     </div>
//                     <div>
//                         <label className="text-sm font-medium">Tanggal</label>
//                         <input
//                             type="date"
//                             className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
//                             value={form.transacted_at}
//                             onChange={(e) =>
//                                 setForm({
//                                     ...form,
//                                     transacted_at: e.target.value,
//                                 })
//                             }
//                         />
//                     </div>
//                     <div>
//                         <label className="text-sm font-medium">
//                             Catatan (opsional)
//                         </label>
//                         <textarea
//                             rows={2}
//                             className="mt-1 w-full rounded-md border px-3 py-2 text-sm resize-none"
//                             value={form.notes}
//                             onChange={(e) =>
//                                 setForm({ ...form, notes: e.target.value })
//                             }
//                         />
//                     </div>
//                     <div className="flex gap-2 pt-1">
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             className="flex-1 rounded-md border py-2 text-sm font-medium hover:bg-muted transition-colors"
//                         >
//                             Batal
//                         </button>
//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${btnClass}`}
//                         >
//                             {loading ? "Menyimpan..." : "Simpan"}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// }

// // ── Main page ────────────────────────────────────────────────────────────────
// export default function WalletPage({ transactions, summary, filters }) {
//     const { flash } = usePage().props;
//     const [dialog, setDialog] = useState(null); // 'topup' | 'spend' | null

//     useEffect(() => {
//         if (flash?.success) toast.success(flash.success);
//         if (flash?.error) toast.error(flash.error);
//     }, [flash]);

//     const handleDelete = (t) => {
//         if (t.source === "withdrawal") {
//             toast.error("Hapus via halaman Pengeluaran Toko.");
//             return;
//         }
//         if (!confirm(`Hapus entri "${t.description}"?`)) return;
//         router.delete(route("owner.wallet.destroy", t.id), {
//             preserveScroll: true,
//         });
//     };

//     return (
//         <>
//             <Head title="Dompet Pemilik" />

//             <div className="p-6 space-y-6 max-w-4xl mx-auto">
//                 {/* Header */}
//                 <div className="flex items-center justify-between">
//                     <div>
//                         <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
//                             <Wallet className="h-6 w-6 text-primary" />
//                             Dompet Pemilik
//                         </h1>
//                         <p className="text-sm text-muted-foreground mt-0.5">
//                             Uang pribadi yang kamu terima dari toko
//                         </p>
//                     </div>
//                     <div className="flex gap-2">
//                         <button
//                             onClick={() => setDialog("spend")}
//                             className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-muted transition-colors"
//                         >
//                             <Minus className="h-4 w-4 text-rose-500" />
//                             Catat Keluar
//                         </button>
//                         <button
//                             onClick={() => setDialog("topup")}
//                             className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
//                         >
//                             <Plus className="h-4 w-4" />
//                             Tambah Uang
//                         </button>
//                     </div>
//                 </div>

//                 {/* Saldo card */}
//                 <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 shadow-lg">
//                     <p className="text-sm font-medium opacity-80">
//                         Saldo Dompet
//                     </p>
//                     <p className="text-4xl font-bold mt-1 tracking-tight">
//                         {fmt(summary.balance)}
//                     </p>
//                     <div className="mt-4 flex gap-6 text-sm opacity-90">
//                         <div>
//                             <span className="opacity-70 block">
//                                 Masuk periode ini
//                             </span>
//                             <span className="font-semibold">
//                                 {fmt(summary.period_in)}
//                             </span>
//                         </div>
//                         <div>
//                             <span className="opacity-70 block">
//                                 Keluar periode ini
//                             </span>
//                             <span className="font-semibold">
//                                 {fmt(summary.period_out)}
//                             </span>
//                         </div>
//                         <div>
//                             <span className="opacity-70 block">Transaksi</span>
//                             <span className="font-semibold">
//                                 {summary.count}
//                             </span>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Period filter */}
//                 <PeriodFilter filters={filters} />

//                 {/* Riwayat */}
//                 <div className="rounded-xl border bg-card">
//                     <div className="p-4 border-b">
//                         <h2 className="font-semibold text-sm">
//                             Riwayat Dompet
//                         </h2>
//                     </div>

//                     {transactions.data.length === 0 ? (
//                         <div className="py-16 text-center text-muted-foreground text-sm">
//                             Belum ada transaksi di periode ini.
//                         </div>
//                     ) : (
//                         <ul className="divide-y">
//                             {transactions.data.map((t) => (
//                                 <li
//                                     key={t.id}
//                                     className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
//                                 >
//                                     {/* Icon flow */}
//                                     <div
//                                         className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
//                                             t.flow === "in"
//                                                 ? "bg-emerald-100 text-emerald-600"
//                                                 : "bg-rose-100 text-rose-600"
//                                         }`}
//                                     >
//                                         {t.flow === "in" ? (
//                                             <ArrowDownLeft className="h-4 w-4" />
//                                         ) : (
//                                             <ArrowUpRight className="h-4 w-4" />
//                                         )}
//                                     </div>

//                                     {/* Info */}
//                                     <div className="flex-1 min-w-0">
//                                         <p className="text-sm font-medium truncate">
//                                             {t.description}
//                                         </p>
//                                         <div className="flex items-center gap-2 mt-0.5">
//                                             <span
//                                                 className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${SOURCE_COLOR[t.source]}`}
//                                             >
//                                                 {SOURCE_LABEL[t.source]}
//                                             </span>
//                                             <span className="text-xs text-muted-foreground">
//                                                 {t.transacted_at}
//                                             </span>
//                                         </div>
//                                     </div>

//                                     {/* Amount */}
//                                     <div className="text-right shrink-0">
//                                         <p
//                                             className={`text-sm font-semibold ${
//                                                 t.flow === "in"
//                                                     ? "text-emerald-600"
//                                                     : "text-rose-600"
//                                             }`}
//                                         >
//                                             {t.flow === "in" ? "+" : "-"}{" "}
//                                             {fmt(t.amount)}
//                                         </p>
//                                     </div>

//                                     {/* Delete — hanya untuk non-withdrawal */}
//                                     <button
//                                         onClick={() => handleDelete(t)}
//                                         className={`ml-1 rounded-md p-1.5 transition-colors ${
//                                             t.source === "withdrawal"
//                                                 ? "text-muted-foreground/30 cursor-not-allowed"
//                                                 : "text-muted-foreground hover:text-red-500 hover:bg-red-50"
//                                         }`}
//                                         title={
//                                             t.source === "withdrawal"
//                                                 ? "Hapus via Pengeluaran Toko"
//                                                 : "Hapus"
//                                         }
//                                     >
//                                         <Trash2 className="h-4 w-4" />
//                                     </button>
//                                 </li>
//                             ))}
//                         </ul>
//                     )}

//                     {/* Pagination */}
//                     {transactions.last_page > 1 && (
//                         <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
//                             <span>
//                                 {transactions.from}–{transactions.to} dari{" "}
//                                 {transactions.total}
//                             </span>
//                             <div className="flex gap-1">
//                                 {transactions.links.map((link, i) => (
//                                     <button
//                                         key={i}
//                                         disabled={!link.url || link.active}
//                                         onClick={() =>
//                                             link.url &&
//                                             router.get(
//                                                 link.url,
//                                                 {},
//                                                 { preserveScroll: true },
//                                             )
//                                         }
//                                         className={`px-3 py-1 rounded border text-xs transition-colors ${
//                                             link.active
//                                                 ? "bg-primary text-primary-foreground border-primary"
//                                                 : "hover:bg-muted"
//                                         } disabled:opacity-40 disabled:cursor-not-allowed`}
//                                         dangerouslySetInnerHTML={{
//                                             __html: link.label,
//                                         }}
//                                     />
//                                 ))}
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Dialogs */}
//             <WalletFormDialog
//                 open={dialog !== null}
//                 mode={dialog}
//                 onClose={() => setDialog(null)}
//             />

//             <Toaster position="top-right" richColors />
//         </>
//     );
// }

// WalletPage.layout = (page) => <AppLayout>{page}</AppLayout>;
