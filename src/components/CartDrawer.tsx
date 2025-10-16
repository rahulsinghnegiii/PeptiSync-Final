import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Plus, Minus, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { OptimizedImage } from "@/components/OptimizedImage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useEscapeKey } from "@/hooks/useKeyboardShortcuts";
import { LiveRegion, useLiveAnnouncer } from "@/components/LiveRegion";

export const CartDrawer = () => {
  const [open, setOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { message: announcement, announce } = useLiveAnnouncer();
  
  const {
    cartItems,
    isLoading,
    totalItems,
    subtotal,
    shippingCost,
    total,
    updateQuantity,
    removeItem,
  } = useCart();

  // Close cart drawer with Escape key
  useEscapeKey(() => setOpen(false), open);
  
  // Close remove dialog with Escape key
  useEscapeKey(() => setItemToRemove(null), !!itemToRemove);

  // Announce cart changes to screen readers
  useEffect(() => {
    if (open && !isLoading) {
      announce(`Shopping cart opened. ${totalItems} ${totalItems === 1 ? 'item' : 'items'} in cart. Total: $${total.toFixed(2)}`);
    }
  }, [open, isLoading]);

  // Announce when items are updated
  useEffect(() => {
    if (updateQuantity.isSuccess) {
      announce('Cart quantity updated');
    }
  }, [updateQuantity.isSuccess]);

  // Announce when items are removed
  useEffect(() => {
    if (removeItem.isSuccess) {
      announce('Item removed from cart');
    }
  }, [removeItem.isSuccess]);

  const handleUpdateQuantity = (itemId: string, newQuantity: number, productId: string | null) => {
    if (newQuantity < 1) return;
    updateQuantity.mutate({ itemId, quantity: newQuantity, productId });
  };

  const handleRemoveClick = (itemId: string) => {
    setItemToRemove(itemId);
  };

  const confirmRemove = () => {
    if (itemToRemove) {
      removeItem.mutate(itemToRemove);
      setItemToRemove(null);
    }
  };

  const handleCheckout = () => {
    setOpen(false);
    navigate("/checkout");
  };

  const handleBrowseStore = () => {
    setOpen(false);
    navigate("/store");
  };

  // Calculate free shipping progress
  const freeShippingThreshold = 199;
  const shippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const amountUntilFreeShipping = Math.max(freeShippingThreshold - subtotal, 0);

  if (!user) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative"
            aria-label={`Shopping cart with ${totalItems} ${totalItems === 1 ? 'item' : 'items'}`}
          >
            <ShoppingCart className="w-5 h-5" aria-hidden="true" />
            {totalItems > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                aria-label={`${totalItems} items in cart`}
              >
                {totalItems}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto flex flex-col">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold text-gradient">Your Cart</SheetTitle>
          </SheetHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-20" role="status" aria-live="polite">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="sr-only">Loading cart items...</span>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center flex-1">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" aria-hidden="true" />
              <p className="text-lg text-muted-foreground mb-2">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mb-6">Add some peptides to get started!</p>
              <Button variant="hero" onClick={handleBrowseStore} aria-label="Browse store to add items">
                <Store className="w-4 h-4 mr-2" aria-hidden="true" />
                Browse Store
              </Button>
            </div>
          ) : (
            <div className="mt-8 space-y-6 flex-1 flex flex-col">
              {/* Free Shipping Progress Bar */}
              {subtotal < freeShippingThreshold && (
                <div className="glass border-glass-border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      {amountUntilFreeShipping > 0 
                        ? `Add $${amountUntilFreeShipping.toFixed(2)} for free shipping`
                        : "You qualify for free shipping!"}
                    </span>
                    <span className="font-semibold text-primary">
                      ${freeShippingThreshold}
                    </span>
                  </div>
                  <Progress value={shippingProgress} className="h-2" />
                </div>
              )}

              {subtotal >= freeShippingThreshold && (
                <div className="glass border-glass-border rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                      FREE SHIPPING
                    </Badge>
                    <span className="font-medium">You qualify for free shipping!</span>
                  </div>
                </div>
              )}

              {/* Cart Items */}
              <ul className="space-y-4 flex-1 overflow-y-auto" role="list" aria-label="Cart items">
                {cartItems.map((item) => (
                  <li key={item.id} className="glass border-glass-border rounded-lg p-4">
                    <div className="flex gap-4">
                      {item.product_image && (
                        <OptimizedImage
                          src={item.product_image} 
                          alt={`${item.product_name} product image`}
                          className="w-20 h-20 rounded-lg"
                          width={80}
                          height={80}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1 truncate">{item.product_name}</h3>
                        <p className="text-sm text-gradient font-bold mb-2">
                          ${item.product_price.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2" role="group" aria-label={`Quantity controls for ${item.product_name}`}>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.product_id)}
                            disabled={updateQuantity.isPending}
                            aria-label={`Decrease quantity of ${item.product_name}`}
                          >
                            <Minus className="w-3 h-3" aria-hidden="true" />
                          </Button>
                          <span className="w-8 text-center font-medium" aria-label={`Quantity: ${item.quantity}`}>
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.product_id)}
                            disabled={updateQuantity.isPending}
                            aria-label={`Increase quantity of ${item.product_name}`}
                          >
                            <Plus className="w-3 h-3" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveClick(item.id)}
                            disabled={removeItem.isPending}
                            aria-label={`Remove ${item.product_name} from cart`}
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Cart Summary */}
              <div className="glass border-glass-border rounded-lg p-6 space-y-4 mt-auto" role="region" aria-label="Cart summary">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold" aria-label={`Subtotal: $${subtotal.toFixed(2)}`}>
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-sm font-medium">
                    {shippingCost === 0 ? (
                      <span className="text-green-600 dark:text-green-400">FREE</span>
                    ) : (
                      `$${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="border-t border-glass-border pt-4">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-gradient" aria-label={`Total: $${total.toFixed(2)}`}>
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
                <Button 
                  variant="hero" 
                  className="w-full" 
                  size="lg"
                  onClick={handleCheckout}
                  aria-label={`Proceed to checkout with ${totalItems} items totaling $${total.toFixed(2)}`}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Remove Item Confirmation Dialog */}
      <AlertDialog open={!!itemToRemove} onOpenChange={(open) => !open && setItemToRemove(null)}>
        <AlertDialogContent role="alertdialog" aria-labelledby="remove-dialog-title" aria-describedby="remove-dialog-description">
          <AlertDialogHeader>
            <AlertDialogTitle id="remove-dialog-title">Remove item from cart?</AlertDialogTitle>
            <AlertDialogDescription id="remove-dialog-description">
              Are you sure you want to remove this item from your cart? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Live region for screen reader announcements */}
      <LiveRegion message={announcement} />
    </>
  );
};
