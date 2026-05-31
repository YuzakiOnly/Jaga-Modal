import { useState } from "react";
import {
    ShoppingCart,
    Minus,
    Plus,
    Trash2,
    Banknote,
    QrCode,
    Tag,
    PenLine,
    X,
} from "lucide-react";

const formatRupiah = (num) => {
    return "Rp " + Math.round(num).toLocaleString("id-ID");
};

const AddCustomItemForm = ({ onAdd }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [itemName, setItemName] = useState("");
    const [itemSellingPrice, setItemSellingPrice] = useState("");
    const [itemCapitalPrice, setItemCapitalPrice] = useState("");
    const [itemQuantity, setItemQuantity] = useState(1);

    const handleSubmit = () => {
        const sellingPrice = parseFloat(itemSellingPrice);
        const capitalPrice = parseFloat(itemCapitalPrice) || 0;
        const qty = parseInt(itemQuantity);

        if (!itemName.trim() || !sellingPrice || sellingPrice <= 0) return;

        onAdd({
            product_id: null,
            _customKey: `custom_${Date.now()}_${Math.random()}`,
            name: itemName.trim(),
            unit_price: sellingPrice,
            capital_price: capitalPrice,
            qty: qty,
            subtotal: sellingPrice * qty,
            discount: 0,
            is_custom: true,
        });

        setItemName("");
        setItemSellingPrice("");
        setItemCapitalPrice("");
        setItemQuantity(1);
        setIsOpen(false);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200 cursor-pointer"
            >
                <PenLine className="h-4 w-4" />
                <span className="text-sm font-medium">Tambah Item Custom</span>
            </button>
        );
    }

    return (
        <div className="bg-emerald-50 rounded-xl p-3 space-y-3 border border-emerald-200">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 uppercase">
                    Item Custom
                </span>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Nama item..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                autoFocus
            />

            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                        Harga Jual
                    </span>
                    <input
                        type="number"
                        value={itemSellingPrice}
                        onChange={(e) => setItemSellingPrice(e.target.value)}
                        placeholder="Harga jual"
                        className="w-full pl-20 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                    />
                </div>
            </div>

            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                        Harga Modal
                    </span>
                    <input
                        type="number"
                        value={itemCapitalPrice}
                        onChange={(e) => setItemCapitalPrice(e.target.value)}
                        placeholder="Harga modal (opsional)"
                        className="w-full pl-24 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                    />
                </div>
            </div>
            <p className="text-[10px] text-gray-500 -mt-1">
                *Harga modal digunakan untuk menghitung laba. Kosongkan jika
                tidak ada modal.
            </p>

            <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-600">Quantity:</span>
                <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-2">
                    <button
                        onClick={() =>
                            setItemQuantity((q) => Math.max(1, q - 1))
                        }
                        className="text-gray-500 hover:text-emerald-600 cursor-pointer"
                    >
                        <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-semibold w-6 text-center">
                        {itemQuantity}
                    </span>
                    <button
                        onClick={() => setItemQuantity((q) => q + 1)}
                        className="text-gray-500 hover:text-emerald-600 cursor-pointer"
                    >
                        <Plus className="h-3 w-3" />
                    </button>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                    Batal
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!itemName.trim() || !parseFloat(itemSellingPrice)}
                    className="flex-1 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    Tambah
                </button>
            </div>
        </div>
    );
};

// Tampilkan info laba untuk item custom di cart
const CartItem = ({ item, onUpdateQuantity, onRemoveItem }) => {
    const profitPerItem = item.unit_price - item.capital_price;
    const totalProfit = profitPerItem * item.qty;

    return (
        <div className="p-4 hover:bg-slate-50 transition-colors">
            <div className="flex gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                        <p className="text-sm font-medium text-gray-800 truncate">
                            {item.name}
                        </p>
                        {item.is_custom && (
                            <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                                CUSTOM
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                        {formatRupiah(item.unit_price)}
                    </p>
                    {/* Tampilkan info laba untuk item custom */}
                    {item.is_custom && (
                        <p className="text-[10px] text-emerald-600">
                            Modal: {formatRupiah(item.capital_price)} |
                            Laba/item: {formatRupiah(profitPerItem)}
                        </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                        <button
                            onClick={() =>
                                onUpdateQuantity(
                                    item._customKey || item.product_id,
                                    -1,
                                )
                            }
                            className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                        >
                            <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">
                            {item.qty}
                        </span>
                        <button
                            onClick={() =>
                                onUpdateQuantity(
                                    item._customKey || item.product_id,
                                    1,
                                )
                            }
                            className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors"
                        >
                            <Plus className="h-3 w-3" />
                        </button>
                    </div>
                </div>

                <div className="text-right">
                    <button
                        onClick={() =>
                            onRemoveItem(item._customKey || item.product_id)
                        }
                        className="text-gray-400 hover:text-red-500 mb-2"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                    <p className="text-sm font-bold text-emerald-600">
                        {formatRupiah(item.subtotal)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default function Cart({
    items,
    subtotal,
    total,
    discount,
    paymentMethod,
    onDiscountChange,
    onPaymentMethodChange,
    onUpdateQuantity,
    onRemoveItem,
    onCheckout,
    onAddCustomItem,
    onClose,
}) {
    const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

    const getItemKey = (item) => {
        return item.is_custom ? item._customKey : item.product_id;
    };

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="shrink-0 p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-emerald-600" />
                        <h3 className="font-semibold text-gray-800">
                            Keranjang
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">
                            {totalItems} item{totalItems !== 1 ? "s" : ""}
                        </span>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12">
                        <ShoppingCart className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-sm text-gray-500">
                            Keranjang kosong
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Klik produk untuk menambah
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {items.map((item) => (
                            <CartItem
                                key={getItemKey(item)}
                                item={item}
                                onUpdateQuantity={onUpdateQuantity}
                                onRemoveItem={onRemoveItem}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="shrink-0 border-t border-gray-200 p-4 space-y-3 bg-white">
                <AddCustomItemForm onAdd={onAddCustomItem} />

                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-800">
                        {formatRupiah(subtotal)}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 flex-1">Diskon</span>
                    <div className="relative w-32">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                            Rp
                        </span>
                        <input
                            type="number"
                            value={discount || ""}
                            onChange={(e) =>
                                onDiscountChange(
                                    parseFloat(e.target.value) || 0,
                                )
                            }
                            placeholder="0"
                            className="w-full pl-7 pr-2 py-1.5 text-right text-sm border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-base font-bold text-gray-800">
                        Total
                    </span>
                    <span className="text-xl font-bold text-emerald-600">
                        {formatRupiah(total)}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => onPaymentMethodChange("cash")}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                            paymentMethod === "cash"
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                        <Banknote className="h-4 w-4" />
                        Tunai
                    </button>
                    <button
                        onClick={() => onPaymentMethodChange("qris")}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                            paymentMethod === "qris"
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                        <QrCode className="h-4 w-4" />
                        QRIS
                    </button>
                </div>

                <button
                    onClick={onCheckout}
                    disabled={items.length === 0}
                    className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                >
                    Proses Pembayaran →
                </button>
            </div>
        </div>
    );
}
