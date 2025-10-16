import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface ReviewFormData {
  rating: number;
  comment: string;
}

type ReviewSortOption = "recent" | "highest-rated" | "lowest-rated";

interface UseProductReviewsOptions {
  productId: string | undefined;
  sortBy?: ReviewSortOption;
  page?: number;
  pageSize?: number;
}

// Hook to get reviews for a product
export const useProductReviews = ({
  productId,
  sortBy = "recent",
  page = 1,
  pageSize = 10,
}: UseProductReviewsOptions) => {
  return useQuery({
    queryKey: ["reviews", productId, sortBy, page],
    queryFn: async () => {
      if (!productId) throw new Error("Product ID is required");

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("reviews")
        .select(
          `
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `,
          { count: "exact" }
        )
        .eq("product_id", productId)
        .range(from, to);

      // Apply sorting
      switch (sortBy) {
        case "recent":
          query = query.order("created_at", { ascending: false });
          break;
        case "highest-rated":
          query = query.order("rating", { ascending: false });
          break;
        case "lowest-rated":
          query = query.order("rating", { ascending: true });
          break;
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        reviews: data as Review[],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },
    enabled: !!productId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to check if user purchased a product
export const useUserPurchasedProduct = (
  userId: string | undefined,
  productId: string | undefined
) => {
  return useQuery({
    queryKey: ["user-purchased", userId, productId],
    queryFn: async () => {
      if (!userId || !productId) return false;

      const { data, error } = await supabase.rpc("user_purchased_product", {
        _user_id: userId,
        _product_id: productId,
      });

      if (error) throw error;
      return data as boolean;
    },
    enabled: !!userId && !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get user's review for a product
export const useUserReview = (
  userId: string | undefined,
  productId: string | undefined
) => {
  return useQuery({
    queryKey: ["user-review", userId, productId],
    queryFn: async () => {
      if (!userId || !productId) return null;

      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .maybeSingle();

      if (error) throw error;
      return data as Review | null;
    },
    enabled: !!userId && !!productId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to submit a review
export const useSubmitReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      userId,
      rating,
      comment,
      isVerifiedPurchase,
    }: {
      productId: string;
      userId: string;
      rating: number;
      comment: string;
      isVerifiedPurchase: boolean;
    }) => {
      const { data, error } = await supabase
        .from("reviews")
        .insert({
          product_id: productId,
          user_id: userId,
          rating,
          comment,
          is_verified_purchase: isVerifiedPurchase,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success("Review submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["user-review", variables.userId, variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: any) => {
      if (error.code === "23505") {
        toast.error("You have already reviewed this product");
      } else {
        toast.error("Failed to submit review. Please try again.");
      }
    },
  });
};

// Hook to update a review
export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      rating,
      comment,
    }: {
      reviewId: string;
      rating: number;
      comment: string;
    }) => {
      const { data, error } = await supabase
        .from("reviews")
        .update({
          rating,
          comment,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success("Review updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["reviews", data.product_id] });
      queryClient.invalidateQueries({ queryKey: ["user-review"] });
      queryClient.invalidateQueries({ queryKey: ["product", data.product_id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => {
      toast.error("Failed to update review. Please try again.");
    },
  });
};

// Hook to delete a review
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      productId,
    }: {
      reviewId: string;
      productId: string;
    }) => {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;
      return { productId };
    },
    onSuccess: (data) => {
      toast.success("Review deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["reviews", data.productId] });
      queryClient.invalidateQueries({ queryKey: ["user-review"] });
      queryClient.invalidateQueries({ queryKey: ["product", data.productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => {
      toast.error("Failed to delete review. Please try again.");
    },
  });
};
