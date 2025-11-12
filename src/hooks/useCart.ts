import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEffect } from "react";

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string | null;
  product_name: string;
  product_price: number;
  product_image: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  stock_quantity: number | null;
  is_active: boolean | null;
}

export const useCart = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch cart items with product data
  const { data: cartItems = [], isLoading, error } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          *,
          products:product_id (
            id,
            name,
            price,
            image_url,
            stock_quantity,
            is_active
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (CartItem & { products: Product | null })[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Real-time cart synchronization
  useEffect(() => {
    if (!user) return;

    const channelName = `cart-changes-${user.id}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart_items",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["cart", user.id] });
        }
      )
      .subscribe();

    return () => {
      // Properly unsubscribe and remove channel to prevent memory leaks
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  // Add to cart mutation
  const addToCart = useMutation({
    mutationFn: async ({
      productId,
      productName,
      productPrice,
      productImage,
      quantity = 1,
    }: {
      productId: string;
      productName: string;
      productPrice: number;
      productImage: string | null;
      quantity?: number;
    }) => {
      if (!user) throw new Error("User not authenticated");

      // Check if product exists and get stock
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("stock_quantity, is_active")
        .eq("id", productId)
        .single();

      if (productError) throw productError;

      if (!product.is_active) {
        throw new Error("Product is not available");
      }

      if (product.stock_quantity !== null && product.stock_quantity < quantity) {
        throw new Error(`Only ${product.stock_quantity} items available in stock`);
      }

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (existingItem) {
        // Update quantity if item exists
        const newQuantity = existingItem.quantity + quantity;

        // Validate against stock
        if (product.stock_quantity !== null && product.stock_quantity < newQuantity) {
          throw new Error(`Only ${product.stock_quantity} items available in stock`);
        }

        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: newQuantity })
          .eq("id", existingItem.id);

        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: productId,
          product_name: productName,
          product_price: productPrice,
          product_image: productImage,
          quantity,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
      toast.success("Added to cart!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add to cart");
    },
  });

  // Update quantity mutation
  const updateQuantity = useMutation({
    mutationFn: async ({
      itemId,
      quantity,
      productId,
    }: {
      itemId: string;
      quantity: number;
      productId: string | null;
    }) => {
      if (quantity < 1) throw new Error("Quantity must be at least 1");

      // Validate against stock if product_id exists
      if (productId) {
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("stock_quantity")
          .eq("id", productId)
          .single();

        if (productError) throw productError;

        if (product.stock_quantity !== null && product.stock_quantity < quantity) {
          throw new Error(`Only ${product.stock_quantity} items available in stock`);
        }
      }

      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update quantity");
    },
  });

  // Remove item mutation
  const removeItem = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
      toast.success("Item removed from cart");
    },
    onError: () => {
      toast.error("Failed to remove item");
    },
  });

  // Clear cart mutation
  const clearCart = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
      toast.success("Cart cleared");
    },
    onError: () => {
      toast.error("Failed to clear cart");
    },
  });

  // Calculate totals
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product_price * item.quantity,
    0
  );
  const shippingCost = subtotal >= 199 ? 0 : 9.99;
  const total = subtotal + shippingCost;

  return {
    cartItems,
    isLoading,
    error,
    totalItems,
    subtotal,
    shippingCost,
    total,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };
};
