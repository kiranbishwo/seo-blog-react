export interface Author {
  id: number;
  username: string;
  name: string;
  bio: string;
  avatar_url: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  author_id: number;
  category_id: number;
  published_at: string;
  is_published: boolean;
  reading_time: number;
  author_name?: string;
  author_username?: string;
  author_bio?: string;
  author_avatar?: string;
  category_name?: string;
  category_slug?: string;
  tags?: Tag[];
}
