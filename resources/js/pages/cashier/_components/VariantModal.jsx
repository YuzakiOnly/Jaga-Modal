// resources/js/pages/cashier/_components/VariantModal.jsx
import { useState, useEffect, useMemo } from "react";
import { X, Package, Plus, Minus, ShoppingBag } from "lucide-react";

const formatRupiah = (num) => "Rp " + Math.round(num).toLocaleString("id-ID");

export default function VariantModal({ product, onConfirm, onClose }) {
    const [selections, setSelections] = useState({});
    const [qty, setQty] = useState(1);
    const [errors, setErrors] = useState({});

    const groups = product?.variant_groups ?? [];

    useEffect(() => {
        const init = {};
        groups.forEach((group) => {
            init[group.id] = [];
        });
        setSelections(init);
        setErrors({});
        setQty(1);
    }, [product?.id, groups]);

    const priceModifier = useMemo(() => {
        let extra = 0;
        Object.values(selections).forEach((optIds) => {
            optIds.forEach((optId) => {
                groups.forEach((group) => {
                    const opt = group.options?.find((o) => o.id === optId);
                    if (opt) extra += Number(opt.price_modifier) || 0;
                });
            });
        });
        return extra;
    }, [selections, groups]);

    const basePrice = Number(product?.selling_price) || 0;
    const unitPrice = basePrice + priceModifier;
    const totalPrice = unitPrice * qty;

    const toggleOption = (group, optionId) => {
        setSelections((prev) => {
            const current = prev[group.id] ?? [];
            const isSelected = current.includes(optionId);

            if (group.max_select === 1) {
                return { ...prev, [group.id]: isSelected ? [] : [optionId] };
            }

            if (isSelected) {
                return {
                    ...prev,
                    [group.id]: current.filter((id) => id !== optionId),
                };
            }

            if (current.length >= group.max_select) {
                return prev;
            }

            return { ...prev, [group.id]: [...current, optionId] };
        });

        setErrors((prev) => ({ ...prev, [group.id]: null }));
    };

    const validate = () => {
        const newErrors = {};
        groups.forEach((group) => {
            const selected = selections[group.id] ?? [];
            if (selected.length < group.min_select) {
                newErrors[group.id] =
                    group.min_select === 1
                        ? `Pilih 1 opsi untuk ${group.name}`
                        : `Pilih minimal ${group.min_select} opsi untuk ${group.name}`;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleConfirm = () => {
        if (!validate()) return;

        const variantDetails = groups
            .filter((g) => (selections[g.id] ?? []).length > 0)
            .map((group) => ({
                group_id: group.id,
                group_name: group.name,
                options: (selections[group.id] ?? []).map((optId) => {
                    const opt = group.options?.find((o) => o.id === optId);
                    return {
                        option_id: opt?.id,
                        option_name: opt?.name,
                        price_modifier: Number(opt?.price_modifier) || 0,
                    };
                }),
            }));

        const variantLabel = variantDetails
            .flatMap((g) => g.options.map((o) => o.option_name))
            .join(", ");

        onConfirm({
            product_id: product.id,
            _cartKey: `${product.id}_${Date.now()}_${Math.random()}`,
            name: variantLabel
                ? `${product.name} (${variantLabel})`
                : product.name,
            base_unit_price: basePrice,
            unit_price: unitPrice,
            capital_price: Number(product.capital_price) || 0,
            qty,
            subtotal: unitPrice * qty,
            discount: 0,
            is_custom: false,
            image: product.image || null,
            variant_details: variantDetails.length > 0 ? variantDetails : null,
        });

        setQty(1);
    };

    if (!product || groups.length === 0) {
        return null;
    }

    return (
        // === PERUBAHAN DI SINI ===
        // Klik di backdrop akan menutup modal
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        {product.image ? (
                            <img
                                src={`/storage/${product.image}`}
                                alt={product.name}
                                className="w-10 h-10 rounded-xl object-cover shrink-0"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                <Package className="h-5 w-5 text-slate-300" />
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">
                                {product.name}
                            </p>
                            <p className="text-xs text-orange-500 font-semibold">
                                {formatRupiah(basePrice)}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 shrink-0"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Variant Options */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                    {groups.map((group) => {
                        const selected = selections[group.id] ?? [];
                        const isRequired = group.min_select > 0;
                        const isSingle = group.max_select === 1;

                        return (
                            <div key={group.id}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-slate-800">
                                            {group.name}
                                        </p>
                                        <span
                                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                                                isRequired
                                                    ? "bg-orange-100 text-orange-700"
                                                    : "bg-slate-100 text-slate-500"
                                            }`}
                                        >
                                            {isRequired ? "Wajib" : "Opsional"}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">
                                        {isSingle
                                            ? "Pilih 1"
                                            : `Pilih ${group.min_select}–${group.max_select}`}
                                    </span>
                                </div>

                                {errors[group.id] && (
                                    <p className="text-xs text-rose-500 mb-2">
                                        {errors[group.id]}
                                    </p>
                                )}

                                <div className="space-y-1.5">
                                    {group.options?.map((option) => {
                                        const isSelected = selected.includes(
                                            option.id,
                                        );
                                        const isDisabled =
                                            !isSelected &&
                                            selected.length >=
                                                group.max_select &&
                                            group.max_select > 1;

                                        return (
                                            <button
                                                key={option.id}
                                                onClick={() =>
                                                    !isDisabled &&
                                                    toggleOption(
                                                        group,
                                                        option.id,
                                                    )
                                                }
                                                disabled={isDisabled}
                                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-all ${
                                                    isSelected
                                                        ? "border-orange-400 bg-orange-50 text-orange-700"
                                                        : isDisabled
                                                          ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                                                          : "border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 text-slate-700 cursor-pointer"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {isRequired ? (
                                                        // Lingkaran (Radio) untuk REQUIRED
                                                        <span
                                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                                                isSelected
                                                                    ? "border-orange-500 bg-orange-500"
                                                                    : "border-slate-300"
                                                            }`}
                                                        >
                                                            {isSelected && (
                                                                <span className="w-2 h-2 rounded-full bg-white" />
                                                            )}
                                                        </span>
                                                    ) : (
                                                        // Kotak (Checkbox) untuk OPSIONAL
                                                        <span
                                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                                                                isSelected
                                                                    ? "border-orange-500 bg-orange-500 text-white"
                                                                    : "border-slate-300 bg-white"
                                                            }`}
                                                        >
                                                            {isSelected && (
                                                                <svg
                                                                    className="w-3 h-3"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="3"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M5 13l4 4L19 7"
                                                                    />
                                                                </svg>
                                                            )}
                                                        </span>
                                                    )}
                                                    <span className="font-medium">
                                                        {option.name}
                                                    </span>
                                                </div>
                                                {Number(
                                                    option.price_modifier,
                                                ) !== 0 && (
                                                    <span
                                                        className={`text-xs font-semibold ${
                                                            isSelected
                                                                ? "text-orange-600"
                                                                : "text-slate-500"
                                                        }`}
                                                    >
                                                        {Number(
                                                            option.price_modifier,
                                                        ) > 0
                                                            ? `+${formatRupiah(option.price_modifier)}`
                                                            : formatRupiah(
                                                                  option.price_modifier,
                                                              )}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer with quantity and confirm */}
                <div className="shrink-0 px-5 py-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-slate-50 rounded-full px-1 border border-slate-200">
                            <button
                                onClick={() =>
                                    setQty((q) => Math.max(1, q - 1))
                                }
                                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                            >
                                <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-sm font-bold w-8 text-center">
                                {qty}
                            </span>
                            <button
                                onClick={() => setQty((q) => q + 1)}
                                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors cursor-pointer"
                            >
                                <Plus className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        <div className="text-right">
                            {priceModifier !== 0 && (
                                <p className="text-xs text-slate-400">
                                    {formatRupiah(basePrice)} +{" "}
                                    {formatRupiah(priceModifier)}
                                </p>
                            )}
                            <p className="text-lg font-bold text-orange-500">
                                {formatRupiah(totalPrice)}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleConfirm}
                        className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-xl transition cursor-pointer shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                    >
                        <ShoppingBag className="h-4 w-4" />
                        Tambah ke Pesanan
                    </button>
                </div>
            </div>
        </div>
    );
}
