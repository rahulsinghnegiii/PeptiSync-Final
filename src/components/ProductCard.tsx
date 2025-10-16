import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/hooks/useProducts";
import { useNavigate } from "react-router-dom";
import { OptimizedImage } from "@/components/OptimizedImage";

interface ProductCardProps {
  product: Product;
  index: number;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard = ({
  product,
  index,
  onAddToCart,
  onQuickView,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Card className="glass border-glass-border hover:border-primary/30 transition-all duration-500 group h-full" role="article" aria-label={`Product: ${product.name}`}>
        <CardHeader className="relative p-0">
          <div className="relative overflow-hidden rounded-t-lg h-48">
            <OptimizedImage
              src={product.image_url || "/placeholder.svg"}
              alt={`${product.name} - ${product.description.substring(0, 50)}`}
              className="w-full h-48 group-hover:scale-110 transition-transform duration-500"
              width={400}
              height={192}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            
            {/* Stock Status Badge */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {isOutOfStock ? (
                <Badge variant="destructive" className="glass">
                  Out of Stock
                </Badge>
              ) : isLowStock ? (
                <Badge variant="secondary" className="glass bg-yellow-500/20">
                  Low Stock
                </Badge>
              ) : (
                <Badge variant="secondary" className="glass bg-green-500/20">
                  In Stock
                </Badge>
              )}
            </div>

            {/* Quick View Button */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity glass"
              onClick={() => onQuickView(product)}
              aria-label={`Quick view ${product.name}`}
            >
              <Eye className="w-4 h-4 mr-1" aria-hidden="true" />
              Quick View
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 flex flex-col flex-grow">
          <CardTitle 
            className="text-xl mb-2 group-hover:text-gradient transition-all duration-300 cursor-pointer"
            onClick={() => navigate(`/store/${product.id}`)}
          >
            {product.name}
          </CardTitle>

          <p className="text-muted-foreground text-sm mb-4 flex-grow line-clamp-2">
            {product.description}
          </p>

          {/* Rating and Reviews */}
          <div className="flex items-center gap-2 mb-4" role="group" aria-label={`Rating: ${product.rating.toFixed(1)} out of 5 stars, ${product.review_count} reviews`}>
            <div className="flex items-center gap-1" aria-hidden="true">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
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
            <span className="text-xs text-muted-foreground" aria-hidden="true">
              ({product.review_count} {product.review_count === 1 ? "review" : "reviews"})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-gradient">
              ${product.price.toFixed(2)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(`/store/${product.id}`)}
              aria-label={`View details for ${product.name}`}
            >
              View Details
            </Button>
            <Button
              variant="hero"
              className="flex-1 group"
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock}
              aria-label={isOutOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart for $${product.price.toFixed(2)}`}
            >
              <ShoppingCart className="w-4 h-4 mr-2" aria-hidden="true" />
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
