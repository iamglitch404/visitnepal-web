import 'dart:convert';
import 'package:shelf/shelf.dart';
import 'package:shelf_router/shelf_router.dart';
import 'package:postgres/postgres.dart';
import 'db.dart';

final apiRouter = Router()
  ..get('/destinations', _getDestinations)
  ..get('/hotels', _getHotels)
  ..get('/activities', _getActivities)
  ..get('/bookings', _getBookings)
  ..post('/bookings', _createBooking)
  ..post('/bookings/<id>/cancel', _cancelBooking)
  ..get('/profile', _getProfile);

Future<Response> _getDestinations(Request req) async {
  final res = await dbPool.execute('SELECT * FROM destinations WHERE status = \'published\'');
  final list = res.map((r) => r.toColumnMap()).toList();
  return Response.ok(jsonEncode(list));
}

Future<Response> _getHotels(Request req) async {
  final res = await dbPool.execute('SELECT * FROM hotels WHERE status = \'published\'');
  final list = res.map((r) => r.toColumnMap()).toList();
  return Response.ok(jsonEncode(list));
}

Future<Response> _getActivities(Request req) async {
  final res = await dbPool.execute('SELECT * FROM activities WHERE status = \'published\'');
  final list = res.map((r) => r.toColumnMap()).toList();
  return Response.ok(jsonEncode(list));
}

Future<Response> _getProfile(Request req) async {
  final userId = req.context['user_id'] as String;
  return await withAuth(userId, (ctx) async {
    final res = await ctx.execute(Sql.named('SELECT * FROM profiles WHERE id = @id'), parameters: {'id': userId});
    if (res.isEmpty) return Response.notFound('Profile not found');
    return Response.ok(jsonEncode(res.first.toColumnMap()));
  });
}

Future<Response> _getBookings(Request req) async {
  final userId = req.context['user_id'] as String;
  return await withAuth(userId, (ctx) async {
    final res = await ctx.execute('SELECT * FROM bookings');
    return Response.ok(jsonEncode(res.map((r) => r.toColumnMap()).toList()));
  });
}

Future<Response> _createBooking(Request req) async {
  final userId = req.context['user_id'] as String;
  final payload = jsonDecode(await req.readAsString());
  
  return await withAuth(userId, (ctx) async {
    try {
      final res = await ctx.execute(
        Sql.named('SELECT create_booking(@room_type_id, @guide_id, @schedule_id, @start_date, @end_date, @quantity, @idempotency_key)'),
        parameters: {
          'room_type_id': payload['room_type_id'],
          'guide_id': payload['guide_id'],
          'schedule_id': payload['schedule_id'],
          'start_date': payload['start_date'] != null ? DateTime.parse(payload['start_date']) : null,
          'end_date': payload['end_date'] != null ? DateTime.parse(payload['end_date']) : null,
          'quantity': payload['quantity'] ?? 1,
          'idempotency_key': payload['idempotency_key'],
        },
      );
      return Response.ok(jsonEncode({'id': res.first[0]}));
    } catch (e) {
      return Response.internalServerError(body: jsonEncode({'error': e.toString()}));
    }
  });
}

Future<Response> _cancelBooking(Request req, String id) async {
  final userId = req.context['user_id'] as String;
  return await withAuth(userId, (ctx) async {
    try {
      await ctx.execute(Sql.named('SELECT cancel_booking(@id)'), parameters: {'id': id});
      return Response.ok(jsonEncode({'success': true}));
    } catch (e) {
      return Response.internalServerError(body: jsonEncode({'error': e.toString()}));
    }
  });
}
