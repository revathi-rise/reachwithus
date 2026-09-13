import { Post } from '../types';

export function slugifyPostTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70) || 'requirement';
}

export function getPostShareUrl(post: Post): string {
  return `${window.location.origin}/post/${slugifyPostTitle(post.title)}`;
}

export function getPostSlugFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/post\/([^/]+)$/i);
  return match?.[1] || null;
}