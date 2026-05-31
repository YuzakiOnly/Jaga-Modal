import { useState, useMemo, useEffect, useCallback } from "react";
import { Head, usePage } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import { toast, Toaster } from "sonner";
import { Package } from "lucide-react";

import ProductGrid from "./_components/ProductGrid";
import Cart from "./_components/Cart";
import PaymentModal from "./_components/PaymentModal";
import SuccessOverlay from "./_components/SuccessOverlay";
import AddStockDialog from "./_components/AddStockDialog";
import SearchBar from "./_components/SearchBar";
import CategoryFilter from "./_components/CategoryFilter";
import CashierLayout from "@/layouts/CashierLayout";

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
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

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

    const subtotalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const totalAmount = Math.max(0, subtotalAmount - discountAmount);

    const handleAddToCart = useCallback((product) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find(
                (item) => item.product_id === product.id,
            );

            if (existingItem) {
                if (
                    product.stock_type === "limited" &&
                    existingItem.qty >= product.stock
                ) {
                    toast.warning(
                        `Stok ${product.name} hanya tersisa ${product.stock}`,
                    );
                    return prevCart;
                }

                return prevCart.map((item) =>
                    item.product_id === product.id
                        ? {
                              ...item,
                              qty: item.qty + 1,
                              subtotal: (item.qty + 1) * item.unit_price,
                          }
                        : item,
                );
            }

            return [
                ...prevCart,
                {
                    product_id: product.id,
                    name: product.name,
                    unit_price: Number(product.selling_price),
                    capital_price: Number(product.capital_price),
                    qty: 1,
                    subtotal: Number(product.selling_price),
                    discount: 0,
                    is_custom: false,
                },
            ];
        });
    }, []);

    const handleAddCustomItem = useCallback((item) => {
        setCart((prev) => [...prev, item]);
    }, []);

    const handleUpdateQuantity = useCallback((itemKey, delta) => {
        setCart((prev) => {
            return prev
                .map((item) => {
                    const key = item.is_custom
                        ? item._customKey
                        : item.product_id;
                    if (key !== itemKey) return item;

                    const newQuantity = item.qty + delta;
                    if (newQuantity <= 0) return null;

                    return {
                        ...item,
                        qty: newQuantity,
                        subtotal: newQuantity * item.unit_price,
                    };
                })
                .filter(Boolean);
        });
    }, []);

    const handleRemoveItem = useCallback((itemKey) => {
        setCart((prev) =>
            prev.filter((item) => {
                const key = item.is_custom ? item._customKey : item.product_id;
                return key !== itemKey;
            }),
        );
    }, []);

    const handleProcessPayment = useCallback(
        (amountPaid, transactedAt = null) => {
            setIsProcessingPayment(true);

            const payload = {
                payment_method: paymentMethod,
                amount_paid: amountPaid,
                change_amount: Math.max(0, amountPaid - totalAmount),
                subtotal: subtotalAmount,
                discount: discountAmount,
                total: totalAmount,
                notes: null,
                transacted_at: transactedAt,
                items: cart.map(({ _customKey, ...rest }) => rest),
            };

            router.post(route("cashier.transactions.store"), payload, {
                onSuccess: () => {
                    setLastTransactionData({
                        total: totalAmount,
                        amountPaid: amountPaid,
                        change: Math.max(0, amountPaid - totalAmount),
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
        [cart, paymentMethod, subtotalAmount, discountAmount, totalAmount],
    );

    const handleResetTransaction = useCallback(() => {
        setCart([]);
        setDiscountAmount(0);
        setPaymentMethod("cash");
        setShowSuccessScreen(false);
        setLastTransactionData(null);
        setMobileCartOpen(false);
        document.getElementById("search-input")?.focus();
    }, []);

    const allCategoriesList = [{ id: null, name: "Semua" }, ...categories];
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

    return (
        <CashierLayout>
            <Head title="Kasir | JagaModal" />

            <div className="relative h-full bg-slate-50">
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
                            paymentMethod={paymentMethod}
                            onDiscountChange={setDiscountAmount}
                            onPaymentMethodChange={setPaymentMethod}
                            onUpdateQuantity={handleUpdateQuantity}
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

                <div className="h-full overflow-y-auto lg:pr-96">
                    <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
                        <div className="p-4">
                            <div className="flex gap-2 sm:gap-3">
                                <div className="flex-1">
                                    <SearchBar
                                        value={searchQuery}
                                        onChange={setSearchQuery}
                                    />
                                </div>

                                <button
                                    onClick={() => setShowStockDialog(true)}
                                    className="shrink-0 flex items-center justify-center gap-1 px-2 sm:px-4 py-2 sm:py-2.5 bg-gray-50 hover:bg-emerald-50 border border-gray-200 rounded-xl transition-all duration-200 cursor-pointer"
                                >
                                    <Package className="h-4 w-4 text-gray-600" />
                                    <span className="text-xs sm:text-sm font-medium text-gray-700 hidden xs:inline">
                                        Tambah Stok
                                    </span>
                                </button>
                            </div>
                        </div>

                        <CategoryFilter
                            categories={allCategoriesList}
                            activeCategory={activeCategory}
                            onSelectCategory={setActiveCategory}
                        />
                    </div>

                    <ProductGrid
                        products={filteredProducts}
                        onAddToCart={handleAddToCart}
                        cartItems={cart}
                    />
                </div>

                <div className="hidden lg:block fixed top-0 right-0 h-full w-96 bg-white border-l border-gray-200 z-20">
                    <Cart
                        items={cart}
                        subtotal={subtotalAmount}
                        total={totalAmount}
                        discount={discountAmount}
                        paymentMethod={paymentMethod}
                        onDiscountChange={setDiscountAmount}
                        onPaymentMethodChange={setPaymentMethod}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemoveItem={handleRemoveItem}
                        onCheckout={() => setIsPaymentModalOpen(true)}
                        onAddCustomItem={handleAddCustomItem}
                    />
                </div>
            </div>

            {isPaymentModalOpen && (
                <PaymentModal
                    subtotal={subtotalAmount}
                    discount={discountAmount}
                    total={totalAmount}
                    paymentMethod={paymentMethod}
                    isProcessing={isProcessingPayment}
                    onConfirm={handleProcessPayment}
                    onClose={() => setIsPaymentModalOpen(false)}
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
