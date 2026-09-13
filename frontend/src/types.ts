export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  avatarUrl?: string;
  isActive: boolean;
  phoneVerified?: boolean;
  createdAt: string;
  subscription?: {
    status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
    startDate: string;
    endDate: string;
    amount: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  postCount: number;
}

export interface PostImage {
  id: string;
  url: string;
  filename?: string;
  isCover: boolean;
  order: number;
}

export interface Post {
  id: string;
  title: string;
  description: string;
  contactPhone?: string;
  maskedPhone?: string;
  isContactLocked?: boolean;
  location: string;
  budget: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string | null;
  viewsCount: number;
  likesCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isFeatured: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  category: Category;
  images: PostImage[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'POST_APPROVED' | 'POST_REJECTED' | 'SUBSCRIPTION_ACTIVATED' | 'LIKE' | 'GENERAL';
  isRead: boolean;
  createdAt: string;
  data?: any;
}
