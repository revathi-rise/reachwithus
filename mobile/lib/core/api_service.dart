import 'dart:convert';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'constants.dart';
import '../models/user.dart';
import '../models/category.dart';
import '../models/post.dart';

class ApiService {
  static final ApiService instance = ApiService._internal();
  ApiService._internal();

  String? _token;

  Future<String?> getToken() async {
    if (_token != null) return _token;
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('reachwithus_token');
    return _token;
  }

  Future<void> setToken(String token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('reachwithus_token', token);
  }

  Future<void> clearToken() async {
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('reachwithus_token');
  }

  Map<String, String> _headers(String? token) {
    final headers = {'Content-Type': 'application/json'};
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  // Auth: Login
  Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await http.post(
      Uri.parse('${AppConstants.baseUrl}/auth/login'),
      headers: _headers(null),
      body: jsonEncode({'email': email, 'password': password}),
    );
    final data = jsonDecode(res.body);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      await setToken(data['accessToken']);
      return data;
    }
    throw Exception(data['message'] ?? 'Login failed');
  }

  // Auth: Register
  Future<Map<String, dynamic>> register(
      String name, String email, String phone, String password) async {
    final res = await http.post(
      Uri.parse('${AppConstants.baseUrl}/auth/register'),
      headers: _headers(null),
      body: jsonEncode({
        'name': name,
        'email': email,
        'phone': phone,
        'password': password,
      }),
    );
    final data = jsonDecode(res.body);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      await setToken(data['accessToken']);
      return data;
    }
    throw Exception(data['message'] ?? 'Registration failed');
  }

  // Auth: Me
  Future<User?> getMe() async {
    final token = await getToken();
    if (token == null) return null;
    final res = await http.get(
      Uri.parse('${AppConstants.baseUrl}/auth/me'),
      headers: _headers(token),
    );
    if (res.statusCode == 200) {
      return User.fromJson(jsonDecode(res.body));
    }
    return null;
  }

  // Categories
  Future<List<Category>> getCategories() async {
    final res = await http.get(Uri.parse('${AppConstants.baseUrl}/categories'));
    if (res.statusCode == 200) {
      final List list = jsonDecode(res.body);
      return list.map((c) => Category.fromJson(c)).toList();
    }
    return [];
  }

  // Posts Feed
  Future<List<Post>> getPosts({String? categoryId, String? search}) async {
    final token = await getToken();
    final query = <String, String>{};
    if (categoryId != null && categoryId.isNotEmpty) {
      query['categoryId'] = categoryId;
    }
    if (search != null && search.isNotEmpty) {
      query['search'] = search;
    }

    final uri = Uri.parse('${AppConstants.baseUrl}/posts').replace(queryParameters: query);
    final res = await http.get(uri, headers: _headers(token));

    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      final List items = data['items'] ?? [];
      return items.map((p) => Post.fromJson(p)).toList();
    }
    return [];
  }

  // Post Details
  Future<Post> getPostDetails(String id) async {
    final token = await getToken();
    final res = await http.get(
      Uri.parse('${AppConstants.baseUrl}/posts/$id'),
      headers: _headers(token),
    );
    if (res.statusCode == 200) {
      return Post.fromJson(jsonDecode(res.body));
    }
    throw Exception('Failed to load post details');
  }

  // Reveal Contact Number (Protected endpoint)
  Future<String> revealContact(String postId) async {
    final token = await getToken();
    if (token == null) throw Exception('Please log in to reveal contact numbers.');

    final res = await http.get(
      Uri.parse('${AppConstants.baseUrl}/posts/$postId/reveal-contact'),
      headers: _headers(token),
    );
    final data = jsonDecode(res.body);
    if (res.statusCode == 200) {
      return data['contactPhone'] ?? '';
    }
    throw Exception(data['message'] ?? 'Subscription required to reveal phone number');
  }

  // Toggle Like
  Future<Map<String, dynamic>> toggleLike(String postId) async {
    final token = await getToken();
    final res = await http.post(
      Uri.parse('${AppConstants.baseUrl}/posts/$postId/like'),
      headers: _headers(token),
    );
    return jsonDecode(res.body);
  }

  // Share Post
  Future<void> sharePost(String postId) async {
    await http.post(Uri.parse('${AppConstants.baseUrl}/posts/$postId/share'));
  }

  // Create Post
  Future<String> uploadImage(XFile image) async {
    final token = await getToken();
    if (token == null) throw Exception('Please sign in before uploading an image');

    final request = http.MultipartRequest(
      'POST',
      Uri.parse('${AppConstants.baseUrl}/uploads/image'),
    );
    request.headers['Authorization'] = 'Bearer $token';
    request.files.add(http.MultipartFile.fromBytes(
      'file',
      await image.readAsBytes(),
      filename: image.name,
    ));

    final response = await request.send();
    final body = await response.stream.bytesToString();
    final data = body.isNotEmpty ? jsonDecode(body) : <String, dynamic>{};
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data['url'] as String;
    }
    final message = data['message'] ?? 'Image upload failed';
    throw Exception(message is List ? message.join(', ') : message.toString());
  }

  Future<User> updateProfile({String? avatarUrl}) async {
    final token = await getToken();
    final res = await http.put(
      Uri.parse('${AppConstants.baseUrl}/auth/profile'),
      headers: _headers(token),
      body: jsonEncode({'avatarUrl': avatarUrl}),
    );
    final data = jsonDecode(res.body);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return User.fromJson(data);
    }
    throw Exception(data['message'] ?? 'Profile update failed');
  }

  Future<Post> createPost({
    required String title,
    required String description,
    required String categoryId,
    required String location,
    required String budget,
    required String contactPhone,
    List<String>? imageUrls,
  }) async {
    final token = await getToken();
    final res = await http.post(
      Uri.parse('${AppConstants.baseUrl}/posts'),
      headers: _headers(token),
      body: jsonEncode({
        'title': title,
        'description': description,
        'categoryId': categoryId,
        'location': location,
        'budget': budget,
        'contactPhone': contactPhone,
        'imageUrls': imageUrls,
      }),
    );
    final data = jsonDecode(res.body);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return Post.fromJson(data);
    }
    throw Exception(data['message'] ?? 'Failed to submit requirement');
  }

  // My Posts
  Future<List<Post>> getMyPosts() async {
    final token = await getToken();
    if (token == null) return [];
    final res = await http.get(
      Uri.parse('${AppConstants.baseUrl}/posts/my'),
      headers: _headers(token),
    );
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      final List items = data['items'] ?? [];
      return items.map((p) => Post.fromJson(p)).toList();
    }
    return [];
  }

  // My Subscription Status
  Future<Map<String, dynamic>> getMySubscription() async {
    final token = await getToken();
    if (token == null) return {'hasActiveSubscription': false, 'daysRemaining': 0};
    final res = await http.get(
      Uri.parse('${AppConstants.baseUrl}/subscriptions/my-status'),
      headers: _headers(token),
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    }
    return {'hasActiveSubscription': false, 'daysRemaining': 0};
  }

  // Simulate ₹10 Sandbox Payment
  Future<Map<String, dynamic>> simulateSandboxPayment() async {
    final token = await getToken();
    final res = await http.post(
      Uri.parse('${AppConstants.baseUrl}/payments/simulate-sandbox'),
      headers: _headers(token),
    );
    final data = jsonDecode(res.body);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return data;
    }
    throw Exception(data['message'] ?? 'Payment simulation failed');
  }
}
