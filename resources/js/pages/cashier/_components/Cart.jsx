// resources/js/pages/cashier/_components/Cart.jsx
import { useState } from "react";
import {
    ShoppingBag,
    Minus,
    Plus,
    Trash2,
    Tag,
    PenLine,
    X,
    Percent,
    Package,
    MoreHorizontal,
} from "lucide-react";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { customItemSchema, qtyInputSchema } from "@/schemas/owner/posSchema";

const formatRupiah = (num) => "Rp " + Math.round(num).toLocaleString("id-ID");

const parseNumberInput = (value) => {
    if (!value) return 0;
    const clean = String(value).replace(/[^0-9]/g, "");
    return clean ? parseInt(clean, 10) : 0;
};

const formatNumberInput = (value) => {
    if (!value || value === 0) return "";
    return new Intl.NumberFormat("id-ID").format(value);
};

const AddCustomItemForm = ({ onAdd }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [sellingPrice, setSellingPrice] = useState("");
    const [capitalPrice, setCapitalPrice] = useState("");
    const [qty, setQty] = useState(1);
    const [errors, setErrors] = useState({});

    const validate = () => {
        try {
            customItemSchema.parse({
                name,
                selling_price: parseNumberInput(sellingPrice),
                capital_price: parseNumberInput(capitalPrice),
                qty,
            });
            setErrors({});
            return true;
        } catch (error) {
            const newErrors = {};
            error.errors.forEach(
                (err) => (newErrors[err.path[0]] = err.message),
            );
            setErrors(newErrors);
            return false;
        }
    };

    const handleSubmit = () => {
        if (!validate()) return;

        onAdd({
            product_id: null,
            _customKey: `custom_${Date.now()}_${Math.random()}`,
            name: name.trim(),
            unit_price: parseNumberInput(sellingPrice),
            capital_price: parseNumberInput(capitalPrice),
            qty,
            subtotal: parseNumberInput(sellingPrice) * qty,
            discount: 0,
            is_custom: true,
            image: null,
        });

        setName("");
        setSellingPrice("");
        setCapitalPrice("");
        setQty(1);
        setIsOpen(false);
        toast.success("Item custom ditambahkan");
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition cursor-pointer"
            >
                <PenLine className="h-4 w-4" />
                <span className="text-sm font-medium">Item Custom</span>
            </button>
        );
    }

    return (
        <div className="bg-orange-50 rounded-xl p-3 space-y-2 border border-orange-200">
            <div className="flex justify-between">
                <span className="text-xs font-bold text-orange-700">
                    Item Custom
                </span>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-500 cursor-pointer"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama item"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.name ? "border-rose-500" : "border-slate-300"
                }`}
                autoFocus
            />
            {errors.name && (
                <p className="text-xs text-rose-500">{errors.name}</p>
            )}

            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                    Rp
                </span>
                <input
                    type="text"
                    inputMode="numeric"
                    value={
                        sellingPrice
                            ? formatNumberInput(parseNumberInput(sellingPrice))
                            : ""
                    }
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="Harga jual"
                    className={`w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.selling_price
                            ? "border-rose-500"
                            : "border-slate-300"
                    }`}
                />
            </div>

            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                    Rp
                </span>
                <input
                    type="text"
                    inputMode="numeric"
                    value={
                        capitalPrice
                            ? formatNumberInput(parseNumberInput(capitalPrice))
                            : ""
                    }
                    onChange={(e) => setCapitalPrice(e.target.value)}
                    placeholder="Harga modal (opsional)"
                    className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
            </div>

            <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Qty:</span>
                <div className="flex items-center gap-2 bg-white border rounded-lg px-2">
                    <button
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="px-2 py-1 cursor-pointer"
                    >
                        <Minus className="h-3 w-3" />
                    </button>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={qty}
                        onChange={(e) => {
                            const val = parseNumberInput(e.target.value);
                            if (val >= 1) setQty(val);
                        }}
                        className="w-10 text-center text-sm outline-none"
                    />
                    <button
                        onClick={() => setQty(qty + 1)}
                        className="px-2 py-1 cursor-pointer"
                    >
                        <Plus className="h-3 w-3" />
                    </button>
                </div>
            </div>

            <div className="flex gap-2 pt-2">
                <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-2 text-sm border rounded-lg hover:bg-white cursor-pointer"
                >
                    Batal
                </button>
                <button
                    onClick={handleSubmit}
                    className="flex-1 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-orange-500 cursor-pointer"
                >
                    Tambah
                </button>
            </div>
        </div>
    );
};

const CartItem = ({
    item,
    onUpdateQuantity,
    onRemoveItem,
    onUpdateDiscount,
}) => {
    const itemKey = item._cartKey || item._customKey || item.product_id;
    const itemTotal = (item.unit_price - (item.discount || 0)) * item.qty;
    const [discountInput, setDiscountInput] = useState(
        item.discount ? formatNumberInput(item.discount) : "",
    );
    const [discountError, setDiscountError] = useState("");
    const [qtyInput, setQtyInput] = useState(item.qty.toString());
    const [isEditingQty, setIsEditingQty] = useState(false);

    // Get variant label from variant_details
    const variantLabel = item.variant_details
        ? item.variant_details
              .flatMap((g) => g.options.map((o) => o.option_name))
              .join(", ")
        : null;

    const handleDiscountChange = (e) => {
        const rawValue = e.target.value;
        const numericValue = parseNumberInput(rawValue);

        if (rawValue !== "" && numericValue > item.unit_price) {
            setDiscountError(`Maksimal ${formatRupiah(item.unit_price)}`);
            return;
        }

        setDiscountError("");
        if (rawValue === "") {
            setDiscountInput("");
            onUpdateDiscount(itemKey, 0);
        } else {
            setDiscountInput(formatNumberInput(numericValue));
            onUpdateDiscount(itemKey, numericValue);
        }
    };

    const handleDiscountBlur = () => {
        if (discountInput === "") {
            setDiscountInput("");
            onUpdateDiscount(itemKey, 0);
        }
    };

    const handleQtyChange = (newQty) => {
        if (newQty < 1) {
            onRemoveItem(itemKey);
            return;
        }
        try {
            qtyInputSchema.parse({ qty: newQty });
            onUpdateQuantity(itemKey, newQty - item.qty);
            setQtyInput(newQty.toString());
        } catch (error) {
            toast.error(error.errors[0]?.message);
        }
    };

    const handleQtyInputChange = (e) => {
        const rawValue = e.target.value;
        if (rawValue === "") {
            setQtyInput("");
            return;
        }
        const numericValue = parseNumberInput(rawValue);
        setQtyInput(numericValue.toString());
    };

    const handleQtyInputBlur = () => {
        if (qtyInput === "") {
            handleQtyChange(1);
        } else {
            const newQty = parseInt(qtyInput, 10);
            if (newQty >= 1) {
                handleQtyChange(newQty);
            } else {
                handleQtyChange(1);
            }
        }
        setIsEditingQty(false);
    };

    const handleQtyInputKeyDown = (e) => {
        if (e.key === "Enter") {
            e.currentTarget.blur();
        }
    };

    const handleQtyClick = () => {
        setIsEditingQty(true);
        setQtyInput(item.qty.toString());
    };

    return (
        <div className="py-3 group">
            <div className="flex gap-3">
                <div className="shrink-0">
                    {item.image ? (
                        <img
                            src={`/storage/${item.image}`}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = "none";
                                if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = "flex";
                                }
                            }}
                        />
                    ) : null}
                    {!item.image && (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                            <Package className="h-5 w-5 text-slate-400" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <div className="flex items-center gap-1 flex-wrap">
                                <p className="text-sm font-semibold text-slate-800 truncate">
                                    {item.name}
                                </p>
                                {item.is_custom && (
                                    <span className="text-[9px] bg-purple-100 text-purple-700 px-1 rounded shrink-0">
                                        C
                                    </span>
                                )}
                            </div>
                            {variantLabel && (
                                <p className="text-[10px] text-orange-600 font-medium truncate mt-0.5">
                                    {variantLabel}
                                </p>
                            )}
                            <p className="text-xs text-slate-400">
                                {item.qty} item
                                {item.discount > 0 && (
                                    <span className="text-rose-500 ml-1">
                                        -{formatRupiah(item.discount)}
                                    </span>
                                )}
                            </p>
                        </div>
                        <p className="text-sm font-bold text-slate-800 shrink-0">
                            {formatRupiah(itemTotal)}
                        </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5 bg-slate-50 rounded-full px-1">
                            <button
                                onClick={() => handleQtyChange(item.qty - 1)}
                                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                            >
                                <Minus className="h-3 w-3" />
                            </button>
                            {isEditingQty ? (
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={qtyInput}
                                    onChange={handleQtyInputChange}
                                    onBlur={handleQtyInputBlur}
                                    onKeyDown={handleQtyInputKeyDown}
                                    className="w-9 text-center text-xs font-semibold border rounded-md px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    autoFocus
                                />
                            ) : (
                                <span
                                    onClick={handleQtyClick}
                                    className="text-xs font-semibold w-9 text-center cursor-pointer"
                                >
                                    {item.qty}
                                </span>
                            )}
                            <button
                                onClick={() => handleQtyChange(item.qty + 1)}
                                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors cursor-pointer"
                            >
                                <Plus className="h-3 w-3" />
                            </button>
                        </div>

                        <div className="flex items-center gap-1">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        className={`h-6 w-6 rounded-md flex items-center justify-center cursor-pointer ${
                                            item.discount > 0
                                                ? "text-amber-500"
                                                : "text-slate-400 hover:text-slate-600"
                                        }`}
                                    >
                                        <Tag className="h-3.5 w-3.5" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-3">
                                    <Label className="text-xs">
                                        Diskon per item
                                    </Label>
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        value={discountInput}
                                        onChange={handleDiscountChange}
                                        onBlur={handleDiscountBlur}
                                        placeholder="0"
                                        className={`h-8 text-sm ${discountError ? "border-rose-500" : ""}`}
                                    />
                                    {discountError && (
                                        <p className="text-xs text-rose-500 mt-1">
                                            {discountError}
                                        </p>
                                    )}
                                </PopoverContent>
                            </Popover>
                            <button
                                onClick={() => onRemoveItem(itemKey)}
                                className="h-6 w-6 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-500 cursor-pointer"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
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
    onDiscountChange,
    onUpdateQuantity,
    onUpdateDiscount,
    onRemoveItem,
    onCheckout,
    onAddCustomItem,
    onClose,
    transactionNumber,
    cashierName,
}) {
    const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
    const [discountInput, setDiscountInput] = useState(
        discount ? formatNumberInput(discount) : "",
    );
    const [discountError, setDiscountError] = useState("");

    const handleDiscountChange = (e) => {
        const rawValue = e.target.value;
        const numericValue = parseNumberInput(rawValue);

        if (rawValue !== "" && numericValue > subtotal) {
            setDiscountError(`Maksimal ${formatRupiah(subtotal)}`);
            return;
        }

        setDiscountError("");
        if (rawValue === "") {
            setDiscountInput("");
            onDiscountChange(0);
        } else {
            setDiscountInput(formatNumberInput(numericValue));
            onDiscountChange(numericValue);
        }
    };

    const handleDiscountBlur = () => {
        if (discountInput === "") {
            setDiscountInput("");
            onDiscountChange(0);
        }
    };

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="shrink-0 px-5 pt-5 pb-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-orange-600" />
                        <h3 className="font-bold text-slate-800">
                            Pesanan Saat Ini
                        </h3>
                    </div>
                    <div className="flex items-center gap-1">
                        <button className="p-1 rounded-md hover:bg-slate-100 text-slate-400 cursor-pointer">
                            <MoreHorizontal className="h-4.5 w-4.5" />
                        </button>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="lg:hidden p-1 rounded-md hover:bg-slate-100 cursor-pointer"
                            >
                                <X className="h-5 w-5 text-slate-500" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                        <p className="text-slate-400 mb-0.5">Kasir</p>
                        <p className="font-semibold text-slate-700 truncate">
                            {cashierName || "Kasir"}
                        </p>
                    </div>
                    <div>
                        <p className="text-slate-400 mb-0.5">Item</p>
                        <p className="font-semibold text-slate-700">
                            {totalItems} item
                        </p>
                    </div>
                </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div className="flex-1 overflow-y-auto px-5">
                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[280px] md:min-h-[400px] lg:min-h-[300px]">
                        <ShoppingBag className="h-12 w-12 text-slate-200 mb-2" />
                        <p className="text-sm text-slate-400">
                            Belum ada pesanan
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {items.map((item) => (
                            <CartItem
                                key={
                                    item._cartKey ||
                                    item._customKey ||
                                    item.product_id
                                }
                                item={item}
                                onUpdateQuantity={onUpdateQuantity}
                                onUpdateDiscount={onUpdateDiscount}
                                onRemoveItem={onRemoveItem}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="shrink-0 px-5 pb-5 pt-3 space-y-3">
                <AddCustomItemForm onAdd={onAddCustomItem} />

                <div className="border-t border-dashed border-slate-200 pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">
                            Subtotal · {totalItems} item
                        </span>
                        <span className="font-semibold text-slate-700">
                            {formatRupiah(subtotal)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Percent className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-sm text-slate-500 flex-1">
                            Diskon
                        </span>
                        <div className="relative w-28">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                Rp
                            </span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={discountInput}
                                onChange={handleDiscountChange}
                                onBlur={handleDiscountBlur}
                                placeholder="0"
                                className={`w-full pl-7 pr-2 py-1 text-right text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                                    discountError
                                        ? "border-rose-500"
                                        : "border-slate-200"
                                }`}
                            />
                        </div>
                    </div>
                    {discountError && (
                        <p className="text-xs text-rose-500 text-right">
                            {discountError}
                        </p>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-200">
                        <span className="font-bold text-slate-800">Total</span>
                        <span className="text-xl font-bold text-orange-500">
                            {formatRupiah(total)}
                        </span>
                    </div>
                </div>

                <button
                    onClick={onCheckout}
                    disabled={items.length === 0}
                    className="w-full py-3.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-lg shadow-orange-500/20"
                >
                    Proses Transaksi
                </button>
            </div>
        </div>
    );
}
