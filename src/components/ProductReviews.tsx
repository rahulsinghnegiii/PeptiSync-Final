import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useProductReviews } from "@/hooks/useReviews";
import { formatDistanceToNow } from "date-fns";

interface ProductReviewsProps {
  productId: string;
  averageRating: number;
  totalReviews: number;
}

type ReviewSortOption = "recent" | "highest-rated" | "lowest-rated";

export const ProductReviews = ({
  productId,
  averageRating,
  totalReviews,
}: ProductReviewsProps) => {
  const [sortBy, setSortBy] = useState<ReviewSortOption>("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const { data, isLoading } = useProductReviews({
    productId,
    sortBy,
    page: currentPage,
    pageSize,
  });

  const reviews = data?.reviews || [];
  const totalPages = data?.totalPages || 1;

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating
                ? "fill-primary text-primary"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    );
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="glass border-glass-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl mb-2">Customer Reviews</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {renderStars(Math.round(averageRating))}
                <span className="text-2xl font-bold">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-muted-foreground">
                  out of 5
                </span>
              </div>
              <span className="text-muted-foreground">
                {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
              </span>
            </div>
          </div>

          <Select
            value={sortBy}
            onValueChange={(value) => {
              setSortBy(value as ReviewSortOption);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="highest-rated">Highest Rated</SelectItem>
              <SelectItem value="lowest-rated">Lowest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No reviews yet. Be the first to review this product!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-glass-border last:border-0 pb-6 last:pb-0"
              >
                <div className="flex items-start gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={review.profiles?.avatar_url || undefined}
                      alt={review.profiles?.full_name || "User"}
                    />
                    <AvatarFallback>
                      {getInitials(review.profiles?.full_name || null)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">
                        {review.profiles?.full_name || "Anonymous User"}
                      </span>
                      {review.is_verified_purchase && (
                        <Badge
                          variant="secondary"
                          className="glass bg-green-500/20 text-green-700 dark:text-green-300"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified Purchase
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(review.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <span className="text-sm text-muted-foreground px-4">
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
