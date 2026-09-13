import React, { useEffect, useState } from 'react';
import {
  PlusCircle,
  Image as ImageIcon,
  MapPin,
  IndianRupee,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  UploadCloud,
} from 'lucide-react';
import { Category } from '../types';
import { request, uploadImage } from '../api';
import { useAuth } from '../context/AuthContext';

interface CreatePostScreenProps {
  onSuccess: () => void;
  onAuthRequired: () => void;
}

export default function CreatePostScreen({ onSuccess, onAuthRequired }: CreatePostScreenProps) {
  const { user, token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [contactPhone, setContactPhone] = useState(user?.phone || '+91 98765 43210');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [professionalContentAccepted, setProfessionalContentAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    request<Category[]>('/categories')
      .then((cats) => {
        setCategories(cats);
        if (cats.length > 0) setCategoryId(cats[0].id);
      })
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    if (user?.phone) {
      setContactPhone(user.phone);
    }
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await uploadImage(file);
      setUploadedImages((prev) => [...prev, res.url]);
    } catch (err: any) {
      alert(err.message || 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      onAuthRequired();
      return;
    }
    if (!professionalContentAccepted) {
      setError('Please confirm that your requirement contains only lawful, professional content.');
      return;
    }
    setError(null);
    try {
      setSubmitting(true);
      await request('/posts', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          categoryId,
          location,
          budget,
          contactPhone,
          imageUrls: uploadedImages.length > 0 ? uploadedImages : undefined,
        }),
      });
      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        onSuccess();
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit requirement');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#0b101b]">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/30">
          <PlusCircle className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-white">Sign In to Post Requirements</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
          Post your sourcing requests, project tenders, or material needs. Verified suppliers will connect directly with you.
        </p>
        <button
          onClick={onAuthRequired}
          className="mt-5 px-6 py-2.5 rounded-xl bg-[#af0891] hover:bg-[#e250e9] text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  if (!user?.phoneVerified) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#0b101b]">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/30">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-white">Phone Approval Required</h2>
        <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
          Send <strong className="text-white">VERIFY</strong> by SMS from your registered mobile number to <strong className="text-indigo-300">9344603401</strong>. An administrator will verify your message before posting is enabled.
        </p>
        <a href="sms:9344603401?body=VERIFY" className="mt-5 px-6 py-2.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold">
          Send VERIFY message
        </a>
      </div>
    );
  }

  if (submittedSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#0b101b] animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-black text-white tracking-tight">
          Requirement Submitted!
        </h2>
        <p className="text-xs text-slate-300 mt-2 max-w-xs leading-relaxed">
          Your requirement has been sent to our moderation team for fast approval. You can track status in your profile.
        </p>
        <div className="mt-4 px-3 py-1.5 rounded-full bg-slate-900 text-slate-400 text-[11px] font-mono border border-slate-800">
          Status: PENDING MODERATION
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0b101b]">
      {/* Header */}
      <header className="glass-header px-5 py-3 shrink-0">
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-indigo-400" />
          <span>Post a Requirement</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Reach thousands of verified suppliers, agencies, and partners.
        </p>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
            Requirement Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Need 500 Tons of Structural Steel for Metro Project"
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
            Industry Category *
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Location & Budget Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Location / City *
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Mumbai, Pune, Pan-India"
                className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Budget / Price
            </label>
            <div className="relative">
              <IndianRupee className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="₹5 Lakhs / Flexible"
                className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Contact Phone (Protected) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Contact Phone Number *
            </label>
            <span className="text-[10px] text-indigo-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Masked on Public Feeds</span>
            </span>
          </div>
          <div className="relative">
            <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Your number is shown as <strong className="text-slate-300">+91 98•••• •••••</strong> to prevent spam. Only verified subscribers with active ₹10 pass can reveal and call you.
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
            Detailed Specifications *
          </label>
          <textarea
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe quantities, timeline, technical specs, payment terms, or certifications required..."
            className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        {/* Image Upload & Attachment */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            Requirement Photos / Docs (Optional)
          </label>

          {/* Device file input */}
          <div className="flex items-center gap-2">
            <label className="flex-1 p-3 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500/50 bg-slate-900/50 cursor-pointer flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
              <UploadCloud className="w-4 h-4 text-indigo-400" />
              <span>{uploading ? 'Uploading...' : 'Upload File from Device'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          {/* Thumbnails preview */}
          {uploadedImages.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
              {uploadedImages.map((url, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700 shrink-0">
                  <img src={url} alt="upload" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900/60 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={professionalContentAccepted}
            onChange={(e) => setProfessionalContentAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-indigo-500"
          />
          <span className="text-[11px] leading-5 text-slate-300">
            I confirm this requirement is lawful and professional. It does not contain illegal, fraudulent, abusive, hateful, sexually explicit, pornographic, obscene, exploitative, or otherwise inappropriate content, and I agree to the ReachWithUs Terms &amp; Conditions.
          </span>
        </label>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={submitting || !professionalContentAccepted}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#af0891] to-[#e250e9] hover:from-[#e250e9] hover:to-[#af0891] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 active:scale-[0.99]"
        >
          {submitting ? 'Submitting for Moderation...' : 'Submit Requirement for Approval'}
        </button>
      </form>
    </div>
  );
}
