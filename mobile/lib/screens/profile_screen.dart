import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:image_cropper/image_cropper.dart';
import '../core/api_service.dart';
import '../models/post.dart';
import '../providers/auth_provider.dart';
import '../providers/subscription_provider.dart';
import 'phone_otp_screen.dart';
import 'post_details_screen.dart';
import 'subscription_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _emailController = TextEditingController(text: 'vikram.sharma@example.com');
  final _passwordController = TextEditingController(text: 'User@123');
  bool _uploadingAvatar = false;

  Future<void> _pickAvatar(AuthProvider auth) async {
    final image = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (image == null) return;
    final cropped = await ImageCropper().cropImage(
      sourcePath: image.path,
      aspectRatio: const CropAspectRatio(ratioX: 1, ratioY: 1),
      compressQuality: 90,
      uiSettings: [
        AndroidUiSettings(toolbarTitle: 'Crop profile photo', lockAspectRatio: true),
        IOSUiSettings(title: 'Crop profile photo', aspectRatioLockEnabled: true),
        WebUiSettings(context: context),
      ],
    );
    if (cropped == null) return;
    setState(() => _uploadingAvatar = true);
    try {
      final url = await ApiService.instance.uploadImage(XFile(cropped.path));
      await auth.updateAvatar(url);
    } catch (err) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(err.toString())));
    } finally {
      if (mounted) setState(() => _uploadingAvatar = false);
    }
  }
  final _nameController = TextEditingController(text: 'Rahul Mehta');
  final _phoneController = TextEditingController(text: '+91 98765 43210');

  bool _isRegistering = false;
  List<Post> _myPosts = [];
  bool _loadingPosts = false;

  @override
  void initState() {
    super.initState();
    _loadMyPosts();
  }

  void _loadMyPosts() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (!auth.isAuthenticated) return;

    setState(() => _loadingPosts = true);
    try {
      final posts = await ApiService.instance.getMyPosts();
      setState(() => _myPosts = posts);
    } catch (_) {
      setState(() => _myPosts = []);
    } finally {
      setState(() => _loadingPosts = false);
    }
  }

  void _submitAuth() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final sub = Provider.of<SubscriptionProvider>(context, listen: false);

    if (_isRegistering) {
      // Validate phone not empty
      final phone = _phoneController.text.trim();
      if (phone.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please enter your phone number for OTP verification.')),
        );
        return;
      }
      // Navigate to OTP screen — account creation happens after verification
      final verified = await Navigator.push<bool>(
        context,
        MaterialPageRoute(
          builder: (_) => PhoneOtpScreen(phoneNumber: phone),
        ),
      );
      if (verified != true || !mounted) return;

      // OTP verified — now register
      try {
        await auth.register(
          _nameController.text.trim(),
          _emailController.text.trim(),
          phone,
          _passwordController.text.trim(),
        );
        await sub.refreshStatus();
        _loadMyPosts();
      } catch (err) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(err.toString())),
          );
        }
      }
    } else {
      try {
        await auth.login(
          _emailController.text.trim(),
          _passwordController.text.trim(),
        );
        await sub.refreshStatus();
        _loadMyPosts();
      } catch (err) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(err.toString())),
          );
        }
      }
    }
  }

  void _handleDemo(bool subscribed) async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final sub = Provider.of<SubscriptionProvider>(context, listen: false);

    try {
      await auth.loginDemo(subscribed);
      await sub.refreshStatus();
      _loadMyPosts();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final sub = Provider.of<SubscriptionProvider>(context);

    if (!auth.isAuthenticated) {
      return Scaffold(
        backgroundColor: const Color(0xFF090D16),
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          title: Text(
            _isRegistering ? 'Join ReachWithUs' : 'Sign In',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Demo logins helper
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF9333EA).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF9333EA).withOpacity(0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.bolt, color: Color(0xFFF59E0B), size: 16),
                        SizedBox(width: 6),
                        Text(
                          'One-Tap Demo Logins',
                          style: TextStyle(
                            color: Color(0xFFC084FC),
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () => _handleDemo(true),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF9333EA),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 8),
                            ),
                            child: const Text('Vikram (VIP Active)', style: TextStyle(fontSize: 11)),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => _handleDemo(false),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.white,
                              side: const BorderSide(color: Colors.white24),
                              padding: const EdgeInsets.symmetric(vertical: 8),
                            ),
                            child: const Text('Priya (Free User)', style: TextStyle(fontSize: 11)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              if (_isRegistering) ...[
                const Text('Full Name', style: TextStyle(color: Colors.white70, fontSize: 11)),
                const SizedBox(height: 6),
                TextField(
                  controller: _nameController,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: _inputDecoration('Enter your name'),
                ),
                const SizedBox(height: 14),
                const Text('Contact Phone', style: TextStyle(color: Colors.white70, fontSize: 11)),
                const SizedBox(height: 6),
                TextField(
                  controller: _phoneController,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: _inputDecoration('+91 98765 43210'),
                ),
                const SizedBox(height: 14),
              ],

              const Text('Email Address', style: TextStyle(color: Colors.white70, fontSize: 11)),
              const SizedBox(height: 6),
              TextField(
                controller: _emailController,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: _inputDecoration('name@company.com'),
              ),

              const SizedBox(height: 14),

              const Text('Password', style: TextStyle(color: Colors.white70, fontSize: 11)),
              const SizedBox(height: 6),
              TextField(
                controller: _passwordController,
                obscureText: true,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: _inputDecoration('••••••••'),
              ),

              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                height: 46,
                child: ElevatedButton(
                  onPressed: auth.isLoading ? null : _submitAuth,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF9333EA),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: auth.isLoading
                      ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 2)
                      : Text(
                          _isRegistering ? 'Register Free Account' : 'Sign In',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                ),
              ),

              const SizedBox(height: 16),

              Center(
                child: TextButton(
                  onPressed: () => setState(() => _isRegistering = !_isRegistering),
                  child: Text(
                    _isRegistering
                      ? 'Already have an account? Sign In'
                      : 'Don\'t have an account? Register Free',
                    style: const TextStyle(color: Color(0xFFC084FC), fontSize: 12),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    final user = auth.user!;

    return Scaffold(
      backgroundColor: const Color(0xFF090D16),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('My Profile', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, size: 20, color: Colors.grey),
            onPressed: () => auth.logout(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await sub.refreshStatus();
          _loadMyPosts();
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // User Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF111827),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white.withOpacity(0.08)),
                ),
                child: Row(
                  children: [
                    Column(
                      children: [
                        GestureDetector(
                          onTap: user.avatarUrl == null || user.avatarUrl!.isEmpty
                              ? null
                              : () => showDialog<void>(
                                  context: context,
                                  builder: (_) => Dialog(
                                    backgroundColor: Colors.black,
                                    child: InteractiveViewer(child: Image.network(user.avatarUrl!)),
                                  ),
                                ),
                          child: CircleAvatar(
                            radius: 26,
                            backgroundColor: const Color(0xFF9333EA),
                            backgroundImage: (user.avatarUrl != null && user.avatarUrl!.isNotEmpty)
                                ? NetworkImage(user.avatarUrl!)
                                : null,
                            child: (user.avatarUrl == null || user.avatarUrl!.isEmpty)
                                ? Text(
                                    user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                                    style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                                  )
                                : null,
                          ),
                        ),
                        const SizedBox(height: 4),
                        TextButton.icon(
                          onPressed: _uploadingAvatar ? null : () => _pickAvatar(auth),
                          icon: _uploadingAvatar
                              ? const SizedBox(width: 12, height: 12, child: CircularProgressIndicator(strokeWidth: 2))
                              : const Icon(Icons.camera_alt, size: 13),
                          label: Text(_uploadingAvatar ? 'Uploading...' : 'Upload photo'),
                          style: TextButton.styleFrom(
                            foregroundColor: const Color(0xFFC084FC),
                            padding: EdgeInsets.zero,
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            textStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                user.name,
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                              ),
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1E293B),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  user.role,
                                  style: const TextStyle(color: Colors.white70, fontSize: 9, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(user.email, style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12)),
                          if (user.phone.isNotEmpty)
                            Text(user.phone, style: const TextStyle(color: Color(0xFFC084FC), fontSize: 11, fontFamily: 'monospace')),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Subscription Status Banner
              InkWell(
                onTap: () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const SubscriptionScreen()));
                },
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: sub.isSubscribed
                        ? const Color(0xFF10B981).withOpacity(0.12)
                        : const Color(0xFF9333EA).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: sub.isSubscribed
                          ? const Color(0xFF10B981).withOpacity(0.3)
                          : const Color(0xFF9333EA).withOpacity(0.3),
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        sub.isSubscribed ? Icons.stars : Icons.lock_outline,
                        color: sub.isSubscribed ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                        size: 24,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              sub.isSubscribed ? '₹10 VIP Pass Active' : 'Free Standard Account',
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                            Text(
                              sub.isSubscribed
                                  ? '${sub.daysRemaining} days of unlimited contact access remaining'
                                  : 'Contact numbers are masked. Tap to upgrade.',
                              style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 11),
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // My Requirements Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'My Requirements (${_myPosts.length})',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  IconButton(
                    icon: const Icon(Icons.refresh, size: 18, color: Colors.grey),
                    onPressed: _loadMyPosts,
                  ),
                ],
              ),

              const SizedBox(height: 8),

              if (_loadingPosts)
                const Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator(color: Color(0xFF9333EA))))
              else if (_myPosts.isEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: const Color(0xFF111827),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Center(
                    child: Text('You have not posted any requirements yet.', style: TextStyle(color: Colors.grey, fontSize: 12)),
                  ),
                )
              else
                ..._myPosts.map((p) {
                  Color statusColor = const Color(0xFFF59E0B);
                  if (p.status == 'APPROVED') statusColor = const Color(0xFF10B981);
                  if (p.status == 'REJECTED') statusColor = const Color(0xFFEF4444);

                  return Card(
                    margin: const EdgeInsets.only(bottom: 10),
                    color: const Color(0xFF111827),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    child: ListTile(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                      title: Text(p.title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 4),
                          Text('${p.location} • ${p.budget}', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 11)),
                          if (p.status == 'REJECTED' && p.rejectionReason != null)
                            Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: Text('Reason: ${p.rejectionReason}', style: const TextStyle(color: Color(0xFFF87171), fontSize: 10)),
                            ),
                        ],
                      ),
                      trailing: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: statusColor.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: statusColor.withOpacity(0.3)),
                        ),
                        child: Text(p.status, style: TextStyle(color: statusColor, fontSize: 9, fontWeight: FontWeight.bold)),
                      ),
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => PostDetailsScreen(post: p)));
                      },
                    ),
                  );
                }),
            ],
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 13),
      filled: true,
      fillColor: const Color(0xFF111827),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.white.withOpacity(0.08))),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.white.withOpacity(0.08))),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF9333EA))),
    );
  }
}
