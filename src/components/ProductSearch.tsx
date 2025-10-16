import { useState, useEffect, useRef, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProducts } from "@/hooks/useProducts";
import { motion, AnimatePresence } from "framer-motion";

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
}

export const ProductSearch = forwardRef<HTMLInputElement, ProductSearchProps>(({
  value,
  onChange,
  onSearch,
}, ref) => {
  const [localValue, setLocalValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(value);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(localValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue]);

  // Fetch suggestions when debounced value changes
  const { data: suggestions = [] } = useProducts({
    searchQuery: debouncedValue,
  });

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
    setShowSuggestions(newValue.length > 0);
  };

  const handleSearch = () => {
    onSearch(localValue);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
    onSearch("");
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (productName: string) => {
    setLocalValue(productName);
    onChange(productName);
    onSearch(productName);
    setShowSuggestions(false);
  };

  const showSuggestionsDropdown =
    showSuggestions && debouncedValue.length > 0 && suggestions.length > 0;

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
        <Input
          ref={ref}
          type="text"
          placeholder="Search products..."
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => localValue.length > 0 && setShowSuggestions(true)}
          className="pl-10 pr-20 h-12 glass border-glass-border text-base"
          aria-label="Search products"
          aria-autocomplete="list"
          aria-controls={showSuggestionsDropdown ? "search-suggestions" : undefined}
          aria-expanded={showSuggestionsDropdown}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {localValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 w-8 p-0"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </Button>
          )}
          <Button
            variant="hero"
            size="sm"
            onClick={handleSearch}
            className="h-8 px-3"
            aria-label="Search products"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Search Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestionsDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full z-50"
          >
            <Card className="glass border-glass-border p-2 max-h-96 overflow-y-auto">
              <ul id="search-suggestions" role="listbox" className="space-y-1">
                {suggestions.slice(0, 5).map((product) => (
                  <li key={product.id} role="option">
                    <button
                      onClick={() => handleSuggestionClick(product.name)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-primary/10 transition-colors flex items-center gap-3"
                      aria-label={`${product.name}, $${product.price.toFixed(2)}`}
                    >
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt=""
                          className="w-10 h-10 object-cover rounded"
                          aria-hidden="true"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
              {suggestions.length > 5 && (
                <p className="text-xs text-muted-foreground text-center mt-2 pt-2 border-t border-glass-border" aria-live="polite">
                  +{suggestions.length - 5} more results
                </p>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ProductSearch.displayName = "ProductSearch";
