import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

export type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "rating-desc";

interface ProductSortProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export const ProductSort = ({ value, onChange }: ProductSortProps) => {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px] glass border-glass-border">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name-asc">Name (A-Z)</SelectItem>
          <SelectItem value="name-desc">Name (Z-A)</SelectItem>
          <SelectItem value="price-asc">Price (Low to High)</SelectItem>
          <SelectItem value="price-desc">Price (High to Low)</SelectItem>
          <SelectItem value="rating-desc">Rating (High to Low)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
