import React, { useEffect, useState } from 'react';
import {
  Layers,
  Sparkles,
  Filter,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Category, Post } from '../types';
import { request } from '../api';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';

interface HomeScreenProps {
  onSelectPost: (post: Post) => void;
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
  onOpenSubscription: () => void;
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  searchQuery: string;
}

export default function HomeScreen({
  onSelectPost,
  onOpenNotifications,
  onOpenAuth,
  onOpenSubscription,
  selectedCategory,
  onSelectCategory,
  searchQuery,
}: HomeScreenProps) {
  const { user, token } = useAuth();
  const { isSubscribed } = useSubscription();

  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchCategories = async () => {
    try {
      const data = await request<Category[]>('/categories');
      setCategories(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPosts = async () => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);

      const data = await request<{ items: Post[]; total: number }>(`/posts?${params.toString()}`);
      setPosts(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, searchQuery, isSubscribed]);

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Category Pills Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Filter by Industry Sector</span>
          </div>

          {selectedCategory && (
            <button
              onClick={() => onSelectCategory(null)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Clear Filter &times;
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => onSelectCategory(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === null
                ? 'bg-[#af0891] text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Sectors ({posts.length})
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? null : cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'text-white shadow-lg'
                    : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
                }`}
                style={{
                  backgroundColor: isSelected ? cat.color || '#4f46e5' : undefined,
                }}
              >
                <span>{cat.name}</span>
                {cat.postCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 text-white font-mono">
                    {cat.postCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed Section Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>
              {selectedCategoryObj ? selectedCategoryObj.name : 'Latest Active Requirements'}
            </span>
            <span className="text-xs font-mono font-normal text-slate-500">
              ({posts.length} verified posting{posts.length !== 1 ? 's' : ''})
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Requirements submitted by verified businesses across India.
          </p>
        </div>

        <button
          onClick={fetchPosts}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Responsive Multi-Column Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 mt-4 font-medium">Aggregating live requirement feed...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="py-20 text-center glass-card rounded-3xl p-8 border border-slate-800 space-y-3">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Requirements Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? `No postings match "${searchQuery}". Try searching for general terms like 'Steel', 'IT', or 'Supply'.`
              : 'There are no live posts currently listed in this category.'}
          </p>
          <button
            onClick={() => onSelectCategory(null)}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-indigo-400 transition-colors"
          >
            Show All Requirements
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onSelect={onSelectPost}
              onAuthRequired={onOpenAuth}
            />
          ))}
        </div>
      )}
    </div>
  );
}
