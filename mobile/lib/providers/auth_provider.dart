import 'package:flutter/material.dart';
import '../core/api_service.dart';
import '../models/user.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  bool _isLoading = true;

  User? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null;

  AuthProvider() {
    initAuth();
  }

  Future<void> initAuth() async {
    _isLoading = true;
    notifyListeners();
    try {
      _user = await ApiService.instance.getMe();
    } catch (_) {
      _user = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await ApiService.instance.login(email, password);
      _user = User.fromJson(res['user']);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> register(String name, String email, String phone, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await ApiService.instance.register(name, email, phone, password);
      _user = User.fromJson(res['user']);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await ApiService.instance.clearToken();
    _user = null;
    notifyListeners();
  }

  Future<void> updateAvatar(String avatarUrl) async {
    _user = await ApiService.instance.updateProfile(avatarUrl: avatarUrl);
    notifyListeners();
  }

  // Fast Demo Login
  Future<void> loginDemo(bool subscribed) async {
    final email = subscribed ? 'vikram.sharma@example.com' : 'priya.patel@example.com';
    await login(email, 'User@123');
  }
}
