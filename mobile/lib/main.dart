import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'core/constants.dart';
import 'providers/auth_provider.dart';
import 'providers/subscription_provider.dart';
import 'providers/posts_provider.dart';
import 'screens/main_navigation_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(const ReachWithUsApp());
}

class ReachWithUsApp extends StatelessWidget {
  const ReachWithUsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => SubscriptionProvider()),
        ChangeNotifierProvider(create: (_) => PostsProvider()),
      ],
      child: MaterialApp(
        title: 'ReachWithUs',
        debugShowCheckedModeBanner: false,
        themeMode: ThemeMode.dark,
        darkTheme: ThemeData(
          useMaterial3: true,
          brightness: Brightness.dark,
          scaffoldBackgroundColor: AppConstants.backgroundDark,
          colorScheme: const ColorScheme.dark(
            primary: AppConstants.primary,
            secondary: AppConstants.accent,
            surface: AppConstants.cardDark,
            error: AppConstants.error,
          ),
          cardTheme: const CardThemeData(
            color: AppConstants.cardDark,
            elevation: 2,
          ),
          appBarTheme: const AppBarTheme(
            backgroundColor: Colors.transparent,
            foregroundColor: Colors.white,
            elevation: 0,
            surfaceTintColor: Colors.transparent,
          ),
        ),
        home: const MainNavigationScreen(),
      ),
    );
  }
}
