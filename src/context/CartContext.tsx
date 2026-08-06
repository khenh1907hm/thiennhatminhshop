"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/data/products";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  updateQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("volt_cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    } else {
      // Default initial mock items in cart from original HTML
      const defaultItems = [
        {
          product: {
            id: "dong-anh-250kva",
            name: "MÁY BIẾN ÁP ĐÔNG ANH 250KVA",
            sku: "VA-TR-250-DA",
            brand: "VOLT ARCHITECT",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBsPRBuZIEjISxPBmYErBGDkwPkAaxFyUN4Siure8LqBL_cT5EpkXbMJ3FucjmVzKx-gCfTcshEuReVMbREYyMwywUnVHzbVYtCrRGN9k7-NM4hY5lEV9CNOtXhdVjBJrpmAVTEElu2nrkccH--RhhH1m-XXsTfcf7hgGuIoxXO-cVeql5boN07CBk_YPVmDSEo_jXxvTGkNLZaOOHyYMezrVknH4pibFa0GMeLzmU0zJlh9w8g8hZKqSwJ_Z4BuYZXxZw-8Zg8wS1J",
            price: "145.000.000 đ",
            numericPrice: 145000000,
            inStock: true,
            description: "Máy biến áp chất lượng cao sản xuất bởi công ty Thiết bị điện Đông Anh.",
            category: "CONTACTOR KHỞI ĐỘNG TỪ",
          },
          quantity: 1,
        },
        {
          product: {
            id: "cadivi-cv-150",
            name: "CÁP ĐIỆN CADIVI CV-150MM2",
            sku: "VA-CA-150-CD",
            brand: "CADIVI",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJ7ypCawmgeBmkX29gFhOzWuYouhw0TIcic5dqVI_JTc6r4oAdV6SgYBjJblTrbIkaF0J6oO3SHFSw8gk8t46Ca856Z5C8bCR9x1X7M66zZOas_Ya5KtiH-M1wyMu8UjGk8tJAvtQlxFD3qwKk0OOkMnSQI6YZq1PPt7zXigcSiY_8IqXaz5DvP_bGzr3j9gLnM-7XaIw7_6yoGK2tor0Q7jUG1ryjIsKjHdz7HSuieWMLGNy3hGsMomMilKfbfs0o1yUFcf6UNpRH",
            price: "245.000 đ/m",
            numericPrice: 245000,
            inStock: true,
            description: "Cáp điện hạ thế 3 pha CV 150mm2 chất lượng cao từ hãng CADIVI.",
            category: "DÂY ĐIỆN - CÁP ĐIỆN",
          },
          quantity: 50,
        },
      ];
      setItems(defaultItems);
      localStorage.setItem("volt_cart", JSON.stringify(defaultItems));
    }
  }, []);

  // Save cart to localStorage on changes
  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem("volt_cart", JSON.stringify(newItems));
  };

  const addToCart = (product: Product, quantity: number) => {
    const existingIndex = items.findIndex((item) => item.product.id === product.id);
    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += quantity;
      saveCart(updated);
    } else {
      saveCart([...items, { product, quantity }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    const updated = items
      .map((item) => {
        if (item.product.id === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      });
    saveCart(updated);
  };

  const removeFromCart = (productId: string) => {
    const updated = items.filter((item) => item.product.id !== productId);
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
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
