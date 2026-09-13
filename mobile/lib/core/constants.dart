import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

class AppConstants {
  // Use 10.0.2.2 for Android Emulator, localhost for Windows/Web/Desktop, or local IP
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:5000/api';
    }
    // For Android default emulator:
    return defaultTargetPlatform == TargetPlatform.android
        ? 'http://10.0.2.2:5000/api'
        : 'http://localhost:5000/api';
  }

  // App Theme Colors — matched to logo palette (purple/magenta + golden)
  static const Color primary = Color(0xFF9333EA);       // Purple (logo primary)
  static const Color primaryDark = Color(0xFF7E22CE);   // Deep Purple
  static const Color primaryLight = Color(0xFFC084FC);  // Light Purple
  static const Color primaryGlow = Color(0xFFC026D3);   // Magenta glow (logo text)
  static const Color accent = Color(0xFFF59E0B);        // Golden yellow (star)
  static const Color success = Color(0xFF10B981);
  static const Color error = Color(0xFFEF4444);
  static const Color backgroundDark = Color(0xFF090D16);
  static const Color cardDark = Color(0xFF111827);
  static const Color surfaceDark = Color(0xFF1E293B);
}
