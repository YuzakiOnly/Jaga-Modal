import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Head, usePage } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import { toast, Toaster } from "sonner";
import { Package, Calculator } from "lucide-react";

import ProductGrid from "./_components/ProductGrid";
import Cart from "./_components/Cart";
import PaymentModal from "./_components/PaymentModal";
import SuccessOverlay from "./_components/SuccessOverlay";
import AddStockDialog from "./_components/AddStockDialog";
import SearchBar from "./_components/SearchBar";
import CategoryFilter from "./_components/CategoryFilter";
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
    const [mobileCartOpen, setMobileCartOpen] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    useSmartRefresh({ ...refreshConfigs.cashier_pos });

    // Reset discount saat cart kosong
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

    // Perhitungan dengan safety check
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

    const handleAddToCart = useCallback((product) => {
        setCart((prevCart) => {
            const existingIndex = prevCart.findIndex(
                (item) => item.product_id === product.id,
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
                    base_unit_price: basePrice,
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
                },
            ];
        });
    }, []);

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
                        : item.product_id;
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
                const key = item.is_custom ? item._customKey : item.product_id;
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
                const key = item.is_custom ? item._customKey : item.product_id;
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
                    ({ _customKey, base_unit_price, ...rest }) => ({
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
                    setLastTransactionData({
                        total: safeTotalAmount,
                        subtotal: safeSubtotalAmount,
                        discount: safeDiscountAmount,
                        amountPaid: safeAmountPaid,
                        change: Math.max(0, safeAmountPaid - safeTotalAmount),
                        paymentMethod: paymentMethod,
                        customer_name: customer?.customer_name,
                        customer_phone: customer?.customer_phone,
                        transaction_number: transactionData.transaction_number,
                        cashier_name: auth?.user?.name,
                        items: cart.map((item) => ({
                            name: item.name,
                            qty: item.qty,
                            unit_price: item.unit_price,
                            discount: item.discount || 0,
                            subtotal: item.subtotal,
                            is_custom: item.is_custom,
                        })),
                    });
                    setIsPaymentModalOpen(false);
                    setShowSuccessScreen(true);
                    setIsProcessingPayment(false);
                    setMobileCartOpen(false);
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
        setMobileCartOpen(false);
        setTimeout(() => {
            document.getElementById("search-input")?.focus();
        }, 100);
    }, []);

    const allCategoriesList = [{ id: null, name: "Semua" }, ...categories];
    const totalItems = cart.reduce((sum, item) => sum + (item.qty || 0), 0);

    return (
        <CashierLayout>
            <Head title="Kasir | JagaModal" />

            <div className="relative h-full bg-slate-50">
                {/* Mobile cart button */}
                <div className="lg:hidden fixed bottom-4 right-4 z-30">
                    <button
                        onClick={() => setMobileCartOpen(true)}
                        className="relative bg-emerald-600 text-white p-3 rounded-full shadow-lg hover:bg-emerald-500 transition-all active:scale-95"
                    >
                        <Package className="h-6 w-6" />
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {totalItems}
                            </span>
                        )}
                    </button>
                </div>

                {/* Mobile cart drawer */}
                <div
                    className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${mobileCartOpen ? "visible" : "invisible"}`}
                >
                    <div
                        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${mobileCartOpen ? "opacity-100" : "opacity-0"}`}
                        onClick={() => setMobileCartOpen(false)}
                    />
                    <div
                        className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl transition-transform duration-300 ease-out ${mobileCartOpen ? "translate-x-0" : "translate-x-full"}`}
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
                                setMobileCartOpen(false);
                                setIsPaymentModalOpen(true);
                            }}
                            onAddCustomItem={handleAddCustomItem}
                            onClose={() => setMobileCartOpen(false)}
                        />
                    </div>
                </div>

                {/* Sidebar kategori desktop */}
                <div className="hidden lg:block fixed top-14 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-20">
                    <CategoryFilter
                        categories={allCategoriesList}
                        activeCategory={activeCategory}
                        onSelectCategory={setActiveCategory}
                    />
                </div>

                {/* Main content */}
                <div className="h-full flex flex-col lg:pl-64 lg:pr-96">
                    {/* Top bar */}
                    <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shrink-0">
                        <div className="p-4">
                            <div className="flex gap-2 sm:gap-3">
                                <div className="flex-1">
                                    <SearchBar
                                        value={searchQuery}
                                        onChange={setSearchQuery}
                                    />
                                </div>
                                <FloatingCalculator
                                    customButton={
                                        <button className="shrink-0 flex items-center justify-center gap-1 px-2 sm:px-4 py-2 sm:py-2.5 bg-gray-50 hover:bg-emerald-50 border border-gray-200 rounded-xl transition-all duration-200 cursor-pointer">
                                            <Calculator className="h-4 w-4 text-gray-600" />
                                            <span className="text-xs sm:text-sm font-medium text-gray-700 hidden md:inline">
                                                Kalkulator
                                            </span>
                                        </button>
                                    }
                                />
                                <button
                                    onClick={() => setShowStockDialog(true)}
                                    className="shrink-0 flex items-center justify-center gap-1 px-2 sm:px-4 py-2 sm:py-2.5 bg-gray-50 hover:bg-emerald-50 border border-gray-200 rounded-xl transition-all duration-200 cursor-pointer"
                                >
                                    <Package className="h-4 w-4 text-gray-600" />
                                    <span className="text-xs sm:text-sm font-medium text-gray-700 hidden md:inline">
                                        Tambah Stok
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Category filter mobile */}
                    <div className="lg:hidden block bg-white border-b border-gray-100">
                        <CategoryFilter
                            categories={allCategoriesList}
                            activeCategory={activeCategory}
                            onSelectCategory={setActiveCategory}
                        />
                    </div>

                    {/* Product grid */}
                    <div className="flex-1 min-h-0 overflow-y-auto">
                        <ProductGrid
                            products={filteredProducts}
                            onAddToCart={handleAddToCart}
                            cartItems={cart}
                        />
                    </div>
                </div>

                {/* Cart desktop */}
                <div className="hidden lg:block fixed top-14 right-0 bottom-0 w-96 bg-white border-l border-gray-200 z-20">
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
                        onClose={() => setMobileCartOpen(false)}
                    />
                </div>
            </div>

            {/* Modals */}
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
