import React, { useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider, useSubscription } from './context/SubscriptionContext';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import HomeScreen from './screens/HomeScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import CreatePostScreen from './screens/CreatePostScreen';
import SubscriptionScreen from './screens/SubscriptionScreen';
import ProfileScreen from './screens/ProfileScreen';
import Footer from './components/Footer';
import PostDetailsModal from './components/PostDetailsModal';
import SubscriptionModal from './components/SubscriptionModal';
import NotificationsModal from './components/NotificationsModal';
import AuthModal from './components/AuthModal';
import { Post } from './types';
import { X } from 'lucide-react';
import { request } from './api';
import { getPostShareUrl, getPostSlugFromPath } from './lib/postLinks';

function WebsiteApp() {
  const [currentTab, setCurrentTab] = useState<'feed' | 'categories' | 'subscription' | 'profile'>('feed');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sharedPost, setSharedPost] = useState<Post | null>(null);
  const [sharedPostLoading, setSharedPostLoading] = useState<boolean>(true);
  const sharedPostSlug = getPostSlugFromPath(window.location.pathname);

  const { isModalOpen: isSubModalOpen, closeModal: closeSubModal, openModal: openSubModal } = useSubscription();

  useEffect(() => {
    if (!sharedPostSlug) {
      setSharedPostLoading(false);
      return;
    }
    request<Post>(`/posts/slug/${sharedPostSlug}`)
      .then(setSharedPost)
      .catch(() => setSharedPost(null))
      .finally(() => setSharedPostLoading(false));
  }, [sharedPostSlug]);

  if (sharedPostSlug) {
    if (sharedPostLoading) {
      return <div className="min-h-screen bg-[#070b13] text-slate-300 flex items-center justify-center text-sm">Loading post...</div>;
    }
    if (!sharedPost) {
      return <div className="min-h-screen bg-[#070b13] text-slate-300 flex flex-col items-center justify-center gap-3 text-sm"><span>Post not found.</span><button onClick={() => { window.history.pushState({}, '', '/'); window.location.reload(); }} className="text-indigo-400 hover:text-indigo-300">Back to posts</button></div>;
    }
    return (
      <div className="min-h-screen bg-[#070b13]">
        <Navbar
          currentTab="feed"
          onChangeTab={() => window.location.assign('/')}
          onOpenPostModal={() => window.location.assign('/')}
          onOpenAuthModal={() => setIsAuthOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenSubscription={openSubModal}
          searchQuery=""
          onSearchChange={() => undefined}
          onSearchSubmit={(event) => {
            event.preventDefault();
            window.location.assign('/');
          }}
        />
        <PostDetailsModal
          post={sharedPost}
          fullPage
          onClose={() => {
            window.history.pushState({}, '', '/');
            window.location.reload();
          }}
          onAuthRequired={() => setIsAuthOpen(true)}
        />
        <Footer />
        <NotificationsModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
        />
        <SubscriptionModal
          isOpen={isSubModalOpen}
          onClose={closeSubModal}
          onAuthRequired={() => setIsAuthOpen(true)}
        />
      </div>
    );
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentTab('feed');
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentTab('feed');
  };

  const openPostDetailsPage = (post: Post) => {
    window.location.assign(getPostShareUrl(post));
  };

  const openUserPost = (post: Post) => {
    if (post.status === 'APPROVED') {
      openPostDetailsPage(post);
    } else {
      setSelectedPost(post);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col antialiased">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        onOpenPostModal={() => setIsPostModalOpen(true)}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSubscription={openSubModal}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Hero Banner (Shown on Feed Tab) */}
      {currentTab === 'feed' && (
        <HeroSection
          onOpenPostModal={() => setIsPostModalOpen(true)}
          onOpenSubscription={openSubModal}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          totalPosts={6}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'feed' && (
          <HomeScreen
            onSelectPost={openPostDetailsPage}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenSubscription={openSubModal}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
          />
        )}

        {currentTab === 'categories' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <CategoriesScreen onSelectCategory={handleCategorySelect} />
          </div>
        )}

        {currentTab === 'subscription' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <SubscriptionScreen onAuthRequired={() => setIsAuthOpen(true)} />
          </div>
        )}

        {currentTab === 'profile' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ProfileScreen
              onOpenAuth={() => setIsAuthOpen(true)}
              onOpenSubscription={openSubModal}
              onSelectPost={openUserPost}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <PostDetailsModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        onAuthRequired={() => setIsAuthOpen(true)}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <SubscriptionModal
        isOpen={isSubModalOpen}
        onClose={closeSubModal}
        onAuthRequired={() => setIsAuthOpen(true)}
      />

      {/* Post Requirement Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0d1322] border border-slate-800 rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold text-white">Post a Requirement</h3>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CreatePostScreen
                onSuccess={() => {
                  setIsPostModalOpen(false);
                  setCurrentTab('profile');
                }}
                onAuthRequired={() => {
                  setIsPostModalOpen(false);
                  setIsAuthOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <WebsiteApp />
      </SubscriptionProvider>
    </AuthProvider>
  );
}
