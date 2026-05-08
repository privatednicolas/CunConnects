// Tipos base de PocketBase
export interface PBRecord {
  id: string;
  created: string;
  updated: string;
  collectionId: string;
  collectionName: string;
}

export interface Profile extends PBRecord {
  collectionName: 'users';
  email: string;
  username: string;
  full_name: string;
  avatar: string;
  banner: string;
  bio: string;
  city: string;
  website: string;
  twitter: string;
  linkedin: string;
  github: string;
  role: string;
  expand?: Record<string, unknown>;
}

export interface Project extends PBRecord {
  collectionName: 'projects';
  user: string;
  title: string;
  short_description: string;
  description: string;
  cover: string;
  video_url: string;
  github_url: string;
  demo_url: string;
  status: 'in_development' | 'launched';
  visibility: 'public' | 'private';
  likes_count: number;
  views_count: number;
  expand?: {
    user?: Profile;
    'project_tags_via_project'?: ProjectTag[];
    'project_likes_via_project'?: ProjectLike[];
  };
}

export interface Product extends PBRecord {
  collectionName: 'products';
  user: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  visibility: 'public' | 'private';
  images: string[];
  rating_avg: number;
  rating_count: number;
  sales_count: number;
  expand?: { user?: Profile };
}

export interface ProjectLike extends PBRecord {
  collectionName: 'project_likes';
  project: string;
  user: string;
}

export interface Comment extends PBRecord {
  collectionName: 'comments';
  project: string;
  user: string;
  content: string;
  expand?: { user?: Profile };
}

export interface Review extends PBRecord {
  collectionName: 'reviews';
  product: string;
  user: string;
  rating: number;
  content: string;
  expand?: { user?: Profile };
}

export interface Follow extends PBRecord {
  collectionName: 'follows';
  follower: string;
  following: string;
}

export interface ProjectTag extends PBRecord {
  collectionName: 'project_tags';
  project: string;
  tag: string;
}

export interface Notification extends PBRecord {
  collectionName: 'notifications';
  user: string;
  type: string;
  message: string;
  link: string;
  read: boolean;
}
