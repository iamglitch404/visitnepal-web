import 'package:postgres/postgres.dart';
import 'package:dotenv/dotenv.dart';

late final Pool dbPool;

void initDb() {
  final env = DotEnv(includePlatformEnvironment: true)..load();
  final dbUrl = env['DATABASE_URL'] ?? 'postgres://postgres:postgres@localhost:5432/postgres';
  final uri = Uri.parse(dbUrl);
  
  dbPool = Pool.withEndpoints(
    [
      Endpoint(
        host: uri.host,
        port: uri.port,
        database: uri.pathSegments.isNotEmpty ? uri.pathSegments.first : 'postgres',
        username: uri.userInfo.isNotEmpty ? uri.userInfo.split(':').first : 'postgres',
        password: uri.userInfo.split(':').length > 1 ? uri.userInfo.split(':').last : '',
      )
    ],
    settings: PoolSettings(
      maxConnectionCount: 10,
      sslMode: uri.host.contains('supabase.co') ? SslMode.require : SslMode.disable,
    ),
  );
}

Future<T> withAuth<T>(String userId, Future<T> Function(Session session) callback) async {
  return await dbPool.runTx((ctx) async {
    await ctx.execute(Sql.named('SET LOCAL app.current_user_id = @id'), parameters: {'id': userId});
    return await callback(ctx);
  });
}
