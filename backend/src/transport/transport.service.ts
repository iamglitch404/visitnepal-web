import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TransportService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(query: { from?: string; to?: string; type?: string }) {
    const { from, to, type } = query;

    let sql = `SELECT * FROM transport_routes WHERE 1=1`;
    const params: any[] = [];

    if (from) {
      params.push(`%${from}%`);
      sql += ` AND LOWER(from_location) LIKE LOWER($${params.length})`;
    }

    if (to) {
      params.push(`%${to}%`);
      sql += ` AND LOWER(to_location) LIKE LOWER($${params.length})`;
    }

    if (type) {
      params.push(type);
      sql += ` AND LOWER(vehicle_type) = LOWER($${params.length})`;
    }

    sql += ` ORDER BY price ASC`;
    const result = await this.db.query(sql, params);

    return result.rows.map((row) => ({
      ...row,
      destinations: [row.from_location, row.to_location],
    }));
  }

  async create(body: any) {
    const {
      vehicle_name,
      vehicle_type = 'Tourist Bus',
      from_location,
      to_location,
      departure_time = '07:00 AM',
      arrival_time,
      price,
      total_seats = 20,
      amenities = [],
    } = body;

    if (!vehicle_name || !from_location || !to_location || !price) {
      throw new BadRequestException('Vehicle name, route locations, and price are required');
    }

    const routeRes = await this.db.query(
      `INSERT INTO transport_routes (vehicle_name, vehicle_type, from_location, to_location, departure_time, arrival_time, price, total_seats, available_seats, amenities)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8, $9)
       RETURNING *`,
      [vehicle_name, vehicle_type, from_location, to_location, departure_time, arrival_time, price, total_seats, amenities]
    );

    return routeRes.rows[0];
  }
}
