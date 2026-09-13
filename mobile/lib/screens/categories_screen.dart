import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/posts_provider.dart';

class CategoriesScreen extends StatelessWidget {
  final Function(int)? onTabChange;

  const CategoriesScreen({super.key, this.onTabChange});

  IconData _getCategoryIcon(String icon) {
    switch (icon.toLowerCase()) {
      case 'briefcase':
        return Icons.work_outline;
      case 'code':
        return Icons.code;
      case 'users':
        return Icons.people_outline;
      case 'factory':
        return Icons.precision_manufacturing_outlined;
      case 'tool':
        return Icons.build_outlined;
      case 'building':
        return Icons.apartment;
      case 'shopping-cart':
        return Icons.shopping_bag_outlined;
      default:
        return Icons.category_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    final postsProvider = Provider.of<PostsProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFF090D16),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'Explore Categories',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: postsProvider.categories.length,
        itemBuilder: (context, index) {
          final cat = postsProvider.categories[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            elevation: 1,
            color: const Color(0xFF111827),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(color: Colors.white.withOpacity(0.08)),
            ),
            child: InkWell(
              borderRadius: BorderRadius.circular(16),
              onTap: () {
                postsProvider.selectCategory(cat.id);
                if (onTabChange != null) {
                  onTabChange!(0); // Switch to Feed tab
                } else {
                  Navigator.pop(context);
                }
              },
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: cat.color.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: cat.color.withOpacity(0.3)),
                      ),
                      child: Icon(_getCategoryIcon(cat.icon), color: cat.color, size: 22),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            cat.name,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            cat.description,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.5),
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '${cat.postCount} posts',
                        style: const TextStyle(color: Colors.white70, fontSize: 11),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
