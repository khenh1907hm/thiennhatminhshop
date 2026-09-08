"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Product } from "@/data/products";
import { useSession } from "next-auth/react";

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const GUEST_WISHLIST_KEY = "volt_guest_wishlist";

const getGuestWishlist = (): Product[] => {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(GUEST_WISHLIST_KEY) || localStorage.getItem("wishlist");
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const clearGuestWishlist = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_WISHLIST_KEY);
  localStorage.removeItem("wishlist");
};

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const { data: session, status } = useSession();
  const prevUserEmailRef = useRef<string | null | undefined>(undefined);

  // Load wishlist when auth state changes
  useEffect(() => {
    if (status === "loading") return;

    const currentEmail = session?.user?.email || null;

    if (session?.user) {
      // User is logged in
      const guestList = getGuestWishlist();

      if (guestList.length > 0) {
        // Merge guest items into user account in DB
        const itemIds = guestList.map((p) => p.id);
        fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: itemIds })
        })
          .then(() => {
            clearGuestWishlist();
            return fetch('/api/wishlist');
          })
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) setWishlist(data.map((item) => item.product));
          })
          .catch((error) => console.error("Failed to merge wishlist:", error));
      } else {
        // Normal fetch for logged in user
        fetch('/api/wishlist')
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) {
              setWishlist(data.map((item) => item.product));
            }
          })
          .catch((error) => console.error("Failed to fetch wishlist from API:", error));
      }
    } else {
      // User is logged out (guest)
      const guestList = getGuestWishlist();
      setWishlist(guestList);
    }

    prevUserEmailRef.current = currentEmail;
  }, [session?.user?.email, status]);

  const addToWishlist = async (product: Product) => {
    const prev = [...wishlist];
    setWishlist((current) => {
      if (current.some((p) => p.id === product.id)) return current;
      return [...current, product];
    });

    if (session?.user) {
      try {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id, action: 'add' })
        });
        if (!res.ok) throw new Error("API error");
      } catch (e) {
        console.error("Failed to sync wishlist addition to API", e);
        setWishlist(prev);
      }
    } else {
      const updated = wishlist.some((p) => p.id === product.id)
        ? wishlist
        : [...wishlist, product];
      localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(updated));
    }
  };

  const removeFromWishlist = async (productId: string) => {
    const prev = [...wishlist];
    const updated = wishlist.filter((p) => p.id !== productId);
    setWishlist(updated);

    if (session?.user) {
      try {
        const res = await fetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error("API error");
      } catch (e) {
        console.error("Failed to sync wishlist removal to API", e);
        setWishlist(prev);
      }
    } else {
      localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(updated));
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
