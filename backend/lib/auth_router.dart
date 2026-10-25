import 'dart:convert';
import 'package:shelf/shelf.dart';
import 'package:shelf_router/shelf_router.dart';
import 'package:crypt/crypt.dart';
import 'package:postgres/postgres.dart';
import 'db.dart';
import 'jwt.dart';

final authRouter = Router()
  ..post('/register', _registerHandler)
  ..post('/login', _loginHandler);

Future<Response> _registerHandler(Request req) async {
  final payload = jsonDecode(await req.readAsString());
  final email = payload['email'];
  final password = payload['password'];
  final name = payload['full_name'];

  if (email == null || password == null || name == null) {
    return Response.badRequest(body: jsonEncode({'error': 'Missing fields'}));
  }

  final hash = Crypt.sha256(password).toString();

  try {
    return await dbPool.runTx((ctx) async {
      final accountRes = await ctx.execute(
        Sql.named('INSERT INTO accounts (email) VALUES (@email) RETURNING id'),
        parameters: {'email': email},
      );
      final accountId = accountRes.first[0] as String;

      await ctx.execute(
        Sql.named('INSERT INTO auth_credentials (account_id, password_hash) VALUES (@id, @hash)'),
        parameters: {'id': accountId, 'hash': hash},
      );

      await ctx.execute(
        Sql.named('INSERT INTO profiles (id, full_name) VALUES (@id, @name)'),
        parameters: {'id': accountId, 'name': name},
      );

      final token = createToken(accountId);
      return Response.ok(jsonEncode({'token': token, 'user': {'id': accountId, 'email': email, 'full_name': name}}));
    });
  } catch (e) {
    return Response.internalServerError(body: jsonEncode({'error': e.toString()}));
  }
}

Future<Response> _loginHandler(Request req) async {
  final payload = jsonDecode(await req.readAsString());
  final email = payload['email'];
  final password = payload['password'];

  if (email == null || password == null) {
    return Response.badRequest(body: jsonEncode({'error': 'Missing fields'}));
  }

  final res = await dbPool.execute(
    Sql.named('''
      SELECT a.id, c.password_hash, p.full_name
      FROM accounts a
      JOIN auth_credentials c ON a.id = c.account_id
      JOIN profiles p ON a.id = p.id
      WHERE a.email = @email
    '''),
    parameters: {'email': email},
  );

  if (res.isEmpty) {
    return Response.forbidden(jsonEncode({'error': 'Invalid credentials'}));
  }

  final row = res.first;
  final accountId = row[0] as String;
  final hash = row[1] as String;
  final name = row[2] as String?;

  final crypt = Crypt(hash);
  if (!crypt.match(password)) {
    return Response.forbidden(jsonEncode({'error': 'Invalid credentials'}));
  }

  final token = createToken(accountId);
  return Response.ok(jsonEncode({'token': token, 'user': {'id': accountId, 'email': email, 'full_name': name}}));
}
