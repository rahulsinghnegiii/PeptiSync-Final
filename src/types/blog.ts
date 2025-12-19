import { Timestamp } from "firebase/firestore";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  authorId: string;
  category: string;
  tags: string[];
  featuredImage: string;
  publishedAt: Timestamp;
  updatedAt: Timestamp;
  status: 'draft' | 'published';
  views?: number;
  likes?: number;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount?: number;
}

export interface BlogPostFormData {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  featuredImage: string;
  status: 'draft' | 'published';
}

