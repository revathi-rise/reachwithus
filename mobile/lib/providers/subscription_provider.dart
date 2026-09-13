import 'package:flutter/material.dart';
import '../core/api_service.dart';

class SubscriptionProvider with ChangeNotifier {
  bool _isSubscribed = false;
  int _daysRemaining = 0;
  bool _isLoading = false;

  bool get isSubscribed => _isSubscribed;
  int get daysRemaining => _daysRemaining;
  bool get isLoading => _isLoading;

  Future<void> refreshStatus() async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await ApiService.instance.getMySubscription();
      _isSubscribed = res['hasActiveSubscription'] == true;
      _daysRemaining = res['daysRemaining'] ?? 0;
    } catch (_) {
      _isSubscribed = false;
      _daysRemaining = 0;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> simulateSandboxPayment() async {
    _isLoading = true;
    notifyListeners();
    try {
      await ApiService.instance.simulateSandboxPayment();
      await refreshStatus();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
