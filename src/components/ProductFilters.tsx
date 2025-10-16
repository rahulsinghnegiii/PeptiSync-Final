import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ProductFiltersState {
  categories: string[];
  priceRange: [number, number];
  minRating: number;
}

interface ProductFiltersProps {
  filters: ProductFiltersState;
  onFiltersChange: (filters: ProductFiltersState) => void;
  availableCategories: string[];
}

export const ProductFilters = ({
  filters,
  onFiltersChange,
  availableCategories,
}: ProductFiltersProps) => {
  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handlePriceRangeChange = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  const handleRatingChange = (rating: number) => {
    onFiltersChange({ ...filters, minRating: rating });
  };

  const handleReset = () => {
    onFiltersChange({
      categories: [],
      priceRange: [0, 200],
      minRating: 0,
    });
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 200 ||
    filters.minRating > 0;

  return (
    <Card className="glass border-glass-border sticky top-24">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 px-2 text-xs"
            >
              Reset All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Category</Label>
          <div className="space-y-2">
            {availableCategories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                />
                <label
                  htmlFor={`category-${category}`}
                  className="text-sm cursor-pointer hover:text-primary transition-colors"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">
            Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
          </Label>
          <Slider
            min={0}
            max={200}
            step={5}
            value={filters.priceRange}
            onValueChange={handlePriceRangeChange}
            className="w-full"
          />
        </div>

        {/* Rating Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Minimum Rating</Label>
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <Checkbox
                  id={`rating-${rating}`}
                  checked={filters.minRating === rating}
                  onCheckedChange={() =>
                    handleRatingChange(filters.minRating === rating ? 0 : rating)
                  }
                />
                <label
                  htmlFor={`rating-${rating}`}
                  className="text-sm cursor-pointer hover:text-primary transition-colors flex items-center"
                >
                  {rating}+ ⭐
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Active Filters Display Component
interface ActiveFiltersProps {
  filters: ProductFiltersState;
  onRemoveCategory: (category: string) => void;
  onRemovePriceRange: () => void;
  onRemoveRating: () => void;
  onClearAll: () => void;
}

export const ActiveFilters = ({
  filters,
  onRemoveCategory,
  onRemovePriceRange,
  onRemoveRating,
  onClearAll,
}: ActiveFiltersProps) => {
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 200 ||
    filters.minRating > 0;

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-sm text-muted-foreground">Active filters:</span>
      
      {filters.categories.map((category) => (
        <Badge
          key={category}
          variant="secondary"
          className="glass cursor-pointer hover:bg-destructive/20 transition-colors"
          onClick={() => onRemoveCategory(category)}
        >
          {category}
          <X className="w-3 h-3 ml-1" />
        </Badge>
      ))}

      {(filters.priceRange[0] > 0 || filters.priceRange[1] < 200) && (
        <Badge
          variant="secondary"
          className="glass cursor-pointer hover:bg-destructive/20 transition-colors"
          onClick={onRemovePriceRange}
        >
          ${filters.priceRange[0]} - ${filters.priceRange[1]}
          <X className="w-3 h-3 ml-1" />
        </Badge>
      )}

      {filters.minRating > 0 && (
        <Badge
          variant="secondary"
          className="glass cursor-pointer hover:bg-destructive/20 transition-colors"
          onClick={onRemoveRating}
        >
          {filters.minRating}+ ⭐
          <X className="w-3 h-3 ml-1" />
        </Badge>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-7 px-2 text-xs"
      >
        Clear All
      </Button>
    </div>
  );
};
