import 'package:flutter/material.dart';
import '../core/api_service.dart';
import '../models/category.dart';
import '../models/post.dart';

class PostsProvider with ChangeNotifier {
  List<Post> _posts = [];
  List<Category> _categories = [];
  String? _selectedCategoryId;
  String _searchQuery = '';
  bool _isLoading = false;

  List<Post> get posts => _posts;
  List<Category> get categories => _categories;
  String? get selectedCategoryId => _selectedCategoryId;
  String get searchQuery => _searchQuery;
  bool get isLoading => _isLoading;

  Future<void> fetchCategories() async {
    try {
      _categories = await ApiService.instance.getCategories();
      notifyListeners();
    } catch (_) {}
  }

  Future<void> fetchPosts() async {
    _isLoading = true;
    notifyListeners();
    try {
      _posts = await ApiService.instance.getPosts(
        categoryId: _selectedCategoryId,
        search: _searchQuery,
      );
    } catch (_) {
      _posts = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void selectCategory(String? categoryId) {
    _selectedCategoryId = categoryId;
    fetchPosts();
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    fetchPosts();
  }

  Future<void> toggleLike(Post post) async {
    try {
      final res = await ApiService.instance.toggleLike(post.id);
      post.isLiked = res['liked'] ?? false;
      post.likesCount = res['likesCount'] ?? post.likesCount;
      notifyListeners();
    } catch (_) {}
  }

  Future<String> revealContact(String postId) async {
    final phone = await ApiService.instance.revealContact(postId);
    notifyListeners();
    return phone;
  }
}
