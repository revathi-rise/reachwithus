export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  avatarUrl?: string;
  isActive: boolean;
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
  createdAt: string;
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
  slug?: string;
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
  isFeatured: boolean;
  createdAt: string;
  author: User;
  category: Category;
  images: PostImage[];
}

export interface AdminStats {
  metrics: {
    totalUsers: number;
    activeSubscriptions: number;
    totalRevenueINR: number;
    pendingPosts: number;
    approvedPosts: number;
    rejectedPosts: number;
    totalLikes: number;
    totalCategories: number;
  };
  categoriesBreakdown: Array<{
    name: string;
    color: string;
    postCount: number;
  }>;
  recentPending: Post[];
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  paymentId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  amount: number;
  currency: string;
  user: User;
  createdAt: string;
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('reachwithus_admin_token');
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (err) {
    data = text;
  }

  if (!res.ok) {
    const errorMsg = data?.message || (typeof data === 'string' ? data : `API Error: ${res.status}`);
    throw new Error(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
  }

  return data as T;
}
