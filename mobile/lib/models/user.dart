class User {
  final String id;
  final String email;
  final String name;
  final String phone;
  final String role;
  final String? avatarUrl;
  final bool isActive;
  final bool hasActiveSubscription;

  User({
    required this.id,
    required this.email,
    required this.name,
    required this.phone,
    required this.role,
    this.avatarUrl,
    required this.isActive,
    this.hasActiveSubscription = false,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    bool subActive = false;
    if (json['subscription'] != null && json['subscription'] is Map) {
      subActive = json['subscription']['status'] == 'ACTIVE';
    }
    return User(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      role: json['role'] ?? 'USER',
      avatarUrl: json['avatarUrl'],
      isActive: json['isActive'] ?? true,
      hasActiveSubscription: subActive,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'phone': phone,
      'role': role,
      'avatarUrl': avatarUrl,
      'isActive': isActive,
    };
  }
}
