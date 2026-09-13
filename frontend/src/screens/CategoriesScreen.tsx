import React, { useEffect, useState } from 'react';
import { Compass, Layers, ArrowRight, Briefcase, Code, Users, Factory, Building, ShoppingCart, Wrench } from 'lucide-react';
import { Category } from '../types';
import { request } from '../api';

interface CategoriesScreenProps {
  onSelectCategory: (categoryId: string) => void;
}

export default function CategoriesScreen({ onSelectCategory }: CategoriesScreenProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    request<Category[]>('/categories')
      .then((data) => setCategories(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0b101b]">
      {/* Header */}
      <header className="glass-header px-5 py-4 shrink-0">
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-400" />
          <span>Explore Categories</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Browse verified requirements categorized by industrial and business sectors.
        </p>
      </header>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading categories...</div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
                  style={{ backgroundColor: cat.color || '#4f46e5' }}
                >
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 max-w-[200px]">
                    {cat.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono font-bold text-slate-300 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                  {cat.postCount} {cat.postCount === 1 ? 'post' : 'posts'}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
