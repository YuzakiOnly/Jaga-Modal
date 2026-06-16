import { useState } from "react";
import {
    ShoppingCart,
    Minus,
    Plus,
    Trash2,
    Tag,
    PenLine,
    X,
    Percent,
    Package,
} from "lucide-react";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { customItemSchema, qtyInputSchema } from "@/schemas/posSchema";

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
                className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition"
            >
                <PenLine className="h-4 w-4" />
                <span className="text-sm">+ Item Custom</span>
            </button>
        );
    }

    return (
        <div className="bg-purple-50 rounded-lg p-3 space-y-2 border border-purple-200">
            <div className="flex justify-between">
                <span className="text-xs font-bold text-purple-700">
                    Item Custom
                </span>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama item"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                }`}
                autoFocus
            />
            {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
            )}

            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
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
                    className={`w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.selling_price
                            ? "border-red-500"
                            : "border-gray-300"
                    }`}
                />
            </div>

            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
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
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </div>

            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Qty:</span>
                <div className="flex items-center gap-2 bg-white border rounded-lg px-2">
                    <button
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="px-2 py-1"
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
                        className="px-2 py-1"
                    >
                        <Plus className="h-3 w-3" />
                    </button>
                </div>
            </div>

            <div className="flex gap-2 pt-2">
                <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-2 text-sm border rounded-lg hover:bg-white"
                >
                    Batal
                </button>
                <button
                    onClick={handleSubmit}
                    className="flex-1 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-500"
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
    const itemTotal = (item.unit_price - (item.discount || 0)) * item.qty;
    const [discountInput, setDiscountInput] = useState(
        item.discount ? formatNumberInput(item.discount) : "",
    );
    const [discountError, setDiscountError] = useState("");
    const [qtyInput, setQtyInput] = useState(item.qty.toString());
    const [isEditingQty, setIsEditingQty] = useState(false);

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
            onUpdateDiscount(item._customKey || item.product_id, 0);
        } else {
            setDiscountInput(formatNumberInput(numericValue));
            onUpdateDiscount(item._customKey || item.product_id, numericValue);
        }
    };

    const handleDiscountBlur = () => {
        if (discountInput === "") {
            setDiscountInput("");
            onUpdateDiscount(item._customKey || item.product_id, 0);
        }
    };

    const handleQtyChange = (newQty) => {
        if (newQty < 1) {
            onRemoveItem(item._customKey || item.product_id);
            return;
        }
        try {
            qtyInputSchema.parse({ qty: newQty });
            onUpdateQuantity(
                item._customKey || item.product_id,
                newQty - item.qty,
            );
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
        <div className="p-3 hover:bg-gray-50 transition">
            <div className="flex gap-3">
                <div className="shrink-0">
                    {item.image ? (
                        <img
                            src={`/storage/${item.image}`}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover border"
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
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border">
                            <Package className="h-6 w-6 text-gray-400" />
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-1 flex-wrap">
                        <p className="text-sm font-medium truncate">
                            {item.name}
                        </p>
                        {item.is_custom && (
                            <span className="text-[10px] bg-purple-100 text-purple-700 px-1 rounded">
                                C
                            </span>
                        )}
                    </div>

                    <p className="text-xs font-semibold text-emerald-600">
                        {formatRupiah(item.unit_price)}
                        {item.discount > 0 && (
                            <span className="text-xs text-red-500 ml-1">
                                -{formatRupiah(item.discount)}
                            </span>
                        )}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                        <button
                            onClick={() => handleQtyChange(item.qty - 1)}
                            className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-500 hover:text-white"
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
                                className="w-12 text-center text-sm font-semibold border rounded-md px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                autoFocus
                            />
                        ) : (
                            <span
                                onClick={handleQtyClick}
                                className="text-sm font-semibold w-12 text-center cursor-pointer hover:bg-gray-100 rounded-md px-1 py-0.5 transition-colors"
                            >
                                {item.qty}
                            </span>
                        )}
                        <button
                            onClick={() => handleQtyChange(item.qty + 1)}
                            className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-emerald-500 hover:text-white"
                        >
                            <Plus className="h-3 w-3" />
                        </button>
                    </div>
                </div>

                <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    className={`h-6 w-6 rounded-md border flex items-center justify-center ${item.discount > 0 ? "border-amber-400 text-amber-500" : "text-gray-400"}`}
                                >
                                    <Tag className="h-3 w-3" />
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
                                    className={`h-8 text-sm ${discountError ? "border-red-500" : ""}`}
                                />
                                {discountError && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {discountError}
                                    </p>
                                )}
                            </PopoverContent>
                        </Popover>
                        <button
                            onClick={() =>
                                onRemoveItem(item._customKey || item.product_id)
                            }
                            className="text-gray-400 hover:text-red-500"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="text-sm font-bold text-emerald-600">
                        {formatRupiah(itemTotal)}
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
    onDiscountChange,
    onUpdateQuantity,
    onUpdateDiscount,
    onRemoveItem,
    onCheckout,
    onAddCustomItem,
    onClose,
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
            <div className="shrink-0 p-4 border-b">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-emerald-600" />
                        <h3 className="font-semibold">Keranjang</h3>
                        <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">
                            {totalItems}
                        </span>
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="lg:hidden p-1">
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[280px] md:min-h-[500px] lg:min-h-[370px]">
                        <ShoppingCart className="h-12 w-12 text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">
                            Keranjang kosong
                        </p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {items.map((item) => (
                            <CartItem
                                key={item._customKey || item.product_id}
                                item={item}
                                onUpdateQuantity={onUpdateQuantity}
                                onUpdateDiscount={onUpdateDiscount}
                                onRemoveItem={onRemoveItem}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="shrink-0 border-t p-4 space-y-3">
                <AddCustomItemForm onAdd={onAddCustomItem} />

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-semibold">
                            {formatRupiah(subtotal)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 flex-1">
                            Diskon
                        </span>
                        <div className="relative w-28">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                Rp
                            </span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={discountInput}
                                onChange={handleDiscountChange}
                                onBlur={handleDiscountBlur}
                                placeholder="0"
                                className={`w-full pl-7 pr-2 py-1 text-right text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                    discountError
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                            />
                        </div>
                    </div>
                    {discountError && (
                        <p className="text-xs text-red-500 text-right">
                            {discountError}
                        </p>
                    )}

                    <div className="flex justify-between pt-2 border-t">
                        <span className="font-bold">Total</span>
                        <span className="text-xl font-bold text-emerald-600">
                            {formatRupiah(total)}
                        </span>
                    </div>
                </div>

                <button
                    onClick={onCheckout}
                    disabled={items.length === 0}
                    className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-500 disabled:opacity-50 transition"
                >
                    Bayar →
                </button>
            </div>
        </div>
    );
}
