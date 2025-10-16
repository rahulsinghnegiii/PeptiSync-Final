import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, Package } from "lucide-react";
import { Product } from "@/hooks/useProducts";
import { OptimizedImage } from "@/components/OptimizedImage";

interface ProductQuickViewProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductQuickView = ({
  product,
  open,
  onOpenChange,
  onAddToCart,
}: ProductQuickViewProps) => {
  if (!product) return null;

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl glass border-glass-border" aria-describedby="product-description">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="relative h-80 rounded-lg overflow-hidden">
            <OptimizedImage
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-80 rounded-lg"
              priority
              width={600}
              height={320}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute top-4 left-4">
              {isOutOfStock ? (
                <Badge variant="destructive" className="glass">
                  Out of Stock
                </Badge>
              ) : isLowStock ? (
                <Badge variant="secondary" className="glass bg-yellow-500/20">
                  Only {product.stock_quantity} left
                </Badge>
              ) : (
                <Badge variant="secondary" className="glass bg-green-500/20">
                  In Stock
                </Badge>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            {/* Price */}
            <div className="mb-4">
              <span className="text-3xl font-bold text-gradient">
                ${product.price.toFixed(2)}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4" role="group" aria-label={`Rating: ${product.rating.toFixed(1)} out of 5 stars, ${product.review_count} reviews`}>
              <div className="flex items-center gap-1" aria-hidden="true">
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
              <span className="text-sm font-medium" aria-hidden="true">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground" aria-hidden="true">
                ({product.review_count}{" "}
                {product.review_count === 1 ? "review" : "reviews"})
              </span>
            </div>

            {/* Category */}
            <div className="mb-4">
              <Badge variant="outline" className="glass">
                {product.category}
              </Badge>
            </div>

            {/* Description */}
            <div className="mb-6 flex-grow">
              <h3 className="text-sm font-semibold mb-2">Description</h3>
              <p id="product-description" className="text-muted-foreground text-sm leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Stock Info */}
            <div className="mb-6 p-4 rounded-lg bg-muted/20 border border-glass-border" role="status" aria-live="polite">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">
                    {isOutOfStock
                      ? "Currently unavailable"
                      : isLowStock
                      ? `Only ${product.stock_quantity} left in stock`
                      : "In stock and ready to ship"}
                  </p>
                  {!isOutOfStock && (
                    <p className="text-xs text-muted-foreground">
                      Free shipping on orders over $199
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={() => {
                onAddToCart(product);
                onOpenChange(false);
              }}
              disabled={isOutOfStock}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
