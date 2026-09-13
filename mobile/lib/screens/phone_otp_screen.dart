import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:firebase_auth/firebase_auth.dart';

/// Phone number OTP verification screen using Firebase Authentication.
/// Returns `true` via Navigator.pop when verification is successful.
class PhoneOtpScreen extends StatefulWidget {
  final String phoneNumber;

  const PhoneOtpScreen({super.key, required this.phoneNumber});

  @override
  State<PhoneOtpScreen> createState() => _PhoneOtpScreenState();
}

class _PhoneOtpScreenState extends State<PhoneOtpScreen>
    with SingleTickerProviderStateMixin {
  // ── State ──────────────────────────────────────────────────────────────
  final _otpControllers = List.generate(6, (_) => TextEditingController());
  final _otpFocusNodes = List.generate(6, (_) => FocusNode());

  String? _verificationId;
  int? _resendToken;
  bool _sending = true;   // true while waiting for Firebase to send OTP
  bool _verifying = false;
  String? _error;

  int _secondsLeft = 60;
  Timer? _timer;

  late final AnimationController _shakeController;
  late final Animation<double> _shakeAnimation;

  // ── Init ───────────────────────────────────────────────────────────────
  @override
  void initState() {
    super.initState();
    _shakeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _shakeAnimation = Tween<double>(begin: 0, end: 12).animate(
      CurvedAnimation(parent: _shakeController, curve: Curves.elasticIn),
    );
    _sendOtp();
  }

  @override
  void dispose() {
    for (final c in _otpControllers) {
      c.dispose();
    }
    for (final f in _otpFocusNodes) {
      f.dispose();
    }
    _timer?.cancel();
    _shakeController.dispose();
    super.dispose();
  }

  // ── Helpers ────────────────────────────────────────────────────────────
  String get _formattedPhone {
    // Ensure the phone is in E.164 format for Firebase
    String phone = widget.phoneNumber.replaceAll(RegExp(r'\s'), '');
    if (!phone.startsWith('+')) phone = '+91$phone';
    return phone;
  }

  String get _otpCode =>
      _otpControllers.map((c) => c.text).join();

  void _startCountdown() {
    _timer?.cancel();
    setState(() => _secondsLeft = 60);
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) { t.cancel(); return; }
      setState(() {
        if (_secondsLeft > 0) {
          _secondsLeft--;
        } else {
          t.cancel();
        }
      });
    });
  }

  void _clearOtp() {
    for (final c in _otpControllers) {
      c.clear();
    }
    _otpFocusNodes.first.requestFocus();
  }

  // ── Firebase ───────────────────────────────────────────────────────────
  Future<void> _sendOtp({bool resend = false}) async {
    setState(() {
      _sending = true;
      _error = null;
    });

    await FirebaseAuth.instance.verifyPhoneNumber(
      phoneNumber: _formattedPhone,
      forceResendingToken: resend ? _resendToken : null,
      timeout: const Duration(seconds: 60),
      verificationCompleted: (PhoneAuthCredential credential) async {
        // Android auto-retrieval / instant verification
        if (!mounted) return;
        setState(() => _verifying = true);
        try {
          await FirebaseAuth.instance.signInWithCredential(credential);
          if (mounted) Navigator.of(context).pop(true);
        } catch (e) {
          if (mounted) setState(() { _verifying = false; _error = e.toString(); });
        }
      },
      verificationFailed: (FirebaseAuthException e) {
        if (!mounted) return;
        setState(() {
          _sending = false;
          _error = e.message ?? 'Verification failed. Check your phone number.';
        });
      },
      codeSent: (String verificationId, int? resendToken) {
        if (!mounted) return;
        setState(() {
          _verificationId = verificationId;
          _resendToken = resendToken;
          _sending = false;
        });
        _startCountdown();
      },
      codeAutoRetrievalTimeout: (String verificationId) {
        if (!mounted) return;
        _verificationId = verificationId;
      },
    );
  }

  Future<void> _verifyOtp() async {
    final code = _otpCode;
    if (code.length < 6) {
      setState(() => _error = 'Please enter all 6 digits.');
      _shakeController.forward(from: 0);
      return;
    }
    if (_verificationId == null) {
      setState(() => _error = 'Verification session expired. Please resend OTP.');
      return;
    }

    setState(() { _verifying = true; _error = null; });

    try {
      final credential = PhoneAuthProvider.credential(
        verificationId: _verificationId!,
        smsCode: code,
      );
      await FirebaseAuth.instance.signInWithCredential(credential);
      // Sign out from Firebase immediately — we only needed phone verification.
      // The actual user account is managed by our own backend.
      await FirebaseAuth.instance.signOut();
      if (mounted) Navigator.of(context).pop(true);
    } on FirebaseAuthException catch (e) {
      if (!mounted) return;
      setState(() {
        _verifying = false;
        _error = e.code == 'invalid-verification-code'
            ? 'Incorrect OTP. Please try again.'
            : (e.message ?? 'OTP verification failed.');
      });
      _clearOtp();
      _shakeController.forward(from: 0);
    } catch (e) {
      if (mounted) setState(() { _verifying = false; _error = e.toString(); });
    }
  }

  // ── Build ──────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF090D16),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: Colors.white,
        title: const Text(
          'Verify Phone',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 16),

              // ── Icon ──────────────────────────────────────────────────
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF9333EA), Color(0xFFC026D3)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF9333EA).withOpacity(0.4),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: const Icon(Icons.sms_outlined, color: Colors.white, size: 36),
              ),

              const SizedBox(height: 24),

              // ── Headline ──────────────────────────────────────────────
              const Text(
                'OTP Verification',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 22,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'We sent a 6-digit code to',
                style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 14),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 4),
              Text(
                widget.phoneNumber,
                style: const TextStyle(
                  color: Color(0xFFC084FC),
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  fontFamily: 'monospace',
                ),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 36),

              // ── Sending indicator ─────────────────────────────────────
              if (_sending) ...[
                const CircularProgressIndicator(color: Color(0xFF9333EA)),
                const SizedBox(height: 16),
                Text(
                  'Sending OTP…',
                  style: TextStyle(color: Colors.white.withOpacity(0.6)),
                ),
              ] else ...[

                // ── 6-digit OTP boxes ─────────────────────────────────
                AnimatedBuilder(
                  animation: _shakeAnimation,
                  builder: (context, child) {
                    final offset = _shakeController.isAnimating
                        ? _shakeAnimation.value *
                            (_shakeController.value < 0.5 ? 1 : -1)
                        : 0.0;
                    return Transform.translate(
                      offset: Offset(offset, 0),
                      child: child,
                    );
                  },
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(6, (i) {
                      return _OtpBox(
                        controller: _otpControllers[i],
                        focusNode: _otpFocusNodes[i],
                        onChanged: (val) {
                          if (val.isNotEmpty && i < 5) {
                            _otpFocusNodes[i + 1].requestFocus();
                          }
                          if (val.isEmpty && i > 0) {
                            _otpFocusNodes[i - 1].requestFocus();
                          }
                          // Auto-submit when all 6 digits are filled
                          if (_otpCode.length == 6) _verifyOtp();
                        },
                      );
                    }),
                  ),
                ),

                const SizedBox(height: 12),

                // ── Error message ─────────────────────────────────────
                if (_error != null)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEF4444).withOpacity(0.12),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.3)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline, color: Color(0xFFEF4444), size: 16),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _error!,
                            style: const TextStyle(color: Color(0xFFEF4444), fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                  ),

                const SizedBox(height: 28),

                // ── Verify button ─────────────────────────────────────
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _verifying ? null : _verifyOtp,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF9333EA),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: _verifying
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : const Text(
                            'Verify & Continue',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                            ),
                          ),
                  ),
                ),

                const SizedBox(height: 20),

                // ── Resend countdown ──────────────────────────────────
                if (_secondsLeft > 0)
                  Text(
                    'Resend OTP in ${_secondsLeft}s',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.5),
                      fontSize: 13,
                    ),
                  )
                else
                  TextButton(
                    onPressed: () {
                      _clearOtp();
                      _sendOtp(resend: true);
                    },
                    child: const Text(
                      'Resend OTP',
                      style: TextStyle(
                        color: Color(0xFFC084FC),
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ),

                const SizedBox(height: 24),

                // ── Wrong number ──────────────────────────────────────
                TextButton(
                  onPressed: () => Navigator.of(context).pop(false),
                  child: Text(
                    'Wrong number? Go back',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.4),
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

// ── Individual OTP digit box ────────────────────────────────────────────────
class _OtpBox extends StatelessWidget {
  final TextEditingController controller;
  final FocusNode focusNode;
  final ValueChanged<String> onChanged;

  const _OtpBox({
    required this.controller,
    required this.focusNode,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 46,
      height: 56,
      margin: const EdgeInsets.symmetric(horizontal: 4),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: focusNode.hasFocus
              ? const Color(0xFF9333EA)
              : Colors.white.withOpacity(0.1),
          width: 1.5,
        ),
      ),
      child: TextField(
        controller: controller,
        focusNode: focusNode,
        onChanged: onChanged,
        keyboardType: TextInputType.number,
        textAlign: TextAlign.center,
        maxLength: 1,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 22,
          fontWeight: FontWeight.bold,
        ),
        decoration: const InputDecoration(
          counterText: '',
          border: InputBorder.none,
          contentPadding: EdgeInsets.zero,
        ),
        inputFormatters: [FilteringTextInputFormatter.digitsOnly],
      ),
    );
  }
}
