import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  doc,
  getDoc,
  limit as limitQuery
} from "firebase/firestore";
import type { BlogPost } from "@/types/blog";

export function useBlogPosts(category?: string, limit?: number) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const postsRef = collection(db, "blog_posts");
        
        let q = query(
          postsRef,
          where("status", "==", "published"),
          orderBy("publishedAt", "desc")
        );

        if (category) {
          q = query(
            postsRef,
            where("status", "==", "published"),
            where("category", "==", category),
            orderBy("publishedAt", "desc")
          );
        }

        if (limit) {
          q = query(q, limitQuery(limit));
        }

        const snapshot = await getDocs(q);
        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BlogPost[];

        setPosts(postsData);
        setError(null);
      } catch (err) {
        console.error("Error fetching blog posts:", err);
        setError("Failed to load blog posts");
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [category, limit]);

  return { posts, loading, error };
}

export function useBlogPost(slug: string) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const postsRef = collection(db, "blog_posts");
        const q = query(
          postsRef,
          where("slug", "==", slug),
          where("status", "==", "published"),
          limitQuery(1)
        );

        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const postData = {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data()
          } as BlogPost;
          setPost(postData);
          setError(null);
        } else {
          setPost(null);
          setError("Post not found");
        }
      } catch (err) {
        console.error("Error fetching blog post:", err);
        setError("Failed to load blog post");
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  return { post, loading, error };
}

export function useBlogCategories() {
  const [categories, setCategories] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const postsRef = collection(db, "blog_posts");
        const q = query(
          postsRef,
          where("status", "==", "published")
        );

        const snapshot = await getDocs(q);
        const categoryCounts: { [key: string]: number } = {};

        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const category = data.category;
          if (category) {
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
          }
        });

        setCategories(categoryCounts);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategories({});
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading };
}

