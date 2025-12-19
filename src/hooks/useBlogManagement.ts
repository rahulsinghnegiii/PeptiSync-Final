import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  where
} from "firebase/firestore";
import { toast } from "sonner";
import type { BlogPost, BlogPostFormData } from "@/types/blog";
import { generateSlug } from "@/lib/blogUtils";

/**
 * Hook to fetch all blog posts (including drafts) for admin
 */
export function useAllBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const postsRef = collection(db, "blog_posts");
      const q = query(postsRef, orderBy("updatedAt", "desc"));
      
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

  useEffect(() => {
    fetchPosts();
  }, []);

  return { posts, loading, error, refetch: fetchPosts };
}

/**
 * Hook to create a new blog post
 */
export function useCreateBlogPost() {
  const [creating, setCreating] = useState(false);

  const createPost = async (data: BlogPostFormData) => {
    setCreating(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("You must be logged in to create a post");
        return false;
      }

      const postsRef = collection(db, "blog_posts");
      
      // Generate slug if not provided
      const slug = data.slug || generateSlug(data.title);
      
      // Check if slug already exists
      const existingPostQuery = query(postsRef, where("slug", "==", slug));
      const existingPosts = await getDocs(existingPostQuery);
      
      if (!existingPosts.empty) {
        toast.error("A post with this slug already exists. Please use a different title or slug.");
        return false;
      }

      const now = Timestamp.now();
      const postData = {
        ...data,
        slug,
        author: user.displayName || user.email?.split('@')[0] || 'Admin',
        authorId: user.uid,
        publishedAt: data.status === 'published' ? now : null,
        createdAt: now,
        updatedAt: now,
        views: 0,
        likes: 0,
      };

      await addDoc(postsRef, postData);
      toast.success(`Post ${data.status === 'published' ? 'published' : 'saved as draft'} successfully!`);
      return true;
    } catch (error) {
      console.error("Error creating blog post:", error);
      toast.error("Failed to create post. Please try again.");
      return false;
    } finally {
      setCreating(false);
    }
  };

  return { createPost, creating };
}

/**
 * Hook to update an existing blog post
 */
export function useUpdateBlogPost() {
  const [updating, setUpdating] = useState(false);

  const updatePost = async (postId: string, data: BlogPostFormData, currentStatus: 'draft' | 'published') => {
    setUpdating(true);
    try {
      const postRef = doc(db, "blog_posts", postId);
      
      // Generate slug if title changed
      const slug = data.slug || generateSlug(data.title);
      
      // Check if slug already exists (excluding current post)
      const postsRef = collection(db, "blog_posts");
      const existingPostQuery = query(postsRef, where("slug", "==", slug));
      const existingPosts = await getDocs(existingPostQuery);
      
      const duplicateSlug = existingPosts.docs.some(doc => doc.id !== postId);
      if (duplicateSlug) {
        toast.error("A post with this slug already exists. Please use a different title or slug.");
        return false;
      }

      const now = Timestamp.now();
      const updateData: any = {
        ...data,
        slug,
        updatedAt: now,
      };

      // If changing from draft to published, set publishedAt
      if (currentStatus === 'draft' && data.status === 'published') {
        updateData.publishedAt = now;
      }

      await updateDoc(postRef, updateData);
      toast.success("Post updated successfully!");
      return true;
    } catch (error) {
      console.error("Error updating blog post:", error);
      toast.error("Failed to update post. Please try again.");
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return { updatePost, updating };
}

/**
 * Hook to delete a blog post
 */
export function useDeleteBlogPost() {
  const [deleting, setDeleting] = useState(false);

  const deletePost = async (postId: string) => {
    setDeleting(true);
    try {
      const postRef = doc(db, "blog_posts", postId);
      await deleteDoc(postRef);
      toast.success("Post deleted successfully!");
      return true;
    } catch (error) {
      console.error("Error deleting blog post:", error);
      toast.error("Failed to delete post. Please try again.");
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return { deletePost, deleting };
}

/**
 * Hook to toggle post status (publish/unpublish)
 */
export function useTogglePostStatus() {
  const [toggling, setToggling] = useState(false);

  const toggleStatus = async (postId: string, currentStatus: 'draft' | 'published') => {
    setToggling(true);
    try {
      const postRef = doc(db, "blog_posts", postId);
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      const now = Timestamp.now();

      const updateData: any = {
        status: newStatus,
        updatedAt: now,
      };

      // If publishing, set publishedAt
      if (newStatus === 'published') {
        updateData.publishedAt = now;
      }

      await updateDoc(postRef, updateData);
      toast.success(`Post ${newStatus === 'published' ? 'published' : 'unpublished'} successfully!`);
      return true;
    } catch (error) {
      console.error("Error toggling post status:", error);
      toast.error("Failed to update post status. Please try again.");
      return false;
    } finally {
      setToggling(false);
    }
  };

  return { toggleStatus, toggling };
}

