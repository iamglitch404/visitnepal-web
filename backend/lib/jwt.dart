import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';
import 'package:dotenv/dotenv.dart';

String get jwtSecret {
  final env = DotEnv(includePlatformEnvironment: true)..load();
  return env['JWT_SECRET'] ?? 'super-secret-key-change-in-prod';
}

String createToken(String userId) {
  final jwt = JWT({'sub': userId});
  return jwt.sign(SecretKey(jwtSecret), expiresIn: Duration(days: 7));
}

String? verifyToken(String token) {
  try {
    final jwt = JWT.verify(token, SecretKey(jwtSecret));
    return jwt.payload['sub'] as String?;
  } catch (e) {
    return null;
  }
}
