import type { Plan, NotificationType } from "@prisma/client";

// Re-export Prisma enums for convenience
export { Plan, NotificationType };

// Extended User type (public profile shape)
export interface UserProfile {
  id: string;
  username: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  socialLinks: Record<string, string>;
  plan: Plan;
  createdAt: Date;
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
}

// Post with author info (for feed)
export interface PostWithAuthor {
  id: string;
  title: string;
  content: TipCardContent;
  imageUrl: string | null;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  createdAt: Date;
  user: {
    id: string;
    username: string;
    name: string | null;
    avatarUrl: string | null;
    plan: Plan;
  };
  tags: Array<{ tag: { id: string; name: string } }>;
  template: { id: string; name: string; layoutType: string } | null;
}

// The JSON content stored in Post.content
export interface TipCardContent {
  layoutType: LayoutType;
  background: BackgroundConfig;
  primaryColor: string;
  secondaryColor: string;
  fontFamily?: string;
  items: ContentItem[];
  branding?: BrandingConfig;
}

export type LayoutType =
  | "do-dont"
  | "before-after"
  | "bullet-list"
  | "quote"
  | "code-tip"
  | "comparison";

export interface BackgroundConfig {
  type: "solid" | "gradient";
  value: string; // hex color or gradient CSS string
}

export interface ContentItem {
  id: string;
  type: "text" | "code" | "bullet" | "do" | "dont" | "before" | "after";
  content: string;
  language?: string; // for code blocks
  label?: string;
}

export interface BrandingConfig {
  handle: string; // e.g. @username
  logoUrl?: string;
}

// API response shapes
export interface ApiSuccess<T = unknown> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: unknown;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

// Feed post — extends PostWithAuthor with per-user interaction state
export interface PostFeedItem extends PostWithAuthor {
  isLiked: boolean;
  isSaved: boolean;
}

// Comment with author info
export interface CommentWithAuthor {
  id: string;
  content: string;
  createdAt: Date | string;
  user: {
    id: string;
    username: string;
    name: string | null;
    avatarUrl: string | null;
  };
}
