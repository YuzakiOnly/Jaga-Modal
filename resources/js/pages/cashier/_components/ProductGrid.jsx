import { Package, Plus, Infinity } from "lucide-react";

const formatRupiah = (num) => {
    return "Rp " + Number(num).toLocaleString("id-ID");
};

const StockStatus = ({ product }) => {
    if (product.stock_type === "unlimited") {
        return (
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                <Infinity size={10} />
                Unlimited
            </span>
        );
    }

    if (product.stock <= 0) {
        return (
            <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                Habis
            </span>
        );
    }

    if (product.minimum_stock && product.stock <= product.minimum_stock) {
        return (
            <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                Sisa {product.stock}
            </span>
        );
    }

    return (
        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
            Stok {product.stock}
        </span>
    );
};

export default function ProductGrid({ products, onAddToCart, cartItems }) {
    const cartMap = cartItems.reduce((map, item) => {
        if (!item.is_custom) {
            map[item.product_id] = item.qty;
        }
        return map;
    }, {});

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">Produk tidak ditemukan</p>
                <p className="text-sm text-gray-400 mt-1">
                    Coba ubah kata kunci pencarian
                </p>
            </div>
        );
    }

    return (
        <div className="p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {products.map((product) => {
                    const isOutOfStock =
                        product.stock_type === "limited" && product.stock <= 0;
                    const quantityInCart = cartMap[product.id] || 0;

                    return (
                        <button
                            key={product.id}
                            onClick={() =>
                                !isOutOfStock && onAddToCart(product)
                            }
                            disabled={isOutOfStock}
                            className={`group text-left bg-white rounded-lg border transition-all duration-200 overflow-hidden relative ${
                                isOutOfStock
                                    ? "opacity-50 cursor-not-allowed border-gray-200"
                                    : quantityInCart > 0
                                      ? "border-emerald-400 shadow-sm ring-2 ring-emerald-200"
                                      : "border-gray-200 hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                            }`}
                        >
                            {quantityInCart > 0 && (
                                <div className="absolute top-1.5 right-1.5 z-10 bg-emerald-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                                    {quantityInCart}
                                </div>
                            )}

                            <div className="relative aspect-square bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                                {product.image ? (
                                    <img
                                        src={`/storage/${product.image}`}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <Package className="h-8 w-8 text-gray-300" />
                                )}

                                {!isOutOfStock && (
                                    <div className="absolute inset-0 bg-emerald-600/0 group-hover:bg-emerald-600/10 transition-all duration-200 flex items-center justify-center">
                                        <div className="bg-emerald-600 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-75 group-hover:scale-100 shadow-lg">
                                            <Plus className="h-3.5 w-3.5 text-white" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-2">
                                <p className="text-xs font-semibold text-gray-800 line-clamp-2 mb-1 leading-tight">
                                    {product.name}
                                </p>
                                <div className="mb-1.5">
                                    <p className="text-sm font-bold text-emerald-700">
                                        {formatRupiah(product.selling_price)}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between gap-1">
                                    <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded truncate">
                                        {product.category?.name || "-"}
                                    </span>
                                    <StockStatus product={product} />
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
