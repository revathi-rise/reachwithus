import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/post.dart';
import '../providers/auth_provider.dart';
import '../providers/subscription_provider.dart';
import '../providers/posts_provider.dart';
import '../screens/post_details_screen.dart';

class PostCard extends StatelessWidget {
  final Post post;

  const PostCard({super.key, required this.post});

  void _launchCall(String phone) async {
    final clean = phone.replaceAll(RegExp(r'\D'), '');
    final uri = Uri.parse('tel:$clean');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  void _launchWhatsApp(String phone) async {
    final clean = phone.replaceAll(RegExp(r'\D'), '');
    final uri = Uri.parse('https://wa.me/$clean');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final subProvider = Provider.of<SubscriptionProvider>(context);
    final postsProvider = Provider.of<PostsProvider>(context, listen: false);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    final isSubscribed = subProvider.isSubscribed;
    final isUnlocked = isSubscribed && post.contactPhone != null;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: Colors.white.withOpacity(0.08)),
      ),
      color: const Color(0xFF111827),
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => PostDetailsScreen(post: post),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header: Author & Category
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 16,
                        backgroundColor: const Color(0xFF9333EA).withOpacity(0.2),
                        backgroundImage: (post.author?.avatarUrl != null && post.author!.avatarUrl!.isNotEmpty)
                            ? NetworkImage(post.author!.avatarUrl!)
                            : null,
                        child: (post.author?.avatarUrl == null || post.author!.avatarUrl!.isEmpty)
                            ? Text(
                                post.author?.name.isNotEmpty == true
                                    ? post.author!.name[0].toUpperCase()
                                    : 'U',
                                style: const TextStyle(
                                  color: Color(0xFFC084FC),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              )
                            : null,
                      ),
                      const SizedBox(width: 8),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            post.author?.name ?? 'Verified Member',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                          Text(
                            '${post.createdAt.day}/${post.createdAt.month}/${post.createdAt.year}',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.4),
                              fontSize: 10,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  if (post.category != null)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: post.category!.color.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: post.category!.color.withOpacity(0.3)),
                      ),
                      child: Text(
                        post.category!.name,
                        style: TextStyle(
                          color: post.category!.color,
                          fontWeight: FontWeight.bold,
                          fontSize: 10,
                        ),
                      ),
                    ),
                ],
              ),

              const SizedBox(height: 12),

              // Title
              Text(
                post.title,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 15,
                  height: 1.25,
                ),
              ),

              const SizedBox(height: 6),

              // Description snippet
              Text(
                post.description,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: Colors.white.withOpacity(0.7),
                  fontSize: 12,
                  height: 1.35,
                ),
              ),

              // Images preview if available
              if (post.images.isNotEmpty) ...[
                const SizedBox(height: 12),
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: AspectRatio(
                    aspectRatio: 16 / 9,
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        Image.network(
                          post.images.first.url,
                          fit: BoxFit.cover,
                          loadingBuilder: (context, child, progress) {
                            if (progress == null) return child;
                            return Container(
                              color: const Color(0xFF1E293B),
                              child: Center(
                                child: CircularProgressIndicator(
                                  value: progress.expectedTotalBytes != null
                                      ? progress.cumulativeBytesLoaded / progress.expectedTotalBytes!
                                      : null,
                                  strokeWidth: 2,
                                  color: const Color(0xFF9333EA),
                                ),
                              ),
                            );
                          },
                          errorBuilder: (context, error, stackTrace) => Container(
                            color: const Color(0xFF1E293B),
                            child: const Center(
                              child: Icon(Icons.broken_image, color: Colors.grey, size: 28),
                            ),
                          ),
                        ),
                        if (post.images.length > 1)
                          Positioned(
                            bottom: 8,
                            right: 8,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.black.withOpacity(0.75),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: Colors.white24, width: 0.5),
                              ),
                              child: Text(
                                '+${post.images.length - 1} photos',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ],

              const SizedBox(height: 12),

              // Location & Budget Chips
              Wrap(
                spacing: 8,
                runSpacing: 4,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.location_on, size: 12, color: Colors.grey),
                        const SizedBox(width: 4),
                        Text(
                          post.location,
                          style: const TextStyle(color: Colors.white70, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF59E0B).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.3)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.currency_rupee, size: 12, color: Color(0xFFF59E0B)),
                        const SizedBox(width: 2),
                        Text(
                          post.budget,
                          style: const TextStyle(
                            color: Color(0xFFFBBF24),
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              // Protected Contact Section
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isUnlocked
                      ? const Color(0xFF10B981).withOpacity(0.1)
                      : const Color(0xFF9333EA).withOpacity(0.08),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isUnlocked
                        ? const Color(0xFF10B981).withOpacity(0.3)
                        : const Color(0xFF9333EA).withOpacity(0.2),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(
                          isUnlocked ? Icons.phone_enabled : Icons.lock,
                          size: 18,
                          color: isUnlocked
                              ? const Color(0xFF10B981)
                              : const Color(0xFFF59E0B),
                        ),
                        const SizedBox(width: 8),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              isUnlocked ? 'Contact Unlocked' : 'Contact Number',
                              style: TextStyle(
                                color: isUnlocked
                                    ? const Color(0xFF10B981)
                                    : Colors.white60,
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              isUnlocked
                                  ? (post.contactPhone ?? '+91 98765 43210')
                                  : (post.maskedPhone ?? '+91 98•••• •••••'),
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    if (isUnlocked)
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.call, color: Color(0xFF10B981), size: 20),
                            onPressed: () => _launchCall(post.contactPhone ?? ''),
                            visualDensity: VisualDensity.compact,
                          ),
                          IconButton(
                            icon: const Icon(Icons.chat, color: Color(0xFF10B981), size: 20),
                            onPressed: () => _launchWhatsApp(post.contactPhone ?? ''),
                            visualDensity: VisualDensity.compact,
                          ),
                        ],
                      )
                    else
                      ElevatedButton(
                        onPressed: () {
                          // Trigger contact reveal or subscription prompt
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => PostDetailsScreen(post: post),
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF9333EA),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          visualDensity: VisualDensity.compact,
                        ),
                        child: const Text('Unlock ₹10/mo'),
                      ),
                  ],
                ),
              ),

              const SizedBox(height: 12),

              // Footer: Likes & Shares
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      InkWell(
                        onTap: () {
                          if (authProvider.isAuthenticated) {
                            postsProvider.toggleLike(post);
                          }
                        },
                        borderRadius: BorderRadius.circular(8),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                          child: Row(
                            children: [
                              Icon(
                                post.isLiked ? Icons.favorite : Icons.favorite_border,
                                size: 16,
                                color: post.isLiked ? Colors.redAccent : Colors.grey,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '${post.likesCount}',
                                style: const TextStyle(color: Colors.grey, fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Row(
                        children: [
                          const Icon(Icons.share, size: 16, color: Colors.grey),
                          const SizedBox(width: 4),
                          Text(
                            '${post.sharesCount}',
                            style: const TextStyle(color: Colors.grey, fontSize: 12),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const Text(
                    'Details →',
                    style: TextStyle(
                      color: Color(0xFFC084FC),
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
