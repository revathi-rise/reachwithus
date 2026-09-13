import 'package:flutter/material.dart';
import 'feed_screen.dart';
import 'categories_screen.dart';
import 'create_post_screen.dart';
import 'subscription_screen.dart';
import 'profile_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  void _onTabChange(int index) {
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      const FeedScreen(),
      CategoriesScreen(onTabChange: _onTabChange),
      CreatePostScreen(onTabChange: _onTabChange),
      const SubscriptionScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
        backgroundColor: Colors.transparent,
        indicatorColor: const Color(0xFF9333EA).withOpacity(0.25),
        elevation: 8,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined, color: Colors.grey),
            selectedIcon: Icon(Icons.home, color: Color(0xFFC084FC)),
            label: 'Feed',
          ),
          NavigationDestination(
            icon: Icon(Icons.explore_outlined, color: Colors.grey),
            selectedIcon: Icon(Icons.explore, color: Color(0xFFC084FC)),
            label: 'Explore',
          ),
          NavigationDestination(
            icon: Icon(Icons.add_circle_outline, color: Colors.grey),
            selectedIcon: Icon(Icons.add_circle, color: Color(0xFFC084FC)),
            label: 'Post',
          ),
          NavigationDestination(
            icon: Icon(Icons.stars_outlined, color: Colors.grey),
            selectedIcon: Icon(Icons.stars, color: Color(0xFFF59E0B)),
            label: 'VIP Pass',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline, color: Colors.grey),
            selectedIcon: Icon(Icons.person, color: Color(0xFFC084FC)),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
