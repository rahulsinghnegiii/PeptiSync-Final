import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductReviews } from "@/components/ProductReviews";
import { ReviewForm } from "@/components/ReviewForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft, Package, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { useState } from "react";
import { motion } from "framer-motion";

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Fetch product details
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      if (!productId) throw new Error("Product ID is required");

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });

  const handleAddToCart = () => {
    if (!user) {
      toast.info("Please sign in to add items to cart");
      navigate("/auth");
      return;
    }

    if (!product) return;

    addToCart.mutate({
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      productImage: product.image_url,
      quantity,
    });
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock_quantity || 0)) {
      setQuantity(newQuantity);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <p className="text-muted-foreground">Loading product...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The product you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate("/store")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Store
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-20">
        {/* Back Button */}
        <section className="py-6 border-b border-glass-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/store")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Store
            </Button>
          </div>
        </section>

        {/* Product Details */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Product Gallery */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <ProductGallery images={[product.image_url]} />
              </motion.div>

              {/* Product Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-6"
              >
                {/* Category */}
                <Badge variant="outline" className="glass">
                  {product.category}
                </Badge>

                {/* Name */}
                <h1 className="text-4xl font-bold">{product.name}</h1>

                {/* Rating */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating)
                            ? "fill-primary text-primary"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-medium">
                    {product.rating.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    ({product.review_count}{" "}
                    {product.review_count === 1 ? "review" : "reviews"})
                  </span>
                </div>

                {/* Price */}
                <div>
                  <span className="text-4xl font-bold text-gradient">
                    ${product.price.toFixed(2)}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-xl font-semibold mb-3">Description</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Stock Status */}
                <div className="p-4 rounded-lg bg-muted/20 border border-glass-border">
                  <div className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-primary" />
                    <div>
                      {isOutOfStock ? (
                        <>
                          <Badge variant="destructive" className="mb-2">
                            Out of Stock
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            This product is currently unavailable
                          </p>
                        </>
                      ) : isLowStock ? (
                        <>
                          <Badge
                            variant="secondary"
                            className="glass bg-yellow-500/20 mb-2"
                          >
                            Only {product.stock_quantity} left
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            Order soon before it's gone!
                          </p>
                        </>
                      ) : (
                        <>
                          <Badge
                            variant="secondary"
                            className="glass bg-green-500/20 mb-2"
                          >
                            In Stock
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            Ready to ship • Free shipping on orders over $199
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity Selector */}
                {!isOutOfStock && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quantity</label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-glass-border rounded-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1}
                          className="rounded-r-none"
                        >
                          -
                        </Button>
                        <span className="px-6 py-2 font-medium">{quantity}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(1)}
                          disabled={quantity >= product.stock_quantity}
                          className="rounded-l-none"
                        >
                          +
                        </Button>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {product.stock_quantity} available
                      </span>
                    </div>
                  </div>
                )}

                {/* Add to Cart Button */}
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || addToCart.isPending}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-12 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Review Form */}
              <div className="lg:col-span-1">
                <ReviewForm productId={product.id} />
              </div>

              {/* Reviews List */}
              <div className="lg:col-span-2">
                <ProductReviews
                  productId={product.id}
                  averageRating={product.rating}
                  totalReviews={product.review_count}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
