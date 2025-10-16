import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductFiltersState } from "@/components/ProductFilters";
import { SortOption } from "@/components/ProductSort";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  category: string;
  is_active: boolean;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

interface UseProductsOptions {
  filters?: ProductFiltersState;
  sortBy?: SortOption;
  searchQuery?: string;
  page?: number;
  pageSize?: number;
}

export const useProducts = ({
  filters,
  sortBy = "name-asc",
  searchQuery,
  page = 1,
  pageSize = 20,
}: UseProductsOptions = {}) => {
  return useQuery({
    queryKey: ["products", filters, sortBy, searchQuery, page, pageSize],
    queryFn: async () => {
      // Select only needed columns for better performance
      // Use count option to get total count for pagination
      let query = supabase
        .from("products")
        .select("id, name, description, price, image_url, stock_quantity, category, rating, review_count", { count: "exact" })
        .eq("is_active", true);

      // Apply category filter
      if (filters?.categories && filters.categories.length > 0) {
        query = query.in("category", filters.categories);
      }

      // Apply price range filter
      if (filters?.priceRange) {
        query = query
          .gte("price", filters.priceRange[0])
          .lte("price", filters.priceRange[1]);
      }

      // Apply rating filter
      if (filters?.minRating && filters.minRating > 0) {
        query = query.gte("rating", filters.minRating);
      }

      // Apply search query
      if (searchQuery && searchQuery.trim().length > 0) {
        query = query.textSearch("search_vector", searchQuery.trim(), {
          type: "websearch",
          config: "english",
        });
      }

      // Apply sorting
      switch (sortBy) {
        case "name-asc":
          query = query.order("name", { ascending: true });
          break;
        case "name-desc":
          query = query.order("name", { ascending: false });
          break;
        case "price-asc":
          query = query.order("price", { ascending: true });
          break;
        case "price-desc":
          query = query.order("price", { ascending: false });
          break;
        case "rating-desc":
          query = query.order("rating", { ascending: false });
          break;
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      
      return {
        products: data as Product[],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
        currentPage: page,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Keep previous data while fetching new page
    placeholderData: (previousData) => previousData,
  });
};

// Hook to get available categories
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("category")
        .eq("is_active", true);

      if (error) throw error;

      // Get unique categories
      const categories = [...new Set(data.map((p) => p.category))].filter(
        Boolean
      );
      return categories as string[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to get a single product by ID
export const useProduct = (productId: string | undefined) => {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      if (!productId) throw new Error("Product ID is required");

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
