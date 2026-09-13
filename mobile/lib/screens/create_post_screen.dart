import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../core/api_service.dart';
import '../providers/auth_provider.dart';
import '../providers/posts_provider.dart';

class CreatePostScreen extends StatefulWidget {
  final Function(int)? onTabChange;

  const CreatePostScreen({super.key, this.onTabChange});

  @override
  State<CreatePostScreen> createState() => _CreatePostScreenState();
}

class _CreatePostScreenState extends State<CreatePostScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _locationController = TextEditingController();
  final _budgetController = TextEditingController();
  final _phoneController = TextEditingController();

  String? _selectedCategoryId;
  bool _submitting = false;
  bool _uploadingImage = false;
  String? _uploadedImageUrl;
  XFile? _selectedImage;
  Uint8List? _selectedImageBytes;

  @override
  void initState() {
    super.initState();
    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (auth.user?.phone != null) {
      _phoneController.text = auth.user!.phone;
    } else {
      _phoneController.text = '+91 98765 43210';
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _locationController.dispose();
    _budgetController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  void _submitPost() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedCategoryId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select an industry category.')),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      final List<String>? images = _uploadedImageUrl != null ? [_uploadedImageUrl!] : null;

      await ApiService.instance.createPost(
        title: _titleController.text.trim(),
        description: _descriptionController.text.trim(),
        categoryId: _selectedCategoryId!,
        location: _locationController.text.trim(),
        budget: _budgetController.text.trim(),
        contactPhone: _phoneController.text.trim(),
        imageUrls: images,
      );

      if (!mounted) return;
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: const Color(0xFF111827),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Icon(Icons.check_circle, color: Color(0xFF10B981)),
              SizedBox(width: 8),
              Text('Submitted!', style: TextStyle(color: Colors.white, fontSize: 16)),
            ],
          ),
          content: const Text(
            'Your requirement has been submitted to administrators for fast approval. You can track status in Profile.',
            style: TextStyle(color: Colors.white70, fontSize: 13),
          ),
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                if (widget.onTabChange != null) {
                  widget.onTabChange!(4); // Switch to Profile tab
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF9333EA)),
              child: const Text('View My Posts', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      );
    } catch (err) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(err.toString())),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Future<void> _pickAndUploadImage() async {
    final image = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (image == null) return;

    setState(() {
      _selectedImage = image;
      _selectedImageBytes = null;
      _uploadingImage = true;
    });
    try {
      final imageBytes = await image.readAsBytes();
      final url = await ApiService.instance.uploadImage(image);
      if (mounted) {
        setState(() {
          _selectedImageBytes = imageBytes;
          _uploadedImageUrl = url;
        });
      }
    } catch (err) {
      if (mounted) {
        setState(() {
          _selectedImage = null;
          _selectedImageBytes = null;
          _uploadedImageUrl = null;
        });
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(err.toString())));
      }
    } finally {
      if (mounted) setState(() => _uploadingImage = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final posts = Provider.of<PostsProvider>(context);

    if (!auth.isAuthenticated) {
      return Scaffold(
        backgroundColor: const Color(0xFF090D16),
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          title: const Text('Post Requirement', style: TextStyle(fontSize: 16)),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.lock, size: 48, color: Color(0xFFC084FC)),
                const SizedBox(height: 16),
                const Text(
                  'Authentication Required',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                ),
                const SizedBox(height: 8),
                Text(
                  'Please sign in via Profile to post your sourcing requirements.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 12),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () {
                    if (widget.onTabChange != null) widget.onTabChange!(4);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF9333EA),
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  ),
                  child: const Text('Go to Profile / Login', style: TextStyle(color: Colors.white)),
                ),
              ],
            ),
          ),
        ),
      );
    }

    if (_selectedCategoryId == null && posts.categories.isNotEmpty) {
      _selectedCategoryId = posts.categories.first.id;
    }

    return Scaffold(
      backgroundColor: const Color(0xFF090D16),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: const Text(
          'Post a Requirement',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title
              const Text('Requirement Title *',
                  style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _titleController,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: _inputDecoration('e.g. Need 500 Tons of Structural Steel'),
                validator: (v) => v == null || v.isEmpty ? 'Required' : null,
              ),

              const SizedBox(height: 16),

              // Category
              const Text('Industry Category *',
                  style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                value: _selectedCategoryId,
                dropdownColor: const Color(0xFF111827),
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: _inputDecoration(''),
                items: posts.categories.map((c) {
                  return DropdownMenuItem(value: c.id, child: Text(c.name));
                }).toList(),
                onChanged: (val) => setState(() => _selectedCategoryId = val),
              ),

              const SizedBox(height: 16),

              // Location & Budget
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Location / City *',
                            style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _locationController,
                          style: const TextStyle(color: Colors.white, fontSize: 13),
                          decoration: _inputDecoration('Mumbai, Delhi...'),
                          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Budget / Price',
                            style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _budgetController,
                          style: const TextStyle(color: Colors.white, fontSize: 13),
                          decoration: _inputDecoration('₹5 Lakhs / Flexible'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Contact Phone
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Contact Phone Number *',
                      style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
                  Text(
                    'Masked on Public Feeds',
                    style: TextStyle(color: Colors.greenAccent.shade200, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                style: const TextStyle(color: Colors.white, fontSize: 13, fontFamily: 'monospace'),
                decoration: _inputDecoration('+91 98765 43210'),
                validator: (v) => v == null || v.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 4),
              Text(
                'Your phone number is protected and visible only to verified VIP subscribers.',
                style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 10),
              ),

              const SizedBox(height: 16),

              // Description
              const Text('Detailed Specifications *',
                  style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _descriptionController,
                maxLines: 4,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: _inputDecoration('Provide specs, quantities, timelines, delivery requirements...'),
                validator: (v) => v == null || v.isEmpty ? 'Required' : null,
              ),

              const SizedBox(height: 16),

              // Image upload or URL
              const Text('Requirement Photos / Docs (Optional)',
                  style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              OutlinedButton.icon(
                onPressed: _uploadingImage ? null : _pickAndUploadImage,
                icon: _uploadingImage
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFFC084FC)),
                      )
                    : const Icon(Icons.upload_file, color: Color(0xFFC084FC)),
                label: Text(
                  _uploadingImage ? 'Uploading...' : 'Upload File from Device',
                  style: const TextStyle(color: Colors.white70, fontSize: 13),
                ),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 46),
                  side: BorderSide(color: Colors.white.withOpacity(0.15)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              if (_selectedImage != null && _selectedImageBytes != null) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.memory(
                        _selectedImageBytes!,
                        width: 64,
                        height: 64,
                        fit: BoxFit.cover,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        _selectedImage!.name,
                        style: const TextStyle(color: Colors.white70, fontSize: 12),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    IconButton(
                      onPressed: _uploadingImage
                          ? null
                          : () => setState(() {
                                _selectedImage = null;
                                _selectedImageBytes = null;
                                _uploadedImageUrl = null;
                              }),
                      icon: const Icon(Icons.close, color: Colors.white70, size: 18),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 24),

              // Submit Button
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: _submitting ? null : _submitPost,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF9333EA),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: _submitting
                      ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 2)
                      : const Text(
                          'Submit Requirement for Approval',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                ),
              ),
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
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFF9333EA)),
      ),
    );
  }
}
