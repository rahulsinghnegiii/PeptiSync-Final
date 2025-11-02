import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import { useProducts, useCategories } from "@/hooks/useProducts";
import {
  ProductFilters,
  ProductFiltersState,
  ActiveFilters,
} from "@/components/ProductFilters";
import { ProductSort, SortOption } from "@/components/ProductSort";
import { ProductSearch } from "@/components/ProductSearch";
import { ProductCard } from "@/components/ProductCard";
import { ProductQuickView } from "@/components/ProductQuickView";
import { Product } from "@/hooks/useProducts";
import { useState, useEffect, useRef } from "react";
import { useKeyboardShortcuts, useEscapeKey } from "@/hooks/useKeyboardShortcuts";
import { LiveRegion, useLiveAnnouncer } from "@/components/LiveRegion";

const Store = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL params
  const [filters, setFilters] = useState<ProductFiltersState>(() => {
    const categories = searchParams.get("categories")?.split(",").filter(Boolean) || [];
    const minPrice = parseInt(searchParams.get("minPrice") || "0");
    const maxPrice = parseInt(searchParams.get("maxPrice") || "200");
    const minRating = parseInt(searchParams.get("minRating") || "0");

    return {
      categories,
      priceRange: [minPrice, maxPrice],
      minRating,
    };
  });

  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "name-asc"
  );

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { message: announcement, announce } = useLiveAnnouncer();

  // Fetch products and categories
  const { data: productsData, isLoading } = useProducts({
    filters,
    sortBy,
    searchQuery,
    page: currentPage,
    pageSize,
  });
  const { data: availableCategories = [] } = useCategories();

  // Extract products and pagination info
  const products = productsData?.products || [];
  const totalPages = productsData?.totalPages || 1;
  const totalCount = productsData?.totalCount || 0;

  // Announce product results to screen readers
  useEffect(() => {
    if (!isLoading && products) {
      const message = totalCount === 0
        ? 'No products found'
        : `${totalCount} ${totalCount === 1 ? 'product' : 'products'} found`;
      announce(message);
    }
  }, [isLoading, totalCount, products, announce]);

  // Announce when filters change
  useEffect(() => {
    if (filters.categories.length > 0 || filters.minRating > 0 || filters.priceRange[0] > 0 || filters.priceRange[1] < 200) {
      announce('Filters applied. Product results updated.');
    }
  }, [filters, announce]);

  // Handler functions need to be defined before keyboard shortcuts
  const handleClearAllFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, 200],
      minRating: 0,
    });
    setSearchQuery("");
  };

  // Keyboard shortcuts for store navigation
  useKeyboardShortcuts([
    {
      key: '/',
      callback: () => {
        searchInputRef.current?.focus();
      },
      description: 'Focus search input',
    },
    {
      key: 'c',
      callback: handleClearAllFilters,
      description: 'Clear all filters',
    },
  ]);

  // Close quick view with Escape key
  useEscapeKey(() => setIsQuickViewOpen(false), isQuickViewOpen);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.categories.length > 0) {
      params.set("categories", filters.categories.join(","));
    }
    if (filters.priceRange[0] > 0) {
      params.set("minPrice", filters.priceRange[0].toString());
    }
    if (filters.priceRange[1] < 200) {
      params.set("maxPrice", filters.priceRange[1].toString());
    }
    if (filters.minRating > 0) {
      params.set("minRating", filters.minRating.toString());
    }
    if (sortBy !== "name-asc") {
      params.set("sort", sortBy);
    }
    if (searchQuery) {
      params.set("search", searchQuery);
    }

    setSearchParams(params, { replace: true });
  }, [filters, sortBy, searchQuery, setSearchParams]);

  const handleAddToCart = async (product: Product, quantity: number = 1) => {
    if (!user) {
      toast.info("Please sign in to add items to cart");
      navigate("/auth");
      return;
    }

    addToCart.mutate({
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      productImage: product.image_url,
      quantity,
    });
  };

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleFiltersChange = (newFilters: ProductFiltersState) => {
    setFilters(newFilters);
  };

  const handleRemoveCategory = (category: string) => {
    setFilters({
      ...filters,
      categories: filters.categories.filter((c) => c !== category),
    });
  };

  const handleRemovePriceRange = () => {
    setFilters({ ...filters, priceRange: [0, 200] });
  };

  const handleRemoveRating = () => {
    setFilters({ ...filters, minRating: 0 });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  return (
    <div className="min-h-screen">
      <Navigation />
      <main id="main-content" className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden" aria-labelledby="store-heading">
          <div className="absolute inset-0" aria-hidden="true">
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary rounded-full"
                initial={{ 
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                  opacity: 0 
                }}
                animate={{
                  y: [null, -100, -200],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                }}
              />
            ))}
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <h1 id="store-heading" className="text-5xl lg:text-6xl font-bold mb-6">
                PeptiSync <span className="text-gradient">Store</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Premium peptide tracking accessories and tools to enhance your experience
              </p>
              
              {/* Search Bar */}
              <div className="flex justify-center mb-6">
                <ProductSearch
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSearch={handleSearch}
                  ref={searchInputRef}
                />
              </div>
              
              <Badge variant="secondary" className="glass text-sm px-4 py-2">
                Free shipping on orders over $199
              </Badge>
            </motion.div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-20" aria-label="Product catalog">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <aside className="lg:col-span-1" aria-label="Product filters">
                <ProductFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  availableCategories={availableCategories}
                />
              </aside>

              {/* Products Grid */}
              <div className="lg:col-span-3" role="region" aria-label="Product results">
                {/* Sort and Active Filters */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      {isLoading ? "Loading..." : `${totalCount} products found`}
                      {totalCount > pageSize && ` (showing ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalCount)})`}
                    </p>
                    <ProductSort value={sortBy} onChange={setSortBy} />
                  </div>

                  <ActiveFilters
                    filters={filters}
                    onRemoveCategory={handleRemoveCategory}
                    onRemovePriceRange={handleRemovePriceRange}
                    onRemoveRating={handleRemoveRating}
                    onClearAll={handleClearAllFilters}
                  />
                </div>

                {/* Products Grid */}
                {isLoading ? (
                  <div className="text-center py-20" role="status" aria-live="polite">
                    <p className="text-muted-foreground">Loading products...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-20" role="status">
                    <p className="text-xl font-semibold mb-2">No products found</p>
                    <p className="text-muted-foreground mb-6">
                      {searchQuery
                        ? `No results for "${searchQuery}". Try a different search term or adjust your filters.`
                        : "Try adjusting your filters to see more results"}
                    </p>
                    <Button onClick={handleClearAllFilters} aria-label="Clear all filters and search">
                      Clear All {searchQuery ? "Search & Filters" : "Filters"}
                    </Button>
                  </div>
                ) : (
                  <>
                    <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" role="list">
                      {products.map((product, index) => (
                        <li key={product.id}>
                          <ProductCard
                            product={product}
                            index={index}
                            onAddToCart={handleAddToCart}
                            onQuickView={handleQuickView}
                          />
                        </li>
                      ))}
                    </ul>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <nav className="flex items-center justify-center gap-2 mt-8" aria-label="Product pagination">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          aria-label="Go to previous page"
                        >
                          Previous
                        </Button>
                        <div className="flex items-center gap-1" role="list" aria-label="Page numbers">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                aria-label={`Go to page ${pageNum}`}
                                aria-current={currentPage === pageNum ? "page" : undefined}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          aria-label="Go to next page"
                        >
                          Next
                        </Button>
                      </nav>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Quick View Modal */}
      <ProductQuickView
        product={quickViewProduct}
        open={isQuickViewOpen}
        onOpenChange={setIsQuickViewOpen}
        onAddToCart={handleAddToCart}
      />

      {/* Live region for screen reader announcements */}
      <LiveRegion message={announcement} />
    </div>
  );
};

export default Store;