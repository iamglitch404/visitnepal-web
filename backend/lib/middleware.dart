import 'package:shelf/shelf.dart';
import 'jwt.dart';

Middleware authMiddleware() {
  return (Handler innerHandler) {
    return (Request request) {
      final authHeader = request.headers['Authorization'];
      if (authHeader != null && authHeader.startsWith('Bearer ')) {
        final token = authHeader.substring(7);
        final userId = verifyToken(token);
        if (userId != null) {
          final updatedRequest = request.change(context: {'user_id': userId});
          return innerHandler(updatedRequest);
        }
      }
      return Response.forbidden('Unauthorized');
    };
  };
}
