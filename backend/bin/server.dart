import 'dart:io';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart';
import 'package:shelf_router/shelf_router.dart';
import 'package:dotenv/dotenv.dart';

import 'package:backend/auth_router.dart';
import 'package:backend/api_router.dart';
import 'package:backend/middleware.dart';
import 'package:backend/db.dart';

void main(List<String> args) async {
  final env = DotEnv(includePlatformEnvironment: true)..load();
  initDb();

  final router = Router()
    ..mount('/auth', authRouter.call)
    ..mount('/api', Pipeline().addMiddleware(authMiddleware()).addHandler(apiRouter.call));

  final handler = Pipeline().addMiddleware(logRequests()).addHandler(router.call);

  final port = int.parse(env['PORT'] ?? '8080');
  final server = await serve(handler, InternetAddress.anyIPv4, port);
  print('Server listening on port ${server.port}');
}
