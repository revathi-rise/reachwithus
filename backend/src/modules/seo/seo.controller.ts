import { Controller, Get, Header } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostStatus } from '../../entities/post.entity';

@Controller('sitemap.xml')
export class SeoController {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @Header('Content-Type', 'application/xml; charset=utf-8')
  async getSitemap(): Promise<string> {
    const posts = await this.postRepository.find({
      where: { status: PostStatus.APPROVED },
      select: ['slug', 'title', 'updatedAt'],
      order: { updatedAt: 'DESC' },
    });
    const siteUrl = this.configService
      .get<string>('PUBLIC_SITE_URL', 'https://www.reachwithusnow.com')
      .replace(/\/$/, '');
    const urls = [
      this.urlEntry(`${siteUrl}/`, 'daily', '1.0'),
      this.urlEntry(`${siteUrl}/categories`, 'weekly', '0.8'),
      this.urlEntry(`${siteUrl}/terms-and-conditions`, 'yearly', '0.3'),
      this.urlEntry(`${siteUrl}/privacy-policy`, 'yearly', '0.3'),
      ...posts
        .filter((post) => post.slug)
        .map((post) => this.urlEntry(`${siteUrl}/post/${post.slug}`, 'weekly', '0.7', post.updatedAt)),
    ];

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
  }

  private urlEntry(url: string, changefreq: string, priority: string, updatedAt?: Date): string {
    const lastmod = updatedAt ? `\n    <lastmod>${updatedAt.toISOString()}</lastmod>` : '';
    return `  <url>\n    <loc>${this.escapeXml(url)}</loc>${lastmod}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  }

  private escapeXml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&apos;');
  }
}
