import { useState, useEffect } from "react";
import { Head, usePage } from "@inertiajs/react";
import { toast, Toaster } from "sonner";
import { ShoppingCart } from "lucide-react";
import AppPosLayout from "@/layouts/pos/AppPosLayout";

import { ProductGrid } from "./_components/ProductGrid";
import { Cart } from "./_components/Cart";
import { PaymentDialog } from "./_components/PaymentDialog";
import { Badge } from "@/components/ui/badge";

export const ONLINE_CHANNELS = ["grabfood", "shopeefood", "gobiz"];
export const ONLINE_PRICE_MARKUP = 0.2;

export default function PosPage({ products, categories }) {
    const { flash } = usePage().props;

    const [cartItems, setCartItems] = useState([]);
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [globalDiscount, setGlobalDiscount] = useState(0);
    const [orderChannel, setOrderChannel] = useState("dine_in");

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    useEffect(() => {
        const isOnline = ONLINE_CHANNELS.includes(orderChannel);
        setCartItems((prev) =>
            prev.map((item) => {
                if (item.is_custom) return item;
                const basePrice = item.base_unit_price ?? item.unit_price;
                const newPrice = isOnline
                    ? Math.round(basePrice * (1 + ONLINE_PRICE_MARKUP))
                    : basePrice;
                return {
                    ...item,
                    base_unit_price: basePrice,
                    unit_price: newPrice,
                };
            }),
        );
    }, [orderChannel]);

    const handleChannelChange = (channel) => {
        setOrderChannel(channel);
        setGlobalDiscount(0);
    };

    const handleAddProduct = (product) => {
        if (product.stock_type === "limited" && product.stock <= 0) return;

        const isOnline = ONLINE_CHANNELS.includes(orderChannel);
        const basePrice = parseFloat(product.selling_price);
        const effectivePrice = isOnline
            ? Math.round(basePrice * (1 + ONLINE_PRICE_MARKUP))
            : basePrice;

        setCartItems((prev) => {
            const existing = prev.find(
                (item) => item.product_id === product.id && !item.is_custom,
            );
            if (
                existing &&
                product.stock_type === "limited" &&
                existing.qty >= product.stock
            )
                return prev;
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
                    base_unit_price: basePrice,
                    unit_price: effectivePrice,
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
                base_unit_price: selling_price,
                unit_price: selling_price,
                capital_price,
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
        setGlobalDiscount(0);
    };

    const subtotalAfterItemDiscount = cartItems.reduce(
        (sum, item) => sum + (item.unit_price - item.discount) * item.qty,
        0,
    );

    const finalTotal = Math.max(0, subtotalAfterItemDiscount - globalDiscount);
    const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);

    const cartProps = {
        items: cartItems,
        onUpdateQty: handleUpdateQty,
        onUpdateDiscount: handleUpdateDiscount,
        onRemoveItem: handleRemoveItem,
        onClearCart: handleClearCart,
        globalDiscount,
        onGlobalDiscountChange: setGlobalDiscount,
        subtotalAfterItemDiscount,
        finalTotal,
        orderChannel,
        onChannelChange: handleChannelChange,
    };

    return (
        <>
            <Head title="POS — Transaksi" />

            <div className="h-full w-full overflow-hidden">
                <div className="flex h-full w-full overflow-hidden">
                    <div className="flex-1 min-w-0 overflow-hidden flex flex-col p-3 sm:p-4">
                        <ProductGrid
                            products={products}
                            categories={categories}
                            onAddProduct={handleAddProduct}
                            onAddCustom={handleAddCustom}
                        />
                    </div>

                    <div className="hidden lg:flex flex-col overflow-hidden shrink-0 w-90 xl:w-100 border-l">
                        <Cart
                            {...cartProps}
                            onCheckout={() => setPaymentOpen(true)}
                        />
                    </div>
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
                            {...cartProps}
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
                globalDiscount={globalDiscount}
                finalTotal={finalTotal}
                subtotalAfterItemDiscount={subtotalAfterItemDiscount}
                orderChannel={orderChannel}
            />

            <Toaster position="top-right" richColors />
        </>
    );
}

PosPage.layout = (page) => <AppPosLayout>{page}</AppPosLayout>;
