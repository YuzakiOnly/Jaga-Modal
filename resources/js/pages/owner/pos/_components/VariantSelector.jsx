// _components/VariantSelector.jsx
import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price);

export function VariantSelector({ open, onOpenChange, product, onConfirm }) {
    const [selectedOptions, setSelectedOptions] = useState({});
    const [selectedMultipleOptions, setSelectedMultipleOptions] = useState({});
    const [totalPrice, setTotalPrice] = useState(0);
    const [error, setError] = useState("");

    useEffect(() => {
        if (product) {
            const initial = {};
            const initialMultiple = {};
            product.variant_groups?.forEach((group) => {
                if (group.max_select === 1) {
                    if (group.min_select > 0 && group.options?.length > 0) {
                        initial[group.id] = group.options[0].id;
                    }
                } else if (group.max_select > 1) {
                    initialMultiple[group.id] = [];
                }
            });
            setSelectedOptions(initial);
            setSelectedMultipleOptions(initialMultiple);
            setError("");
        }
    }, [product]);

    useEffect(() => {
        if (product) {
            let basePrice = parseFloat(product.selling_price) || 0;
            let modifierTotal = 0;

            product.variant_groups?.forEach((group) => {
                if (group.max_select === 1) {
                    const optionId = selectedOptions[group.id];
                    const option = group.options?.find(
                        (o) => o.id === optionId,
                    );
                    if (option) {
                        modifierTotal += parseFloat(option.price_modifier) || 0;
                    }
                } else if (group.max_select > 1) {
                    const selectedIds = selectedMultipleOptions[group.id] || [];
                    group.options?.forEach((option) => {
                        if (selectedIds.includes(option.id)) {
                            modifierTotal +=
                                parseFloat(option.price_modifier) || 0;
                        }
                    });
                }
            });

            setTotalPrice(basePrice + modifierTotal);
        }
    }, [selectedOptions, selectedMultipleOptions, product]);

    const handleOptionSelect = (groupId, optionId) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [groupId]: optionId,
        }));
        setError("");
    };

    const handleOptionToggle = (groupId, optionId) => {
        const group = product?.variant_groups?.find((g) => g.id === groupId);
        const current = selectedOptions[groupId];

        if (current === optionId) {
            if (group && group.min_select > 0) {
                setError(`Pilih ${group.name} terlebih dahulu`);
                return;
            }
            setSelectedOptions((prev) => {
                const newState = { ...prev };
                delete newState[groupId];
                return newState;
            });
        } else {
            setSelectedOptions((prev) => ({
                ...prev,
                [groupId]: optionId,
            }));
        }
        setError("");
    };

    const handleMultipleOptionToggle = (groupId, optionId) => {
        setSelectedMultipleOptions((prev) => {
            const current = prev[groupId] || [];
            const exists = current.includes(optionId);
            const group = product?.variant_groups?.find(
                (g) => g.id === groupId,
            );
            let newSelection;

            if (exists) {
                if (
                    group &&
                    group.min_select > 0 &&
                    current.length <= group.min_select
                ) {
                    setError(
                        `Minimal pilih ${group.min_select} opsi untuk ${group.name}`,
                    );
                    return prev;
                }
                newSelection = current.filter((id) => id !== optionId);
            } else {
                if (
                    group &&
                    group.max_select &&
                    current.length >= group.max_select
                ) {
                    setError(
                        `Maksimal pilih ${group.max_select} opsi untuk ${group.name}`,
                    );
                    return prev;
                }
                newSelection = [...current, optionId];
            }

            setError("");
            return {
                ...prev,
                [groupId]: newSelection,
            };
        });
    };

    const getSelectedCount = (groupId) => {
        return (selectedMultipleOptions[groupId] || []).length;
    };

    const getGroupLabel = (group) => {
        if (group.max_select === 1) {
            return group.min_select > 0 ? "Wajib" : "Opsional";
        }
        if (group.max_select > 1) {
            const selected = getSelectedCount(group.id);
            if (group.min_select > 0 && group.max_select > 1) {
                return `Pilih ${group.min_select} - ${group.max_select}`;
            }
            if (group.min_select === 0 && group.max_select > 1) {
                return `Max ${group.max_select}`;
            }
            return `Pilih ${group.min_select} - ${group.max_select}`;
        }
        return "";
    };

    const handleConfirm = () => {
        if (!product) return;

        const groups = product.variant_groups || [];

        for (const group of groups) {
            if (group.max_select === 1) {
                const selected = selectedOptions[group.id];
                if (!selected && group.min_select > 0) {
                    setError(`Pilih ${group.name} terlebih dahulu`);
                    return;
                }
            } else if (group.max_select > 1) {
                const selected = selectedMultipleOptions[group.id] || [];
                if (selected.length < group.min_select) {
                    setError(
                        `Pilih minimal ${group.min_select} opsi untuk ${group.name}`,
                    );
                    return;
                }
            }
        }

        const selectedDetails = {};
        let modifierTotal = 0;
        let optionNames = [];

        groups.forEach((group) => {
            if (group.max_select === 1) {
                const optionId = selectedOptions[group.id];
                const option = group.options?.find((o) => o.id === optionId);
                if (option) {
                    selectedDetails[group.id] = [option];
                    modifierTotal += parseFloat(option.price_modifier) || 0;
                    optionNames.push(option.name);
                }
            } else if (group.max_select > 1) {
                const selectedIds = selectedMultipleOptions[group.id] || [];
                const options =
                    group.options?.filter((o) => selectedIds.includes(o.id)) ||
                    [];
                if (options.length > 0) {
                    selectedDetails[group.id] = options;
                    options.forEach((option) => {
                        modifierTotal += parseFloat(option.price_modifier) || 0;
                        optionNames.push(option.name);
                    });
                }
            }
        });

        const basePrice = parseFloat(product.selling_price) || 0;
        const finalPrice = basePrice + modifierTotal;

        onConfirm({
            ...product,
            selectedOptions: selectedDetails,
            selectedOptionNames: optionNames,
            finalPrice: finalPrice,
            basePrice: basePrice,
            modifierTotal: modifierTotal,
        });
        onOpenChange(false);
    };

    if (!product) return null;

    const groups = product.variant_groups || [];
    const hasVariants = groups.length > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100vw-1rem)] max-w-md rounded-xl sm:rounded-lg max-h-[90dvh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg">
                        {product.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">
                        Pilih varian untuk produk ini
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="rounded-lg bg-muted/50 px-4 py-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                Harga Dasar
                            </span>
                            <span className="font-medium">
                                {formatPrice(product.selling_price)}
                            </span>
                        </div>
                        {hasVariants &&
                            totalPrice !==
                                parseFloat(product.selling_price) && (
                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-muted-foreground">
                                        Modifier
                                    </span>
                                    <span className="font-medium text-emerald-600">
                                        +{" "}
                                        {formatPrice(
                                            totalPrice -
                                                parseFloat(
                                                    product.selling_price,
                                                ),
                                        )}
                                    </span>
                                </div>
                            )}
                        <div className="flex justify-between text-base font-bold mt-2 pt-2 border-t">
                            <span>Total</span>
                            <span className="text-primary">
                                {formatPrice(totalPrice)}
                            </span>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    {groups.map((group) => {
                        const isRequired = group.min_select > 0;
                        const isSingleSelect = group.max_select === 1;
                        const isMultiSelect = group.max_select > 1;

                        return (
                            <div key={group.id} className="space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Label className="text-sm font-medium">
                                        {group.name}
                                    </Label>
                                    {isRequired && isSingleSelect && (
                                        <Badge
                                            variant="destructive"
                                            className="text-[10px] px-1.5 py-0"
                                        >
                                            Wajib
                                        </Badge>
                                    )}
                                    {!isRequired && isSingleSelect && (
                                        <Badge
                                            variant="outline"
                                            className="text-[10px] px-1.5 py-0"
                                        >
                                            Opsional
                                        </Badge>
                                    )}
                                    {isMultiSelect && (
                                        <Badge
                                            variant="outline"
                                            className="text-[10px] px-1.5 py-0"
                                        >
                                            {getGroupLabel(group)}
                                        </Badge>
                                    )}
                                </div>

                                {isSingleSelect && isRequired && (
                                    <RadioGroup
                                        value={selectedOptions[
                                            group.id
                                        ]?.toString()}
                                        onValueChange={(value) =>
                                            handleOptionSelect(
                                                group.id,
                                                parseInt(value),
                                            )
                                        }
                                        className="flex flex-col gap-1.5"
                                    >
                                        <ScrollArea className="max-h-48">
                                            <div className="space-y-1.5 pr-2">
                                                {group.options?.map(
                                                    (option) => {
                                                        const isSelected =
                                                            selectedOptions[
                                                                group.id
                                                            ] === option.id;
                                                        return (
                                                            <div
                                                                key={option.id}
                                                            >
                                                                <RadioGroupItem
                                                                    value={option.id.toString()}
                                                                    id={`option-${option.id}`}
                                                                    className="peer sr-only"
                                                                />
                                                                <Label
                                                                    htmlFor={`option-${option.id}`}
                                                                    className={`flex items-center justify-between rounded-lg border-2 p-3 transition-all cursor-pointer ${
                                                                        isSelected
                                                                            ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2"
                                                                            : "border-muted bg-card hover:bg-accent hover:border-muted-foreground/30"
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div
                                                                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                                                                isSelected
                                                                                    ? "border-primary bg-primary"
                                                                                    : "border-muted-foreground/30"
                                                                            }`}
                                                                        >
                                                                            {isSelected && (
                                                                                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                                                            )}
                                                                        </div>
                                                                        <span className="text-sm font-medium">
                                                                            {
                                                                                option.name
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    {parseFloat(
                                                                        option.price_modifier,
                                                                    ) !== 0 && (
                                                                        <span
                                                                            className={`text-xs font-medium ${
                                                                                parseFloat(
                                                                                    option.price_modifier,
                                                                                ) >
                                                                                0
                                                                                    ? "text-emerald-600"
                                                                                    : "text-destructive"
                                                                            }`}
                                                                        >
                                                                            {parseFloat(
                                                                                option.price_modifier,
                                                                            ) >
                                                                            0
                                                                                ? "+"
                                                                                : ""}
                                                                            {formatPrice(
                                                                                option.price_modifier,
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                </Label>
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </RadioGroup>
                                )}

                                {isSingleSelect && !isRequired && (
                                    <div className="flex flex-col gap-1.5">
                                        <ScrollArea className="max-h-48">
                                            <div className="space-y-1.5 pr-2">
                                                {group.options?.map(
                                                    (option) => {
                                                        const isSelected =
                                                            selectedOptions[
                                                                group.id
                                                            ] === option.id;
                                                        return (
                                                            <div
                                                                key={option.id}
                                                            >
                                                                <Checkbox
                                                                    id={`option-check-${option.id}`}
                                                                    checked={
                                                                        isSelected
                                                                    }
                                                                    onCheckedChange={() =>
                                                                        handleOptionToggle(
                                                                            group.id,
                                                                            option.id,
                                                                        )
                                                                    }
                                                                    className="peer sr-only"
                                                                />
                                                                <Label
                                                                    htmlFor={`option-check-${option.id}`}
                                                                    className={`flex items-center justify-between rounded-lg border-2 p-3 transition-all cursor-pointer ${
                                                                        isSelected
                                                                            ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2"
                                                                            : "border-muted bg-card hover:bg-accent hover:border-muted-foreground/30"
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div
                                                                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                                                                isSelected
                                                                                    ? "border-primary bg-primary text-white"
                                                                                    : "border-muted-foreground/30"
                                                                            }`}
                                                                        >
                                                                            {isSelected && (
                                                                                <svg
                                                                                    className="h-3 w-3"
                                                                                    fill="none"
                                                                                    viewBox="0 0 24 24"
                                                                                    stroke="currentColor"
                                                                                    strokeWidth={
                                                                                        3
                                                                                    }
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        d="M5 13l4 4L19 7"
                                                                                    />
                                                                                </svg>
                                                                            )}
                                                                        </div>
                                                                        <span className="text-sm font-medium">
                                                                            {
                                                                                option.name
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    {parseFloat(
                                                                        option.price_modifier,
                                                                    ) !== 0 && (
                                                                        <span
                                                                            className={`text-xs font-medium ${
                                                                                parseFloat(
                                                                                    option.price_modifier,
                                                                                ) >
                                                                                0
                                                                                    ? "text-emerald-600"
                                                                                    : "text-destructive"
                                                                            }`}
                                                                        >
                                                                            {parseFloat(
                                                                                option.price_modifier,
                                                                            ) >
                                                                            0
                                                                                ? "+"
                                                                                : ""}
                                                                            {formatPrice(
                                                                                option.price_modifier,
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                </Label>
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                )}

                                {isMultiSelect && (
                                    <div className="flex flex-col gap-1.5">
                                        <ScrollArea className="max-h-48">
                                            <div className="space-y-1.5 pr-2">
                                                {group.options?.map(
                                                    (option) => {
                                                        const isChecked = (
                                                            selectedMultipleOptions[
                                                                group.id
                                                            ] || []
                                                        ).includes(option.id);
                                                        return (
                                                            <div
                                                                key={option.id}
                                                            >
                                                                <Checkbox
                                                                    id={`multi-option-${option.id}`}
                                                                    checked={
                                                                        isChecked
                                                                    }
                                                                    onCheckedChange={() =>
                                                                        handleMultipleOptionToggle(
                                                                            group.id,
                                                                            option.id,
                                                                        )
                                                                    }
                                                                    className="peer sr-only"
                                                                />
                                                                <Label
                                                                    htmlFor={`multi-option-${option.id}`}
                                                                    className={`flex items-center justify-between rounded-lg border-2 p-3 transition-all cursor-pointer ${
                                                                        isChecked
                                                                            ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2"
                                                                            : "border-muted bg-card hover:bg-accent hover:border-muted-foreground/30"
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div
                                                                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                                                                isChecked
                                                                                    ? "border-primary bg-primary text-white"
                                                                                    : "border-muted-foreground/30"
                                                                            }`}
                                                                        >
                                                                            {isChecked && (
                                                                                <svg
                                                                                    className="h-3 w-3"
                                                                                    fill="none"
                                                                                    viewBox="0 0 24 24"
                                                                                    stroke="currentColor"
                                                                                    strokeWidth={
                                                                                        3
                                                                                    }
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        d="M5 13l4 4L19 7"
                                                                                    />
                                                                                </svg>
                                                                            )}
                                                                        </div>
                                                                        <span className="text-sm font-medium">
                                                                            {
                                                                                option.name
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    {parseFloat(
                                                                        option.price_modifier,
                                                                    ) !== 0 && (
                                                                        <span
                                                                            className={`text-xs font-medium ${
                                                                                parseFloat(
                                                                                    option.price_modifier,
                                                                                ) >
                                                                                0
                                                                                    ? "text-emerald-600"
                                                                                    : "text-destructive"
                                                                            }`}
                                                                        >
                                                                            {parseFloat(
                                                                                option.price_modifier,
                                                                            ) >
                                                                            0
                                                                                ? "+"
                                                                                : ""}
                                                                            {formatPrice(
                                                                                option.price_modifier,
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                </Label>
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {!hasVariants && (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                            Tidak ada varian untuk produk ini
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setError("");
                            onOpenChange(false);
                        }}
                        className="w-full sm:w-auto"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className="w-full sm:w-auto"
                    >
                        Tambahkan ke Keranjang
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
