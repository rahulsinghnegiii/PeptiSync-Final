import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { BlogCard } from "@/components/blog/BlogCard";
import { CategoryFilter } from "@/components/blog/CategoryFilter";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BookOpen, Search } from "lucide-react";
import { useBlogPosts, useBlogCategories } from "@/hooks/useBlog";

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { posts, loading, error } = useBlogPosts(selectedCategory || undefined);
  const { categories } = useBlogCategories();

  // Filter posts by search query
  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      post.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const featuredPost = filteredPosts[0];
  const regularPosts = filteredPosts.slice(1);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main id="main-content" className="flex-grow pt-16">
        <PageHeader
          title="PeptiSync Blog"
          subtitle="Insights, tips, and updates about peptide tracking, optimization, and wellness"
          badge="Latest Articles"
          icon={<BookOpen className="w-4 h-4 text-primary" />}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Search and Filter */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-12 space-y-6"
          >
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex justify-center">
              <CategoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                categoryCounts={categories}
              />
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading articles...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="glass border-glass-border max-w-2xl mx-auto">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!loading && !error && filteredPosts.length === 0 && (
            <Card className="glass border-glass-border max-w-2xl mx-auto">
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? "Try adjusting your search terms" 
                    : "Check back soon for new content!"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Blog Posts */}
          {!loading && !error && filteredPosts.length > 0 && (
            <div className="space-y-12">
              {/* Featured Post */}
              {featuredPost && (
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-2xl font-bold mb-6">Featured Article</h2>
                  <BlogCard post={featuredPost} featured />
                </motion.div>
              )}

              {/* Regular Posts Grid */}
              {regularPosts.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {regularPosts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                      >
                        <BlogCard post={post} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Blog;

