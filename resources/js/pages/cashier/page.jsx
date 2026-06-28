// resources/js/pages/cashier/page.jsx
import { useState, useMemo, useEffect, useCallback } from "react";
import { Head, usePage } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import { toast, Toaster } from "sonner";
import { Package, Calculator, ShoppingBag } from "lucide-react";

import ProductGrid from "./_components/ProductGrid";
import Cart from "./_components/Cart";
import PaymentModal from "./_components/PaymentModal";
import SuccessOverlay from "./_components/SuccessOverlay";
import AddStockDialog from "./_components/AddStockDialog";
import SearchBar from "./_components/SearchBar";
import CategoryFilter from "./_components/CategoryFilter";
import VariantModal from "./_components/VariantModal";
import CashierLayout from "@/layouts/CashierLayout";
import { FloatingCalculator } from "@/components/shared/FloatingCalculator";

import { useSmartRefresh } from "@/hooks/useSmartRefresh";
import { refreshConfigs } from "@/hooks/refreshConfig";

const formatNumber = (num) => {
    return new Intl.NumberFormat("id-ID").format(Math.round(num || 0));
};

const formatRupiah = (num) => `Rp ${formatNumber(num)}`;

export default function CashierPage({ products, categories }) {
    const { flash, auth } = usePage().props;

    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [showSuccessScreen, setShowSuccessScreen] = useState(false);
    const [lastTransactionData, setLastTransactionData] = useState(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [showStockDialog, setShowStockDialog] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [variantProduct, setVariantProduct] = useState(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    useSmartRefresh({ ...refreshConfigs.cashier_pos });

    useEffect(() => {
        if (cart.length === 0) {
            setDiscountAmount(0);
        }
    }, [cart]);

    const filteredProducts = useMemo(() => {
        let result = [...products];
        result = result.filter((p) => p.is_active === true);
        if (activeCategory) {
            result = result.filter((p) => p.category_id === activeCategory);
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter(
                (p) =>
                    p.name.toLowerCase().includes(query) ||
                    (p.sku && p.sku.toLowerCase().includes(query)) ||
                    (p.barcode && p.barcode.toLowerCase().includes(query)),
            );
        }
        return result;
    }, [products, activeCategory, searchQuery]);

    const subtotalAmount = useMemo(() => {
        if (!cart || cart.length === 0) return 0;
        return cart.reduce((sum, item) => {
            const subtotal = item?.subtotal;
            if (typeof subtotal !== "number" || isNaN(subtotal)) return sum;
            return sum + subtotal;
        }, 0);
    }, [cart]);

    const totalAmount = useMemo(() => {
        const safeSubtotal = subtotalAmount || 0;
        const safeDiscount =
            typeof discountAmount === "number" && !isNaN(discountAmount)
                ? discountAmount
                : 0;
        return Math.max(0, safeSubtotal - safeDiscount);
    }, [subtotalAmount, discountAmount]);

    // Handle Add to Cart - detect variants
    const handleAddToCart = useCallback((product) => {
        const hasVariants =
            product.variant_groups && product.variant_groups.length > 0;

        if (hasVariants) {
            setVariantProduct(product);
            return;
        }

        // Product without variants - add directly
        setCart((prevCart) => {
            const existingIndex = prevCart.findIndex(
                (item) =>
                    !item.is_custom &&
                    item.product_id === product.id &&
                    !item.variant_details,
            );

            const basePrice = Number(product.selling_price) || 0;

            if (existingIndex !== -1) {
                const existingItem = prevCart[existingIndex];
                if (
                    product.stock_type === "limited" &&
                    existingItem.qty >= product.stock
                ) {
                    toast.warning(
                        `Stok ${product.name} hanya tersisa ${product.stock}`,
                    );
                    return prevCart;
                }

                const newCart = [...prevCart];
                const newQty = existingItem.qty + 1;
                const existingDiscount = existingItem.discount || 0;
                newCart[existingIndex] = {
                    ...existingItem,
                    qty: newQty,
                    unit_price: basePrice,
                    subtotal: newQty * (basePrice - existingDiscount),
                };
                return newCart;
            }

            return [
                ...prevCart,
                {
                    product_id: product.id,
                    name: product.name,
                    base_unit_price: basePrice,
                    unit_price: basePrice,
                    capital_price: Number(product.capital_price) || 0,
                    qty: 1,
                    subtotal: basePrice,
                    discount: 0,
                    is_custom: false,
                    image: product.image || null,
                    variant_details: null,
                },
            ];
        });
    }, []);

    // Handle variant product added to cart
    const handleAddVariantToCart = useCallback(
        (item) => {
            // Check stock for limited products
            const product = products.find((p) => p.id === item.product_id);
            if (product && product.stock_type === "limited") {
                const existingVariantInCart = cart.find(
                    (cartItem) =>
                        cartItem.product_id === item.product_id &&
                        JSON.stringify(cartItem.variant_details) ===
                            JSON.stringify(item.variant_details),
                );
                const currentQty = existingVariantInCart
                    ? existingVariantInCart.qty
                    : 0;
                if (currentQty + item.qty > product.stock) {
                    toast.warning(
                        `Stok ${product.name} hanya tersisa ${product.stock}`,
                    );
                    return;
                }
            }

            setCart((prev) => [...prev, item]);
            setVariantProduct(null);
            toast.success("Item ditambahkan ke pesanan");
        },
        [cart, products],
    );

    const handleAddCustomItem = useCallback((item) => {
        setCart((prev) => [
            ...prev,
            {
                ...item,
                image: null,
                subtotal: (item.unit_price || 0) * (item.qty || 1),
            },
        ]);
    }, []);

    const handleUpdateQuantity = useCallback((itemKey, delta) => {
        setCart((prev) => {
            const newCart = prev
                .map((item) => {
                    const key = item.is_custom
                        ? item._customKey
                        : item._cartKey || item.product_id;
                    if (key !== itemKey) return item;
                    const newQuantity = (item.qty || 0) + delta;
                    if (newQuantity <= 0) return null;
                    const unitPrice = item.unit_price || 0;
                    const discount = item.discount || 0;
                    return {
                        ...item,
                        qty: newQuantity,
                        subtotal: newQuantity * (unitPrice - discount),
                    };
                })
                .filter(Boolean);
            return newCart;
        });
    }, []);

    const handleUpdateDiscount = useCallback((itemKey, discount) => {
        setCart((prev) =>
            prev.map((item) => {
                const key = item.is_custom
                    ? item._customKey
                    : item._cartKey || item.product_id;
                if (key !== itemKey) return item;
                const unitPrice = item.unit_price || 0;
                const newDiscount = Math.min(discount || 0, unitPrice);
                const newSubtotal = (unitPrice - newDiscount) * (item.qty || 0);
                return {
                    ...item,
                    discount: newDiscount,
                    subtotal: newSubtotal,
                };
            }),
        );
    }, []);

    const handleRemoveItem = useCallback((itemKey) => {
        setCart((prev) => {
            const newCart = prev.filter((item) => {
                const key = item.is_custom
                    ? item._customKey
                    : item._cartKey || item.product_id;
                return key !== itemKey;
            });
            return newCart;
        });
    }, []);

    const handleProcessPayment = useCallback(
        (amountPaid, transactedAt = null, customer = null) => {
            setIsProcessingPayment(true);

            const safeTotalAmount = totalAmount || 0;
            const safeSubtotalAmount = subtotalAmount || 0;
            const safeDiscountAmount = discountAmount || 0;
            const safeAmountPaid = amountPaid || 0;

            const payload = {
                payment_method: paymentMethod,
                amount_paid: safeAmountPaid,
                change_amount: Math.max(0, safeAmountPaid - safeTotalAmount),
                subtotal: safeSubtotalAmount,
                discount: safeDiscountAmount,
                total: safeTotalAmount,
                notes: null,
                transacted_at: transactedAt,
                customer_name: customer?.customer_name ?? null,
                customer_phone: customer?.customer_phone ?? null,
                items: (cart || []).map(
                    ({ _customKey, _cartKey, base_unit_price, ...rest }) => ({
                        ...rest,
                        unit_price: rest.unit_price || 0,
                        discount: rest.discount || 0,
                    }),
                ),
            };

            router.post(route("cashier.transactions.store"), payload, {
                onSuccess: (response) => {
                    const transactionData =
                        response.props?.flash?.transaction || {};

                    // Dapatkan customer_number dari response
                    const customerNumber =
                        transactionData.customer_number || null;

                    setLastTransactionData({
                        total: safeTotalAmount,
                        subtotal: safeSubtotalAmount,
                        discount: safeDiscountAmount,
                        amountPaid: safeAmountPaid,
                        change: Math.max(0, safeAmountPaid - safeTotalAmount),
                        paymentMethod: paymentMethod,
                        customer_name:
                            customer?.customer_name ||
                            transactionData.customer_name,
                        customer_phone:
                            customer?.customer_phone ||
                            transactionData.customer_phone,
                        customer_number: customerNumber, // Tambahkan ini
                        transaction_number: transactionData.transaction_number,
                        cashier_name: auth?.user?.name,
                        items: cart.map((item) => ({
                            name: item.name,
                            qty: item.qty,
                            unit_price: item.unit_price,
                            discount: item.discount || 0,
                            subtotal: item.subtotal,
                            is_custom: item.is_custom,
                            variant_details: item.variant_details,
                        })),
                    });
                    setIsPaymentModalOpen(false);
                    setShowSuccessScreen(true);
                    setIsProcessingPayment(false);
                    setCartOpen(false);
                },
                onError: (errors) => {
                    console.error("Payment error:", errors);
                    setIsProcessingPayment(false);
                    toast.error("Gagal memproses pembayaran");
                },
            });
        },
        [
            cart,
            subtotalAmount,
            discountAmount,
            totalAmount,
            paymentMethod,
            auth,
        ],
    );

    const handleResetTransaction = useCallback(() => {
        setCart([]);
        setDiscountAmount(0);
        setPaymentMethod("cash");
        setShowSuccessScreen(false);
        setLastTransactionData(null);
        setCartOpen(false);
        setTimeout(() => {
            document.getElementById("search-input")?.focus();
        }, 100);
    }, []);

    const allCategoriesList = [{ id: null, name: "Semua" }, ...categories];
    const totalItems = cart.reduce((sum, item) => sum + (item.qty || 0), 0);

    return (
        <CashierLayout>
            <Head title="Kasir | JagaModal" />

            <div className="h-full flex bg-white">
                <div className="flex-1 flex flex-col min-w-0 lg:pr-[380px]">
                    <div className="shrink-0 px-5 lg:px-8 pt-5 lg:pt-7 pb-3">
                        <div className="flex items-center justify-between mb-5">
                            <h1 className="text-xl lg:text-2xl font-bold text-slate-800">
                                Daftar Produk
                            </h1>
                        </div>

                        <div className="flex items-center justify-between gap-3 mb-6">
                            <h2 className="text-base font-bold text-slate-800 shrink-0">
                                Menu
                            </h2>
                            <div className="flex items-center gap-2">
                                <SearchBar
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                />
                                <FloatingCalculator
                                    customButton={
                                        <button className="shrink-0 flex items-center justify-center w-10 h-10 bg-slate-50 hover:bg-orange-50 border border-slate-200 rounded-full transition-all duration-200 cursor-pointer">
                                            <Calculator className="h-4 w-4 text-slate-500" />
                                        </button>
                                    }
                                />
                                <button
                                    onClick={() => setShowStockDialog(true)}
                                    className="shrink-0 flex items-center justify-center w-10 h-10 bg-slate-50 hover:bg-orange-50 border border-slate-200 rounded-full transition-all duration-200 cursor-pointer"
                                    title="Tambah Stok"
                                >
                                    <Package className="h-4 w-4 text-slate-500" />
                                </button>
                            </div>
                        </div>

                        <div className="pb-px overflow-visible">
                            <CategoryFilter
                                categories={allCategoriesList}
                                activeCategory={activeCategory}
                                onSelectCategory={setActiveCategory}
                            />
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 mx-5 lg:mx-8 shrink-0" />

                    <div className="flex-1 min-h-0 overflow-y-auto px-5 lg:px-8 pt-6 pb-24 lg:pb-8">
                        <ProductGrid
                            products={filteredProducts}
                            onAddToCart={handleAddToCart}
                            cartItems={cart}
                        />
                    </div>
                </div>

                <div className="hidden lg:block fixed top-0 right-0 bottom-0 w-[380px] bg-white border-l border-slate-100">
                    <Cart
                        items={cart}
                        subtotal={subtotalAmount}
                        total={totalAmount}
                        discount={discountAmount}
                        onDiscountChange={setDiscountAmount}
                        onUpdateQuantity={handleUpdateQuantity}
                        onUpdateDiscount={handleUpdateDiscount}
                        onRemoveItem={handleRemoveItem}
                        onCheckout={() => setIsPaymentModalOpen(true)}
                        onAddCustomItem={handleAddCustomItem}
                        cashierName={auth?.user?.name}
                    />
                </div>

                <div className="lg:hidden fixed bottom-4 right-4 z-30">
                    <button
                        onClick={() => setCartOpen(true)}
                        className="relative bg-orange-500 text-white p-3.5 rounded-full shadow-lg hover:bg-orange-400 transition-all active:scale-95"
                    >
                        <ShoppingBag className="h-6 w-6" />
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 bg-white text-orange-500 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {totalItems}
                            </span>
                        )}
                    </button>
                </div>

                <div
                    className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${
                        cartOpen ? "visible" : "invisible"
                    }`}
                >
                    <div
                        className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-300 ${
                            cartOpen ? "opacity-100" : "opacity-0"
                        }`}
                        onClick={() => setCartOpen(false)}
                    />
                    <div
                        className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ease-out ${
                            cartOpen ? "translate-x-0" : "translate-x-full"
                        }`}
                    >
                        <Cart
                            items={cart}
                            subtotal={subtotalAmount}
                            total={totalAmount}
                            discount={discountAmount}
                            onDiscountChange={setDiscountAmount}
                            onUpdateQuantity={handleUpdateQuantity}
                            onUpdateDiscount={handleUpdateDiscount}
                            onRemoveItem={handleRemoveItem}
                            onCheckout={() => {
                                setCartOpen(false);
                                setIsPaymentModalOpen(true);
                            }}
                            onAddCustomItem={handleAddCustomItem}
                            onClose={() => setCartOpen(false)}
                            cashierName={auth?.user?.name}
                        />
                    </div>
                </div>
            </div>

            {/* Variant Modal */}
            {variantProduct && (
                <VariantModal
                    product={variantProduct}
                    onConfirm={handleAddVariantToCart}
                    onClose={() => setVariantProduct(null)}
                />
            )}

            {isPaymentModalOpen && (
                <PaymentModal
                    subtotal={subtotalAmount}
                    discount={discountAmount}
                    total={totalAmount}
                    paymentMethod={paymentMethod}
                    isProcessing={isProcessingPayment}
                    onConfirm={handleProcessPayment}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onPaymentMethodChange={setPaymentMethod}
                />
            )}

            {showSuccessScreen && lastTransactionData && (
                <SuccessOverlay
                    transaction={lastTransactionData}
                    onNewTransaction={handleResetTransaction}
                />
            )}

            {showStockDialog && (
                <AddStockDialog
                    isOpen={showStockDialog}
                    onClose={() => setShowStockDialog(false)}
                    products={products}
                />
            )}

            <Toaster position="top-right" richColors closeButton />
        </CashierLayout>
    );
}
