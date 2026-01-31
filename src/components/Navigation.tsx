import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Lock, Home, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import { LoginPromptDialog } from "./LoginPromptDialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleVendorComparisonClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setShowLoginPrompt(true);
    }
  };

  const navItems = [
    { name: "Features", href: "/features", requiresAuth: false },
    { name: "Pricing", href: "/pricing", requiresAuth: false },
    { name: "About", href: "/about", requiresAuth: false },
    { name: "Blog", href: "/blog", requiresAuth: false },
    { name: "Vendor Comparison", href: "/vendor-comparison", requiresAuth: true },
    { name: "Download", href: "/download", requiresAuth: false },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-glass-border/30"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" aria-label="PeptiSync home">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <img 
                src="/logo.png" 
                alt="PeptiSync Logo" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-bold text-gradient">PeptiSync</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center space-x-8" role="list">
            {navItems.map((item) => (
              <motion.li key={item.name}>
                <Link
                  to={item.href}
                  onClick={item.requiresAuth ? handleVendorComparisonClick : undefined}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium flex items-center gap-1"
                >
                  {item.name}
                  {item.requiresAuth && !user && (
                    <Lock className="w-3 h-3 text-muted-foreground/50" />
                  )}
                </Link>
              </motion.li>
            ))}
          </ul>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <ThemeToggle />
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link to="/auth">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/auth">
                  <Button variant="hero" size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              <Menu size={24} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-[85vw] sm:w-[400px] p-0 flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4">
            <SheetTitle className="flex items-center gap-2 text-left">
              <img 
                src="/logo.png" 
                alt="PeptiSync Logo" 
                className="w-7 h-7 object-contain flex-shrink-0"
              />
              <span className="text-gradient truncate">PeptiSync</span>
            </SheetTitle>
            <SheetDescription className="text-left">
              Navigate to any section
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col flex-1 overflow-hidden px-6">
            {/* User Section */}
            {user && (
              <>
                <div className="p-3 rounded-lg bg-muted/50 mb-4 flex-shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.displayName || user.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
                <Separator className="mb-4 flex-shrink-0" />
              </>
            )}

            {/* Navigation Links - Scrollable */}
            <nav className="flex-1 overflow-y-auto -mx-2 px-2 space-y-1">
              {user && (
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Home className="w-5 h-5 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                    <span className="font-medium truncate">Dashboard</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                </Link>
              )}

              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={(e) => {
                    if (item.requiresAuth) {
                      handleVendorComparisonClick(e);
                    }
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-medium truncate">{item.name}</span>
                    {item.requiresAuth && !user && (
                      <Lock className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                </Link>
              ))}
            </nav>

            {/* Bottom Action Buttons */}
            <div className="space-y-2 pt-4 pb-6 border-t flex-shrink-0">
              {user ? (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full" 
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                >
                  Sign Out
                </Button>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setIsOpen(false)} className="block">
                    <Button variant="outline" size="lg" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth" onClick={() => setIsOpen(false)} className="block">
                    <Button variant="hero" size="lg" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Login Prompt Dialog */}
      <LoginPromptDialog
        open={showLoginPrompt}
        onOpenChange={setShowLoginPrompt}
        featureName="Vendor Comparison"
      />
    </motion.nav>
  );
};

export default Navigation;