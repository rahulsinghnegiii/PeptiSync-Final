import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LoadingFallback } from "@/components/LoadingFallback";
import { SkipNavigation } from "@/components/SkipNavigation";
import { ProtectedRoute, GuestOnly } from "@/components/ProtectedRoute";

// Export queryClient for use in other files (e.g., AuthContext for cache clearing)
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 2 minutes by default (reduced from 5 minutes)
      staleTime: 2 * 60 * 1000,
      // Keep unused data in cache for 5 minutes (reduced from 10 minutes to save memory)
      gcTime: 5 * 60 * 1000,
      // Retry failed requests once
      retry: 1,
      // Don't refetch on window focus for better performance
      refetchOnWindowFocus: false,
      // Refetch on mount only if data is stale
      refetchOnMount: true,
      // Don't refetch on reconnect by default
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      // Clear mutation cache immediately after completion
      gcTime: 0,
    },
  },
});

// Lazy load page components for code splitting
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Features = lazy(() => import("./pages/Features"));
const Store = lazy(() => import("./pages/Store"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Legal = lazy(() => import("./pages/Legal"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings = lazy(() => import("./pages/Settings"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Admin = lazy(() => import("./pages/Admin"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const UpdatePassword = lazy(() => import("./pages/UpdatePassword"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));

// Store cleanup interval ID for proper cleanup
let cacheCleanupInterval: NodeJS.Timeout | null = null;

// Periodic cache cleanup to prevent memory buildup
if (typeof window !== 'undefined') {
  // Clean up inactive queries every 5 minutes to prevent memory leaks (reduced from 10 minutes)
  cacheCleanupInterval = setInterval(() => {
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();
    
    // Remove queries that are inactive and past their gcTime
    queries.forEach(query => {
      if (query.getObserversCount() === 0) {
        // Query has no active observers, check if it's past gcTime
        const queryState = query.state;
        const dataUpdatedAt = queryState.dataUpdatedAt || 0;
        const gcTime = query.options.gcTime ?? 5 * 60 * 1000;
        
        if (Date.now() - dataUpdatedAt > gcTime) {
          queryCache.remove(query);
        }
      }
    });
  }, 5 * 60 * 1000); // Run every 5 minutes (reduced from 10)
}

// Export cleanup function for global cleanup
export const cleanupApp = () => {
  if (cacheCleanupInterval) {
    clearInterval(cacheCleanupInterval);
    cacheCleanupInterval = null;
  }
  
  // Clear all query caches
  queryClient.getQueryCache().clear();
  queryClient.getMutationCache().clear();
  
  // Stop memory manager
  import('@/lib/memoryManager').then(({ memoryManager }) => {
    memoryManager.stopMonitoring();
  }).catch(() => {
    // Ignore if module not available
  });
  
  // Clear performance metrics
  import('@/lib/queryPerformance').then(({ stopPerformanceMonitoring }) => {
    stopPerformanceMonitoring();
  }).catch(() => {
    // Ignore if module not available
  });
}

const App = () => {
  // Setup global cleanup on unmount
  useEffect(() => {
    // Cleanup function runs when app unmounts
    return () => {
      cleanupApp();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-background">
              <SkipNavigation />
              <Toaster />
              <Sonner />
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/store" element={<Store />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/legal" element={<Legal />} />
                  {/* Auth routes - Guest only */}
                  <Route path="/auth" element={<GuestOnly><Auth /></GuestOnly>} />
                  <Route path="/reset-password" element={<GuestOnly><ResetPassword /></GuestOnly>} />
                  <Route path="/update-password" element={<UpdatePassword />} />
                  {/* Protected routes - Require authentication */}
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
                  {/* Admin only routes */}
                  <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
                  {/* Public routes */}
                  <Route path="/store/:productId" element={<ProductDetail />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              </BrowserRouter>
            </div>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
