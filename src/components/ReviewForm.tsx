import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useSubmitReview,
  useUpdateReview,
  useUserReview,
  useUserPurchasedProduct,
} from "@/hooks/useReviews";
import { toast } from "sonner";
import { sanitizeUserInput } from "@/lib/inputSanitization";

// Zod validation schema
const reviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Please select a rating")
    .max(5, "Rating must be between 1 and 5"),
  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .max(500, "Comment must not exceed 500 characters"),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  productId: string;
}

export const ReviewForm = ({ productId }: ReviewFormProps) => {
  const { user } = useAuth();
  const [hoveredRating, setHoveredRating] = useState(0);

  // Check if user purchased the product
  const { data: hasPurchased, isLoading: checkingPurchase } =
    useUserPurchasedProduct(user?.id, productId);

  // Check if user already has a review
  const { data: existingReview, isLoading: loadingReview } = useUserReview(
    user?.id,
    productId
  );

  const submitReview = useSubmitReview();
  const updateReview = useUpdateReview();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existingReview?.rating || 0,
      comment: existingReview?.comment || "",
    },
  });

  const currentRating = watch("rating");

  // Update form when existing review loads
  useEffect(() => {
    if (existingReview) {
      setValue("rating", existingReview.rating);
      setValue("comment", existingReview.comment);
    }
  }, [existingReview, setValue]);

  const onSubmit = async (data: ReviewFormData) => {
    if (!user) {
      toast.error("Please sign in to submit a review");
      return;
    }

    if (!hasPurchased) {
      toast.error("You can only review products you have purchased");
      return;
    }

    // Sanitize user input to prevent XSS
    const sanitizedComment = sanitizeUserInput(data.comment);

    try {
      if (existingReview) {
        // Update existing review
        await updateReview.mutateAsync({
          reviewId: existingReview.id,
          rating: data.rating,
          comment: sanitizedComment,
        });
      } else {
        // Submit new review
        await submitReview.mutateAsync({
          productId,
          userId: user.id,
          rating: data.rating,
          comment: sanitizedComment,
          isVerifiedPurchase: hasPurchased,
        });
        reset();
      }
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error("Error submitting review:", error);
    }
  };

  const handleStarClick = (rating: number) => {
    setValue("rating", rating, { shouldValidate: true });
  };

  // Don't show form if user hasn't signed in
  if (!user) {
    return (
      <Card className="glass border-glass-border">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Please sign in to leave a review
          </p>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (checkingPurchase || loadingReview) {
    return (
      <Card className="glass border-glass-border">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // User hasn't purchased the product
  if (!hasPurchased) {
    return (
      <Card className="glass border-glass-border">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            You can only review products you have purchased
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-glass-border">
      <CardHeader>
        <CardTitle>
          {existingReview ? "Edit Your Review" : "Write a Review"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Rating Selection */}
          <div className="space-y-2">
            <Label htmlFor="rating">Rating *</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || currentRating)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
              {currentRating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {currentRating} {currentRating === 1 ? "star" : "stars"}
                </span>
              )}
            </div>
            {errors.rating && (
              <p className="text-sm text-destructive">{errors.rating.message}</p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review *</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this product..."
              className="min-h-[120px] resize-none"
              {...register("comment")}
            />
            <div className="flex items-center justify-between">
              <div>
                {errors.comment && (
                  <p className="text-sm text-destructive">
                    {errors.comment.message}
                  </p>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {watch("comment")?.length || 0} / 500
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="hero"
            className="w-full"
            disabled={submitReview.isPending || updateReview.isPending}
          >
            {submitReview.isPending || updateReview.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {existingReview ? "Updating..." : "Submitting..."}
              </>
            ) : existingReview ? (
              "Update Review"
            ) : (
              "Submit Review"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
