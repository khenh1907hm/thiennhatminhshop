"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Product } from "@/data/products";
import { useSession } from "next-auth/react";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => Promise<number>;
  updateQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = "volt_guest_cart";

const getGuestCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(GUEST_CART_KEY) || localStorage.getItem("volt_cart");
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const clearGuestCart = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_CART_KEY);
  localStorage.removeItem("volt_cart");
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { data: session, status } = useSession();
  const prevUserEmailRef = useRef<string | null | undefined>(undefined);

  // Load cart when auth state changes
  useEffect(() => {
    if (status === "loading") return;

    const currentEmail = session?.user?.email || null;

    if (session?.user) {
      // User is logged in
      const guestCart = getGuestCart();

      if (guestCart.length > 0) {
        // Merge flow
        const itemsToMerge = guestCart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity
        }));

        fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: itemsToMerge })
        })
          .then(async (res) => {
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              throw new Error(data.error || "Failed to merge cart");
            }
            clearGuestCart();
            return fetch('/api/cart');
          })
          .then(async (res) => {
            if (!res.ok) throw new Error("Failed to load merged cart");
            return res.json();
          })
          .then((data) => {
            if (data.items && Array.isArray(data.items)) setItems(data.items);
          })
          .catch((e) => console.error("Failed to merge cart API", e));
      } else {
        // Normal fetch flow for logged in user
        fetch('/api/cart')
          .then((res) => res.json())
          .then((data) => {
            if (data.items && Array.isArray(data.items)) setItems(data.items);
          })
          .catch((e) => console.error("Failed to fetch cart API", e));
      }
    } else {
      // User is logged out (guest)
      const guestCart = getGuestCart();
      setItems(guestCart);
    }

    prevUserEmailRef.current = currentEmail;
  }, [session?.user?.email, status]);

  const addToCart = async (product: Product, quantity: number) => {
    const safeQuantity = Number.isInteger(quantity) ? Math.max(1, quantity) : 1;
    const prevItems = [...items];
    const existingIndex = items.findIndex((item) => item.product.id === product.id);
    const existingQuantity = existingIndex > -1 ? items[existingIndex].quantity : 0;
    const stock = Number((product as Product & { stock?: number }).stock);
    const quantityToAdd = Number.isFinite(stock)
      ? Math.min(safeQuantity, Math.max(0, stock - existingQuantity))
      : safeQuantity;

    if (quantityToAdd <= 0) return 0;

    const updated = [...items];

    if (existingIndex > -1) {
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + quantityToAdd
      };
    } else {
      updated.push({ product, quantity: quantityToAdd });
    }

    setItems(updated);

    if (session?.user) {
      try {
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id, quantity: quantityToAdd })
        });
        if (!res.ok) throw new Error("API Failed");
      } catch (error) {
        console.error("Failed to add to cart API", error);
        setItems(prevItems);
        return 0;
      }
    } else {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updated));
    }
    return quantityToAdd;
  };

  const updateQuantity = async (productId: string, delta: number) => {
    const prevItems = [...items];
    const updated = items.map((item) => {
      if (item.product.id === productId) {
        const stock = Number((item.product as Product & { stock?: number }).stock);
        const requestedQuantity = Math.max(1, item.quantity + delta);
        const quantity = Number.isFinite(stock)
          ? Math.min(stock, requestedQuantity)
          : requestedQuantity;
        return { ...item, quantity };
      }
      return item;
    });

    setItems(updated);

    if (session?.user) {
      try {
        const res = await fetch('/api/cart/item', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, delta })
        });
        if (!res.ok) throw new Error("API Failed");
      } catch (error) {
        console.error("Failed to update cart item API", error);
        setItems(prevItems);
      }
    } else {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updated));
    }
  };

  const removeFromCart = async (productId: string) => {
    const prevItems = [...items];
    const updated = items.filter((item) => item.product.id !== productId);
    setItems(updated);

    if (session?.user) {
      try {
        const res = await fetch(`/api/cart?productId=${encodeURIComponent(productId)}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error("API Failed");
      } catch (error) {
        console.error("Failed to remove cart item API", error);
        setItems(prevItems);
      }
    } else {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updated));
    }
  };

  const clearCart = async () => {
    const prevItems = [...items];
    setItems([]);

    if (session?.user) {
      try {
        const res = await fetch('/api/cart', { method: 'DELETE' });
        if (!res.ok) throw new Error("API Failed");
      } catch (error) {
        console.error("Failed to clear cart API", error);
        setItems(prevItems);
      }
    } else {
      clearGuestCart();
    }
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
