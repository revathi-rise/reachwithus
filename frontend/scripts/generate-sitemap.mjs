import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const rootDir = resolve(import.meta.dirname, '..');
const publicDir = resolve(rootDir, 'public');
const sitemapPath = resolve(publicDir, 'sitemap.xml');
const siteUrl = 'https://www.reachwithusnow.com';
const staticUrls = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/categories', changefreq: 'weekly', priority: '0.8' },
  { path: '/terms-and-conditions', changefreq: 'yearly', priority: '0.3' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
];

function loadApiBaseUrl() {
  if (process.env.VITE_API_BASE_URL) return process.env.VITE_API_BASE_URL;

  for (const filename of ['.env.local', '.env']) {
    const envPath = resolve(rootDir, filename);
    if (!existsSync(envPath)) continue;
    const line = readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .find((value) => value.startsWith('VITE_API_BASE_URL='));
    if (line) return line.slice('VITE_API_BASE_URL='.length).trim();
  }

  return process.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
}

function slugifyTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70) || 'requirement';
}

function escapeXml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

async function fetchApprovedPosts() {
  const posts = [];
  let page = 1;
  let totalPages = 1;
  const apiBaseUrl = loadApiBaseUrl().replace(/\/$/, '');

  do {
    const response = await fetch(`${apiBaseUrl}/posts?status=APPROVED&page=${page}&limit=50`);
    if (!response.ok) throw new Error(`Posts API returned ${response.status}`);
    const data = await response.json();
    posts.push(...(data.items || []));
    totalPages = Number(data.totalPages) || 1;
    page += 1;
  } while (page <= totalPages);

  return posts;
}

function buildSitemap(posts) {
  const urls = staticUrls.map((entry) => `  <url>\n    <loc>${siteUrl}${entry.path}</loc>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`);
  const seenSlugs = new Set();

  for (const post of posts) {
    const slug = post.slug || slugifyTitle(post.title || 'requirement');
    if (seenSlugs.has(slug)) continue;
    seenSlugs.add(slug);
    urls.push(`  <url>\n    <loc>${siteUrl}/post/${escapeXml(slug)}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

try {
  const posts = await fetchApprovedPosts();
  writeFileSync(sitemapPath, buildSitemap(posts));
  console.log(`Generated sitemap with ${posts.length} approved posts.`);
} catch (error) {
  console.warn(`Could not fetch approved posts for sitemap: ${error.message}`);
  console.warn('Keeping the existing sitemap.xml.');
}
