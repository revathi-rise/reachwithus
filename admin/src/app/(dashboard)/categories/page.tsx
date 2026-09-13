'use client';

import React, { useEffect, useState } from 'react';
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Layers,
  Sparkles,
  AlertCircle,
  Briefcase,
  Code,
  Users,
  Factory,
  Building,
  ShoppingCart,
  Wrench,
  Search,
} from 'lucide-react';
import { apiRequest, Category } from '@/lib/api';

const ICON_OPTIONS = [
  { label: 'Briefcase', value: 'briefcase', Icon: Briefcase },
  { label: 'Code & IT', value: 'code', Icon: Code },
  { label: 'Users & Talent', value: 'users', Icon: Users },
  { label: 'Factory & Industry', value: 'factory', Icon: Factory },
  { label: 'Building & Real Estate', value: 'building', Icon: Building },
  { label: 'Shopping & Bulk', value: 'shopping-cart', Icon: ShoppingCart },
  { label: 'Tools & Machinery', value: 'tool', Icon: Wrench },
];

const COLOR_PRESETS = [
  '#6366F1', // Indigo
  '#0EA5E9', // Sky Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#14B8A6', // Teal
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'briefcase',
    color: '#6366F1',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<Category[]>('/categories');
      setCategories(data);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: 'briefcase',
      color: '#6366F1',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || 'briefcase',
      color: cat.color || '#6366F1',
      isActive: cat.isActive,
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingCategory) {
        await apiRequest(`/categories/${editingCategory.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        setFeedback(`Category "${formData.name}" updated successfully.`);
      } else {
        await apiRequest('/categories', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        setFeedback(`Category "${formData.name}" created successfully.`);
      }
      setTimeout(() => setFeedback(null), 4000);
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;
    try {
      await apiRequest(`/categories/${cat.id}`, { method: 'DELETE' });
      setFeedback(`Category "${cat.name}" deleted.`);
      setTimeout(() => setFeedback(null), 4000);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Tags className="w-6 h-6 text-indigo-400" />
            <span>Category Directory & Taxonomies</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Organize requirements by industry sector, manage tags, customize visuals, and inspect active post volumes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <button
            onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-[#af0891] hover:bg-[#e250e9] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Category Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 mt-3 font-medium">Loading categories...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl border border-slate-800 text-center">
          <Tags className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">No Categories Match</h3>
          <p className="text-xs text-slate-400 mt-1">Try a different search term or add a new category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
                      style={{ backgroundColor: cat.color || '#6366F1' }}
                    >
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {cat.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono">/{cat.slug}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      cat.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {cat.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  <span className="font-bold text-white font-mono">{cat.postCount || 0}</span>
                  <span className="ml-1">active posts</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full border border-slate-700 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tags className="w-5 h-5 text-indigo-400" />
                <span>{editingCategory ? 'Edit Category' : 'Create New Category'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Healthcare & Medical Supplies"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. healthcare-medical-supplies"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description of this requirement category..."
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Color Presets */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Theme Color
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: col })}
                      className={`w-7 h-7 rounded-lg transition-transform ${
                        formData.color === col ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isActive" className="text-xs text-slate-300 font-medium">
                  Active (Visible on mobile app discovery filter)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-[#af0891] hover:bg-[#e250e9] text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
