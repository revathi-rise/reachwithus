import React, { useEffect, useRef, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import {
  User as UserIcon,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  LogOut,
  ShieldCheck,
  Mail,
  Phone,
  Layers,
  AlertTriangle,
  RefreshCw,
  Camera,
} from 'lucide-react';
import { Post } from '../types';
import { request, uploadImage } from '../api';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';

async function createCroppedFile(imageSrc: string, pixels: Area, name: string): Promise<File> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const loaded = new Image();
    loaded.onload = () => resolve(loaded);
    loaded.onerror = reject;
    loaded.src = imageSrc;
  });
  const canvas = document.createElement('canvas');
  canvas.width = pixels.width;
  canvas.height = pixels.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not prepare the image crop');
  context.drawImage(image, pixels.x, pixels.y, pixels.width, pixels.height, 0, 0, pixels.width, pixels.height);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => (result ? resolve(result) : reject(new Error('Could not create cropped image'))), 'image/jpeg', 0.9);
  });
  return new File([blob], name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
}

interface ProfileScreenProps {
  onOpenAuth: () => void;
  onOpenSubscription: () => void;
  onSelectPost: (post: Post) => void;
}

export default function ProfileScreen({
  onOpenAuth,
  onOpenSubscription,
  onSelectPost,
}: ProfileScreenProps) {
  const { user, token, logout } = useAuth();
  const { isSubscribed, status } = useSubscription();

  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarToCrop, setAvatarToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [viewingAvatar, setViewingAvatar] = useState(false);
  const cropFileName = useRef('profile-image.jpg');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { refreshUser: refreshAuthUser } = useAuth();

  const fetchMyPosts = async () => {
    if (!token) {
      setLoadingPosts(false);
      return;
    }
    try {
      setLoadingPosts(true);
      const data = await request<Post[]>('/posts/my-posts');
      setMyPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, [token]);

  const handleAvatarSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !token) return;
    cropFileName.current = file.name;
    const reader = new FileReader();
    reader.onload = () => setAvatarToCrop(reader.result as string);
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleAvatarUpload = async () => {
    if (!avatarToCrop || !croppedAreaPixels || !token) return;
    try {
      setUploadingAvatar(true);
      const croppedFile = await createCroppedFile(avatarToCrop, croppedAreaPixels, cropFileName.current);
      const uploaded = await uploadImage(croppedFile);
      await request('/auth/profile', { method: 'PUT', body: JSON.stringify({ avatarUrl: uploaded.url }) });
      await refreshAuthUser();
      setAvatarToCrop(null);
    } catch (err: any) {
      alert(err.message || 'Profile image upload failed');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (!token || !user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#0b101b]">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/30">
          <UserIcon className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-white">Sign In to Your Account</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
          Access your requirement postings, track admin approvals, and manage your ₹10/month subscription pass.
        </p>
        <button
          onClick={onOpenAuth}
          className="mt-5 px-6 py-2.5 rounded-xl bg-[#af0891] hover:bg-[#e250e9] text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const filteredPosts = myPosts.filter((p) => {
    if (activeFilter === 'ALL') return true;
    return p.status === activeFilter;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0b101b]">
      {/* Header */}
      <header className="glass-header px-5 py-4 shrink-0 flex items-center justify-between">
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-indigo-400" />
          <span>My Profile & Requirements</span>
        </h2>

        <button
          onClick={logout}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* User Card */}
        <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="flex shrink-0 flex-col items-center gap-1.5">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-slate-700 shadow-md">
                {user.avatarUrl ? (
                  <button type="button" onClick={() => setViewingAvatar(true)} className="h-full w-full cursor-zoom-in">
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  </button>
                ) : (
                  <span className="w-full h-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold text-lg flex items-center justify-center">
                    {user.name[0].toUpperCase()}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="flex items-center gap-1 rounded-lg bg-[#af0891] px-2 py-1 text-[10px] font-bold text-white hover:bg-[#e250e9] disabled:opacity-60"
              >
                <Camera className="h-3 w-3" />
                {uploadingAvatar ? 'Uploading...' : user.avatarUrl ? 'Change photo' : 'Upload photo'}
              </button>
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarSelected} className="hidden" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate">{user.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
              {user.phone && (
                <p className="text-[11px] text-indigo-400 font-mono mt-0.5">{user.phone}</p>
              )}
            </div>
          </div>

          {/* Subscription Banner inside profile */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-indigo-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  {isSubscribed ? '₹10 VIP Pass Active' : 'Free Standard Plan'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {isSubscribed ? `${status?.daysRemaining ?? 30} days of contact reveals remaining` : 'Phone numbers masked on discovery feed'}
                </span>
              </div>
            </div>

            {!isSubscribed && (
              <button
                onClick={onOpenSubscription}
                className="px-3 py-1.5 rounded-xl bg-[#af0891] hover:bg-[#e250e9] text-white text-[11px] font-bold transition-all shadow-sm shrink-0"
              >
                Upgrade ₹10
              </button>
            )}
          </div>
        </div>

        {/* My Posts Section */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              My Requirements ({myPosts.length})
            </h3>
            <button
              onClick={fetchMyPosts}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all ${
                  activeFilter === tab
                    ? 'bg-[#af0891] text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab}
              </button>
            ))}
          </div>

          {/* Post Items */}
          {loadingPosts ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading your requirements...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-8 text-center glass-card rounded-2xl border border-slate-800 text-xs text-slate-400">
              No requirements found under this tab.
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => onSelectPost(post)}
                className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-white line-clamp-1 flex-1">
                    {post.title}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                      post.status === 'PENDING'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : post.status === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {post.status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {post.description}
                </p>

                {/* If rejected, show reason */}
                {post.status === 'REJECTED' && post.rejectionReason && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] flex items-start gap-2 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">Moderation Feedback:</strong>
                      <span>{post.rejectionReason}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>{post.location} &bull; {post.budget || 'Flexible'}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {avatarToCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0d1322] p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Crop profile photo</h3>
              <button type="button" onClick={() => setAvatarToCrop(null)} className="text-xs text-slate-400 hover:text-white">Cancel</button>
            </div>
            <div className="relative h-72 overflow-hidden rounded-xl bg-black">
              <Cropper
                image={avatarToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
              />
            </div>
            <label className="mt-4 block text-xs text-slate-400">
              Zoom
              <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="mt-2 w-full accent-indigo-500" />
            </label>
            <button type="button" onClick={handleAvatarUpload} disabled={uploadingAvatar} className="mt-4 w-full rounded-xl bg-[#af0891] py-2.5 text-xs font-bold text-white hover:bg-[#e250e9] disabled:opacity-60">
              {uploadingAvatar ? 'Uploading...' : 'Crop and upload'}
            </button>
          </div>
        </div>
      )}
      {viewingAvatar && user.avatarUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={() => setViewingAvatar(false)}>
          <img src={user.avatarUrl} alt={user.name} className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain" />
        </div>
      )}
    </div>
  );
}
