import 'category.dart';
import 'user.dart';

class PostImage {
  final String id;
  final String url;
  final bool isCover;
  final int order;

  PostImage({
    required this.id,
    required this.url,
    required this.isCover,
    required this.order,
  });

  factory PostImage.fromJson(Map<String, dynamic> json) {
    return PostImage(
      id: json['id'] ?? '',
      url: json['url'] ?? '',
      isCover: json['isCover'] ?? false,
      order: json['order'] ?? 0,
    );
  }
}

class Post {
  final String id;
  final String title;
  final String description;
  final String? contactPhone;
  final String? maskedPhone;
  final bool isContactLocked;
  final String location;
  final String budget;
  final String status;
  final String? rejectionReason;
  final int viewsCount;
  int likesCount;
  final int sharesCount;
  bool isLiked;
  final DateTime createdAt;
  final User? author;
  final Category? category;
  final List<PostImage> images;

  Post({
    required this.id,
    required this.title,
    required this.description,
    this.contactPhone,
    this.maskedPhone,
    required this.isContactLocked,
    required this.location,
    required this.budget,
    required this.status,
    this.rejectionReason,
    required this.viewsCount,
    required this.likesCount,
    required this.sharesCount,
    this.isLiked = false,
    required this.createdAt,
    this.author,
    this.category,
    required this.images,
  });

  factory Post.fromJson(Map<String, dynamic> json) {
    final imagesList = (json['images'] as List? ?? [])
        .map((img) => PostImage.fromJson(img))
        .toList();

    return Post(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      contactPhone: json['contactPhone'],
      maskedPhone: json['maskedPhone'],
      isContactLocked: json['isContactLocked'] ?? true,
      location: json['location'] ?? 'Pan-India',
      budget: json['budget'] ?? 'Flexible',
      status: json['status'] ?? 'PENDING',
      rejectionReason: json['rejectionReason'],
      viewsCount: json['viewsCount'] ?? 0,
      likesCount: json['likesCount'] ?? 0,
      sharesCount: json['sharesCount'] ?? 0,
      isLiked: json['isLiked'] ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
      author: json['author'] != null ? User.fromJson(json['author']) : null,
      category: json['category'] != null ? Category.fromJson(json['category']) : null,
      images: imagesList,
    );
  }
}
