import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/posts_provider.dart';
import '../providers/subscription_provider.dart';
import '../widgets/post_card.dart';
import 'subscription_screen.dart';

class FeedScreen extends StatefulWidget {
  const FeedScreen({super.key});

  @override
  State<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends State<FeedScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final p = Provider.of<PostsProvider>(context, listen: false);
      p.fetchCategories();
      p.fetchPosts();
      Provider.of<SubscriptionProvider>(context, listen: false).refreshStatus();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final postsProvider = Provider.of<PostsProvider>(context);
    final subProvider = Provider.of<SubscriptionProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFF090D16),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        titleSpacing: 16,
        title: Align(
          alignment: Alignment.centerLeft,
          child: Image.asset(
            'assets/images/logo.png',
            height: 34,
            fit: BoxFit.contain,
            errorBuilder: (context, error, stackTrace) {
              return Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF9333EA),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.layers, size: 18, color: Colors.white),
                  ),
                  const SizedBox(width: 8),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'ReachWithUs',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        'Requirements & Leads',
                        style: TextStyle(
                          fontSize: 10,
                          color: Color(0xFFC084FC),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ],
              );
            },
          ),
        ),
        actions: [
          if (subProvider.isSubscribed)
            Container(
              margin: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF10B981).withOpacity(0.4)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.stars, size: 12, color: Color(0xFF10B981)),
                  SizedBox(width: 4),
                  Text(
                    'VIP Active',
                    style: TextStyle(
                      color: Color(0xFF10B981),
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            )
          else
            TextButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const SubscriptionScreen()),
                );
              },
              icon: const Icon(Icons.stars, size: 14, color: Color(0xFFF59E0B)),
              label: const Text(
                '₹10/mo',
                style: TextStyle(
                  color: Color(0xFFF59E0B),
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ),
        ],
      ),
      body: Column(
        children: [
          // Search input
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: TextField(
              controller: _searchController,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                hintText: 'Search requirements, materials, cities...',
                hintStyle: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 13),
                prefixIcon: const Icon(Icons.search, color: Colors.grey, size: 20),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 16, color: Colors.grey),
                        onPressed: () {
                          _searchController.clear();
                          postsProvider.setSearchQuery('');
                        },
                      )
                    : null,
                filled: true,
                fillColor: const Color(0xFF111827),
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: Color(0xFF9333EA)),
                ),
              ),
              onSubmitted: (val) => postsProvider.setSearchQuery(val),
            ),
          ),

          // Horizontal Category Filter Chips
          SizedBox(
            height: 40,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    selected: postsProvider.selectedCategoryId == null,
                    label: const Text('All Categories'),
                    labelStyle: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: postsProvider.selectedCategoryId == null
                          ? Colors.white
                          : Colors.grey,
                    ),
                    backgroundColor: const Color(0xFF111827),
                    selectedColor: const Color(0xFF9333EA),
                    checkmarkColor: Colors.white,
                    side: BorderSide(color: Colors.white.withOpacity(0.08)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    onSelected: (_) => postsProvider.selectCategory(null),
                  ),
                ),
                ...postsProvider.categories.map((cat) {
                  final isSelected = postsProvider.selectedCategoryId == cat.id;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      selected: isSelected,
                      label: Text(cat.name),
                      labelStyle: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: isSelected ? Colors.white : Colors.grey,
                      ),
                      backgroundColor: const Color(0xFF111827),
                      selectedColor: cat.color,
                      checkmarkColor: Colors.white,
                      side: BorderSide(color: Colors.white.withOpacity(0.08)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      onSelected: (_) =>
                          postsProvider.selectCategory(isSelected ? null : cat.id),
                    ),
                  );
                }),
              ],
            ),
          ),

          const SizedBox(height: 8),

          // Posts Feed List
          Expanded(
            child: postsProvider.isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: Color(0xFF9333EA)),
                  )
                : postsProvider.posts.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.inventory_2_outlined,
                                size: 48, color: Colors.white.withOpacity(0.3)),
                            const SizedBox(height: 12),
                            const Text(
                              'No Requirements Found',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Try a different search query or category filter.',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.5),
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        color: const Color(0xFF9333EA),
                        backgroundColor: const Color(0xFF111827),
                        onRefresh: () => postsProvider.fetchPosts(),
                        child: ListView.builder(
                          padding: const EdgeInsets.only(bottom: 24),
                          itemCount: postsProvider.posts.length,
                          itemBuilder: (context, index) {
                            return PostCard(post: postsProvider.posts[index]);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
