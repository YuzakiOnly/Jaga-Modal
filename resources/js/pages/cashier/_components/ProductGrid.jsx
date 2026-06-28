// resources/js/pages/cashier/_components/ProductGrid.jsx
import { Package, Infinity } from "lucide-react";

const formatRupiah = (num) => {
    return "Rp " + Number(num).toLocaleString("id-ID");
};

const StockBadge = ({ product }) => {
    if (product.stock_type === "unlimited") return null;

    if (product.stock <= 0) {
        return (
            <span className="absolute top-2 left-2 text-[10px] font-bold text-white bg-rose-500 px-2 py-0.5 rounded-full shadow-sm">
                Habis
            </span>
        );
    }

    if (product.minimum_stock && product.stock <= product.minimum_stock) {
        return (
            <span className="absolute top-2 left-2 text-[10px] font-bold text-white bg-amber-500 px-2 py-0.5 rounded-full shadow-sm">
                Sisa {product.stock}
            </span>
        );
    }

    return null;
};

export default function ProductGrid({ products, onAddToCart, cartItems }) {
    const cartMap = cartItems.reduce((map, item) => {
        if (!item.is_custom && item.product_id) {
            map[item.product_id] = (map[item.product_id] || 0) + item.qty;
        }
        return map;
    }, {});

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                    <Package className="h-7 w-7 text-slate-300" />
                </div>
                <p className="text-slate-600 font-medium">
                    Produk tidak ditemukan
                </p>
                <p className="text-sm text-slate-400 mt-1">
                    Coba ubah kata kunci pencarian atau kategori
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-5">
            {products.map((product) => {
                const isOutOfStock =
                    product.stock_type === "limited" && product.stock <= 0;
                const quantityInCart = cartMap[product.id] || 0;
                const hasVariants =
                    product.variant_groups && product.variant_groups.length > 0;

                return (
                    <button
                        key={product.id}
                        onClick={() => !isOutOfStock && onAddToCart(product)}
                        disabled={isOutOfStock}
                        className={`group text-left transition-all duration-200 ${
                            isOutOfStock
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer"
                        }`}
                    >
                        <div
                            className={`relative aspect-square rounded-2xl overflow-hidden bg-linear-to-br from-slate-100 to-slate-200 ring-1 ring-slate-200/60 transition-all duration-200 ${
                                quantityInCart > 0
                                    ? "ring-2 ring-orange-400"
                                    : "group-hover:ring-orange-300 group-hover:shadow-lg group-hover:-translate-y-1"
                            }`}
                        >
                            {product.image ? (
                                <img
                                    src={`/storage/${product.image}`}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-8 w-8 text-slate-300" />
                                </div>
                            )}

                            <StockBadge product={product} />

                            {product.stock_type === "unlimited" && (
                                <span className="absolute top-2 left-2 flex items-center gap-0.5 text-[10px] font-bold text-white bg-slate-900/70 px-2 py-0.5 rounded-full">
                                    <Infinity size={10} />
                                </span>
                            )}

                            {hasVariants && !isOutOfStock && (
                                <span className="absolute bottom-2 right-2 text-[9px] font-bold text-white bg-orange-500/90 px-1.5 py-0.5 rounded-full">
                                    Varian
                                </span>
                            )}

                            {quantityInCart > 0 && (
                                <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                                    {quantityInCart}
                                </div>
                            )}
                        </div>

                        <div className="mt-2 px-0.5">
                            <p className="text-xs font-semibold text-slate-800 truncate">
                                {product.name}
                            </p>
                            <div className="flex items-center justify-between mt-0.5">
                                <p className="text-[10px] text-slate-400 truncate">
                                    {product.category?.name || "Produk"}
                                </p>
                                <p className="text-xs font-bold text-orange-500 shrink-0 ml-1">
                                    {formatRupiah(product.selling_price)}
                                </p>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
