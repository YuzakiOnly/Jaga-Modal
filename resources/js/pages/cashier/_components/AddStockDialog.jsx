import { useState } from "react";
import { router } from "@inertiajs/react";
import {
    PackagePlus,
    Plus,
    Minus,
    Search,
    X,
    Loader2,
    AlertTriangle,
    Infinity,
} from "lucide-react";

export default function AddStockDialog({ isOpen, onClose, products = [] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [stockAdjustments, setStockAdjustments] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const limitedProducts = products.filter((p) => p.stock_type === "limited");

    const filteredProducts = limitedProducts.filter((p) => {
        const query = searchTerm.toLowerCase();
        return (
            p.name.toLowerCase().includes(query) ||
            (p.sku && p.sku.toLowerCase().includes(query)) ||
            (p.barcode && p.barcode.toLowerCase().includes(query))
        );
    });

    const getQuantity = (productId) => stockAdjustments[productId] || 0;

    const setQuantity = (productId, value) => {
        const parsed = parseInt(value, 10);
        setStockAdjustments((prev) => ({
            ...prev,
            [productId]: isNaN(parsed) ? 0 : Math.max(0, parsed),
        }));
    };

    const increment = (productId) =>
        setQuantity(productId, getQuantity(productId) + 1);
    const decrement = (productId) =>
        setQuantity(productId, Math.max(0, getQuantity(productId) - 1));

    const selectedProducts = Object.keys(stockAdjustments).filter(
        (id) => stockAdjustments[id] > 0,
    );
    const totalQuantity = selectedProducts.reduce(
        (sum, id) => sum + stockAdjustments[id],
        0,
    );

    const handleSubmit = () => {
        if (selectedProducts.length === 0) return;

        const items = selectedProducts.map((id) => ({
            id: parseInt(id, 10),
            qty: stockAdjustments[id],
        }));

        setIsSubmitting(true);
        router.post(
            route("cashier.stock-adjust"),
            { items },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setStockAdjustments({});
                    setSearchTerm("");
                    onClose();
                },
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white w-125 max-w-[90vw] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-100">
                            <PackagePlus className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">
                                Tambah Stok
                            </h3>
                            <p className="text-xs text-gray-500">
                                Tambahkan stok untuk produk terbatas
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="px-5 py-3 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari produk, SKU, atau barcode..."
                            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {limitedProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <Infinity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">
                                Tidak ada produk dengan stok terbatas
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Semua produk Anda adalah unlimited stock
                            </p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">
                                Produk tidak ditemukan
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredProducts.map((product) => {
                                const qty = getQuantity(product.id);
                                const isLowStock =
                                    product.minimum_stock &&
                                    product.stock <= product.minimum_stock;

                                return (
                                    <div
                                        key={product.id}
                                        className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        {product.image ? (
                                            <img
                                                src={`/storage/${product.image}`}
                                                alt={product.name}
                                                className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                                                <PackagePlus className="h-5 w-5 text-gray-400" />
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">
                                                {product.name}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                <span
                                                    className={`text-xs font-medium ${
                                                        product.stock <= 0
                                                            ? "text-red-500"
                                                            : isLowStock
                                                              ? "text-amber-600"
                                                              : "text-gray-500"
                                                    }`}
                                                >
                                                    Stok: {product.stock || 0}{" "}
                                                    {product.unit || "pcs"}
                                                    {product.stock <= 0 &&
                                                        " · Habis"}
                                                    {isLowStock &&
                                                        product.stock > 0 &&
                                                        " · Menipis"}
                                                </span>
                                                {product.sku && (
                                                    <span className="text-[10px] text-gray-400 font-mono">
                                                        {product.sku}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() =>
                                                    decrement(product.id)
                                                }
                                                disabled={qty <= 0}
                                                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <input
                                                type="number"
                                                min={0}
                                                value={qty || ""}
                                                onChange={(e) =>
                                                    setQuantity(
                                                        product.id,
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-14 h-7 text-center text-sm font-semibold border border-gray-200 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none"
                                            />
                                            <button
                                                onClick={() =>
                                                    increment(product.id)
                                                }
                                                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-emerald-500 hover:text-white transition-all"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-200 p-5 space-y-3">
                    {selectedProducts.length > 0 && (
                        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                            {selectedProducts.map((id) => {
                                const product = products.find(
                                    (p) => p.id === parseInt(id),
                                );
                                if (!product) return null;
                                return (
                                    <span
                                        key={id}
                                        className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full"
                                    >
                                        {product.name}
                                        <span className="font-bold">
                                            +{stockAdjustments[id]}
                                        </span>
                                        <button
                                            onClick={() =>
                                                setStockAdjustments((prev) => {
                                                    const newState = {
                                                        ...prev,
                                                    };
                                                    delete newState[id];
                                                    return newState;
                                                })
                                            }
                                            className="hover:text-red-500 ml-1"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={
                                selectedProducts.length === 0 || isSubmitting
                            }
                            className="flex-1 py-2.5 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmitting && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            Simpan{" "}
                            {selectedProducts.length > 0 &&
                                `(${totalQuantity})`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
