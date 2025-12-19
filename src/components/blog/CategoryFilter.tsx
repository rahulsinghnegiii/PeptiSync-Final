import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { BLOG_CATEGORIES } from "@/lib/constants";

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  categoryCounts?: { [key: string]: number };
}

export const CategoryFilter = ({ 
  selectedCategory, 
  onSelectCategory,
  categoryCounts = {}
}: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Badge
          variant={selectedCategory === null ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => onSelectCategory(null)}
        >
          All Posts
        </Badge>
      </motion.div>

      {BLOG_CATEGORIES.map((category) => {
        const count = categoryCounts[category.id] || 0;
        return (
          <motion.div 
            key={category.id}
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            <Badge
              variant={selectedCategory === category.id ? "default" : "outline"}
              className="cursor-pointer capitalize"
              onClick={() => onSelectCategory(category.id)}
            >
              {category.name} {count > 0 && `(${count})`}
            </Badge>
          </motion.div>
        );
      })}
    </div>
  );
};

