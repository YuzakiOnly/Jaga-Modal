// pages/owner/pos/page.jsx
import { useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { toast, Toaster } from "sonner";
import { ShoppingCart } from "lucide-react";
import AppLayout from "@/layouts/dashboard/AppLayout";

import { ProductGrid } from "./_components/ProductGrid";
import { Cart } from "./_components/Cart";
import { PaymentDialog } from "./_components/PaymentDialog";
import { Badge } from "@/components/ui/badge";

export default function PosPage({ products, categories }) {
    const { flash } = usePage().props;

    const [cartItems, setCartItems] = useState([]);
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleAddProduct = (product) => {
        if (product.stock_type === "limited" && product.stock <= 0) return;

        setCartItems((prev) => {
            const existing = prev.find(
                (item) => item.product_id === product.id && !item.is_custom,
            );

            if (
                existing &&
                product.stock_type === "limited" &&
                existing.qty >= product.stock
            ) {
                return prev;
            }

            if (existing) {
                return prev.map((item) =>
                    item.product_id === product.id && !item.is_custom
                        ? { ...item, qty: item.qty + 1 }
                        : item,
                );
            }
            return [
                ...prev,
                {
                    _key: crypto.randomUUID(),
                    product_id: product.id,
                    name: product.name,
                    unit_price: parseFloat(product.selling_price),
                    capital_price: parseFloat(product.capital_price ?? 0),
                    qty: 1,
                    discount: 0,
                    is_custom: false,
                    stock_type: product.stock_type,
                    max_stock: product.stock,
                },
            ];
        });
    };

    const handleAddCustom = ({ name, selling_price, capital_price }) => {
        setCartItems((prev) => [
            ...prev,
            {
                _key: crypto.randomUUID(),
                product_id: null,
                name,
                unit_price: selling_price,
                capital_price: capital_price,
                qty: 1,
                discount: 0,
                is_custom: true,
            },
        ]);
    };

    const handleUpdateQty = (_key, qty) => {
        if (qty < 1) return handleRemoveItem(_key);
        setCartItems((prev) =>
            prev.map((item) => {
                if (item._key !== _key) return item;
                if (item.stock_type === "limited" && qty > item.max_stock)
                    return item;
                return { ...item, qty };
            }),
        );
    };

    const handleUpdateDiscount = (_key, discount) => {
        setCartItems((prev) =>
            prev.map((item) =>
                item._key === _key
                    ? { ...item, discount: parseFloat(discount) || 0 }
                    : item,
            ),
        );
    };

    const handleRemoveItem = (_key) => {
        setCartItems((prev) => prev.filter((item) => item._key !== _key));
    };

    const handleClearCart = () => setCartItems([]);

    const handlePaymentSuccess = () => {
        setPaymentOpen(false);
        setCartItems([]);
        setCartOpen(false);
    };

    const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);

    return (
        <>
            <Head title="POS — Transaksi" />

            <div className="flex h-[calc(100dvh-4rem)] overflow-hidden w-full max-w-full">
                <div className="flex-1 overflow-hidden w-full min-w-0">
                    <ProductGrid
                        products={products}
                        categories={categories}
                        onAddProduct={handleAddProduct}
                        onAddCustom={handleAddCustom}
                    />
                </div>

                <div className="hidden lg:flex w-90 shrink-0 flex-col overflow-hidden">
                    <Cart
                        items={cartItems}
                        onUpdateQty={handleUpdateQty}
                        onUpdateDiscount={handleUpdateDiscount}
                        onRemoveItem={handleRemoveItem}
                        onClearCart={handleClearCart}
                        onCheckout={() => setPaymentOpen(true)}
                    />
                </div>
            </div>

            {cartOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    onClick={() => setCartOpen(false)}
                />
            )}

            <div
                className={`fixed inset-x-0 bottom-0 z-50 lg:hidden transition-transform duration-300 ease-in-out ${
                    cartOpen ? "translate-y-0" : "translate-y-full"
                }`}
                style={{ maxHeight: "85dvh" }}
            >
                <div className="flex flex-col h-full rounded-t-2xl overflow-hidden shadow-2xl bg-card">
                    <div
                        className="flex justify-center pt-2 pb-1 cursor-pointer shrink-0"
                        onClick={() => setCartOpen(false)}
                    >
                        <div className="w-10 h-1.5 rounded-full bg-muted-foreground/30" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <Cart
                            items={cartItems}
                            onUpdateQty={handleUpdateQty}
                            onUpdateDiscount={handleUpdateDiscount}
                            onRemoveItem={handleRemoveItem}
                            onClearCart={handleClearCart}
                            onCheckout={() => {
                                setCartOpen(false);
                                setPaymentOpen(true);
                            }}
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={() => setCartOpen(true)}
                className="fixed bottom-4 right-4 z-30 lg:hidden flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-3 shadow-lg active:scale-95 transition-transform"
            >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                    <Badge className="bg-white text-primary h-5 min-w-5 px-1.5 text-xs">
                        {totalItems}
                    </Badge>
                )}
                <span className="text-sm font-semibold">Keranjang</span>
            </button>

            <PaymentDialog
                open={paymentOpen}
                onOpenChange={setPaymentOpen}
                cartItems={cartItems}
                onSuccess={handlePaymentSuccess}
            />

            <Toaster position="top-right" richColors />
        </>
    );
}

PosPage.layout = (page) => <AppLayout>{page}</AppLayout>;
