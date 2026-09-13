import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/post.dart';
import '../providers/auth_provider.dart';
import '../providers/subscription_provider.dart';
import '../providers/posts_provider.dart';
import 'subscription_screen.dart';

class PostDetailsScreen extends StatefulWidget {
  final Post post;

  const PostDetailsScreen({super.key, required this.post});

  @override
  State<PostDetailsScreen> createState() => _PostDetailsScreenState();
}

class _PostDetailsScreenState extends State<PostDetailsScreen> {
  String? _unlockedPhone;
  bool _revealing = false;
  int _selectedImageIndex = 0;

  @override
  void initState() {
    super.initState();
    _unlockedPhone = widget.post.contactPhone;
  }

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

  void _handleReveal() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final sub = Provider.of<SubscriptionProvider>(context, listen: false);
    final posts = Provider.of<PostsProvider>(context, listen: false);

    if (!auth.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please log in from Profile to unlock contacts.')),
      );
      return;
    }

    if (!sub.isSubscribed) {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const SubscriptionScreen()),
      );
      return;
    }

    setState(() => _revealing = true);
    try {
      final phone = await posts.revealContact(widget.post.id);
      setState(() => _unlockedPhone = phone);
    } catch (err) {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const SubscriptionScreen()),
      );
    } finally {
      setState(() => _revealing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final sub = Provider.of<SubscriptionProvider>(context);
    final isUnlocked = (sub.isSubscribed && _unlockedPhone != null) || _unlockedPhone != null;

    return Scaffold(
      backgroundColor: const Color(0xFF090D16),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'Requirement Details',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Category & Date Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                if (widget.post.category != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: widget.post.category!.color.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: widget.post.category!.color.withOpacity(0.3)),
                    ),
                    child: Text(
                      widget.post.category!.name,
                      style: TextStyle(
                        color: widget.post.category!.color,
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                      ),
                    ),
                  ),
                Text(
                  '${widget.post.createdAt.day}/${widget.post.createdAt.month}/${widget.post.createdAt.year}',
                  style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Title
            Text(
              widget.post.title,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 18,
                height: 1.3,
              ),
            ),

            const SizedBox(height: 12),

            // Location & Budget
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF111827),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.white.withOpacity(0.08)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.location_on, size: 14, color: Color(0xFFC084FC)),
                      const SizedBox(width: 4),
                      Text(
                        widget.post.location,
                        style: const TextStyle(color: Colors.white, fontSize: 12),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF59E0B).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.currency_rupee, size: 14, color: Color(0xFFF59E0B)),
                      const SizedBox(width: 2),
                      Text(
                        widget.post.budget,
                        style: const TextStyle(
                          color: Color(0xFFFBBF24),
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            // Image Showcase & Gallery
            if (widget.post.images.isNotEmpty) ...[
              const SizedBox(height: 16),
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: AspectRatio(
                  aspectRatio: 16 / 9,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      Image.network(
                        widget.post.images[_selectedImageIndex].url,
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
                            child: Icon(Icons.broken_image, color: Colors.grey, size: 36),
                          ),
                        ),
                      ),
                      Positioned(
                        top: 10,
                        right: 10,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.7),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: Colors.white24, width: 0.5),
                          ),
                          child: Text(
                            '${_selectedImageIndex + 1} / ${widget.post.images.length}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              if (widget.post.images.length > 1) ...[
                const SizedBox(height: 10),
                SizedBox(
                  height: 56,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: widget.post.images.length,
                    itemBuilder: (context, idx) {
                      final isSelected = idx == _selectedImageIndex;
                      return GestureDetector(
                        onTap: () => setState(() => _selectedImageIndex = idx),
                        child: Container(
                          width: 56,
                          margin: const EdgeInsets.only(right: 10),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isSelected ? const Color(0xFF9333EA) : Colors.white.withOpacity(0.1),
                              width: isSelected ? 2.5 : 1,
                            ),
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.network(
                              widget.post.images[idx].url,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(
                                color: const Color(0xFF1E293B),
                                child: const Icon(Icons.image, size: 18, color: Colors.grey),
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ],

            const SizedBox(height: 20),

            // Specifications Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.08)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'REQUIREMENT SPECIFICATIONS',
                    style: TextStyle(
                      color: Colors.white54,
                      fontWeight: FontWeight.bold,
                      fontSize: 10,
                      letterSpacing: 1.1,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    widget.post.description,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      height: 1.5,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Author Card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.08)),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: const Color(0xFF9333EA).withOpacity(0.2),
                    backgroundImage: (widget.post.author?.avatarUrl != null && widget.post.author!.avatarUrl!.isNotEmpty)
                        ? NetworkImage(widget.post.author!.avatarUrl!)
                        : null,
                    child: (widget.post.author?.avatarUrl == null || widget.post.author!.avatarUrl!.isEmpty)
                        ? Text(
                            widget.post.author?.name.isNotEmpty == true
                                ? widget.post.author!.name[0].toUpperCase()
                                : 'U',
                            style: const TextStyle(
                              color: Color(0xFFC084FC),
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          )
                        : null,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.post.author?.name ?? 'Verified Member',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
                        Text(
                          widget.post.author?.email ?? 'Direct Poster',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.5),
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3)),
                    ),
                    child: const Text(
                      'VERIFIED',
                      style: TextStyle(
                        color: Color(0xFF10B981),
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Protected Contact Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isUnlocked
                    ? const Color(0xFF10B981).withOpacity(0.1)
                    : const Color(0xFF9333EA).withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isUnlocked
                      ? const Color(0xFF10B981).withOpacity(0.3)
                      : const Color(0xFF9333EA).withOpacity(0.3),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(
                            isUnlocked ? Icons.verified_user : Icons.lock,
                            size: 18,
                            color: isUnlocked
                                ? const Color(0xFF10B981)
                                : const Color(0xFFF59E0B),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            isUnlocked ? 'Contact Unlocked' : 'Contact Details Protected',
                            style: TextStyle(
                              color: isUnlocked
                                  ? const Color(0xFF10B981)
                                  : Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF59E0B).withOpacity(0.2),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text(
                          '₹10 / mo',
                          style: TextStyle(
                            color: Color(0xFFF59E0B),
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    isUnlocked
                        ? 'You have unlimited access to verified requirement creators.'
                        : 'Contact numbers are masked to prevent spam. Unlock unlimited calls & WhatsApp for ₹10/month.',
                    style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 11),
                  ),
                  const SizedBox(height: 16),
                  if (isUnlocked)
                    Column(
                      children: [
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: Colors.black38,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFF10B981).withOpacity(0.2)),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            _unlockedPhone ?? widget.post.contactPhone ?? '',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.2,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: () => _launchCall(_unlockedPhone ?? ''),
                                icon: const Icon(Icons.call, size: 16),
                                label: const Text('Direct Call'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF10B981),
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12)),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: () => _launchWhatsApp(_unlockedPhone ?? ''),
                                icon: const Icon(Icons.chat, size: 16),
                                label: const Text('WhatsApp'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF059669),
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12)),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    )
                  else
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _revealing ? null : _handleReveal,
                        icon: _revealing
                            ? const SizedBox(
                                width: 14,
                                height: 14,
                                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                              )
                            : const Icon(Icons.stars, size: 16, color: Color(0xFFFBBF24)),
                        label: Text(
                          sub.isSubscribed ? 'Reveal Contact Number' : 'Unlock Contact for ₹10/month',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF9333EA),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
