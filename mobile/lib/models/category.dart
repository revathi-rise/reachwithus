import 'package:flutter/material.dart';

class Category {
  final String id;
  final String name;
  final String slug;
  final String description;
  final String icon;
  final String colorHex;
  final bool isActive;
  final int postCount;

  Category({
    required this.id,
    required this.name,
    required this.slug,
    required this.description,
    required this.icon,
    required this.colorHex,
    required this.isActive,
    required this.postCount,
  });

  Color get color {
    try {
      final hex = colorHex.replaceAll('#', '');
      return Color(int.parse('FF$hex', radix: 16));
    } catch (_) {
      return const Color(0xFF9333EA);
    }
  }

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      description: json['description'] ?? '',
      icon: json['icon'] ?? 'briefcase',
      colorHex: json['color'] ?? '#9333EA',
      isActive: json['isActive'] ?? true,
      postCount: json['postCount'] ?? 0,
    );
  }
}
