import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Calendar, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { BlogPost } from "@/types/blog";

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

export const BlogCard = ({ post, featured = false }: BlogCardProps) => {
  const formattedDate = post.publishedAt?.toDate?.()?.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }) || "Recently";

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/blog/${post.slug}`}>
        <Card className={`glass border-glass-border h-full hover:shadow-neon transition-all duration-300 ${featured ? 'md:col-span-2' : ''}`}>
          {post.featuredImage && (
            <div className="relative overflow-hidden">
              <img 
                src={post.featuredImage} 
                alt={post.title}
                className={`w-full object-cover ${featured ? 'h-64' : 'h-48'}`}
              />
              <div className="absolute top-4 left-4">
                <Badge variant="secondary" className="capitalize">
                  {post.category}
                </Badge>
              </div>
            </div>
          )}
          
          <CardContent className="p-6">
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{post.author}</span>
              </div>
            </div>

            <h3 className={`font-bold mb-3 ${featured ? 'text-2xl' : 'text-xl'}`}>
              {post.title}
            </h3>
            
            <p className="text-muted-foreground line-clamp-3">
              {post.excerpt}
            </p>
          </CardContent>

          <CardFooter className="p-6 pt-0">
            <Button variant="ghost" className="group p-0">
              Read More
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
};

