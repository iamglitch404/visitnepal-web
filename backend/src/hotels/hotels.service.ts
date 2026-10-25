import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuthUser } from '../middleware/auth';

@Injectable()
export class HotelsService {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  async findAll(query: { search?: string; location?: string; category?: string }) {
    const { search, location } = query;

    let sql = `
      SELECT h.*, 
        COALESCE(
          (SELECT json_agg(rt.*) FROM room_types rt WHERE rt.hotel_id = h.id),
          '[]'::json
        ) as room_types,
        COALESCE(
          (SELECT MIN(price_per_night) FROM room_types rt WHERE rt.hotel_id = h.id),
          120.00
        ) as starting_price
      FROM hotels h
      WHERE h.status = 'published'
    `;
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (LOWER(h.name) LIKE LOWER($${params.length}) OR LOWER(h.location) LIKE LOWER($${params.length}))`;
    }

    if (location) {
      params.push(`%${location}%`);
      sql += ` AND LOWER(h.location) LIKE LOWER($${params.length})`;
    }

    sql += ` ORDER BY h.rating DESC, h.name ASC`;
    const result = await this.db.query(sql, params);
    return result.rows;
  }

  async findOne(id: string) {
    const hotelRes = await this.db.query(`SELECT * FROM hotels WHERE id = $1`, [id]);
    if (hotelRes.rows.length === 0) {
      throw new NotFoundException('Hotel not found');
    }

    const roomsRes = await this.db.query(`SELECT * FROM room_types WHERE hotel_id = $1 ORDER BY price_per_night ASC`, [id]);
    return {
      ...hotelRes.rows[0],
      room_types: roomsRes.rows,
    };
  }

  async create(user: AuthUser, body: any) {
    const { name, location, description, image_url, amenities = [], rooms = [] } = body;

    if (!name || !location) {
      throw new BadRequestException('Hotel name and location are required');
    }

    const hotelRes = await this.db.query(
      `INSERT INTO hotels (name, location, description, image_url, amenities, status)
       VALUES ($1, $2, $3, $4, $5, 'published')
       RETURNING *`,
      [name, location, description, image_url, amenities]
    );

    const hotel = hotelRes.rows[0];

    if (Array.isArray(rooms) && rooms.length > 0) {
      for (const r of rooms) {
        await this.db.query(
          `INSERT INTO room_types (hotel_id, name, description, total_quantity, price_per_night, currency)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [hotel.id, r.name, r.description || '', r.total_quantity || 5, r.price_per_night || 100.0, r.currency || 'USD']
        );
      }
    } else {
      await this.db.query(
        `INSERT INTO room_types (hotel_id, name, description, total_quantity, price_per_night, currency)
         VALUES ($1, 'Deluxe Room', 'Comfortable king-bed room with mountain view', 10, 150.00, 'USD')`,
        [hotel.id]
      );
    }

    return hotel;
  }

  async addRoom(hotelId: string, user: AuthUser, body: any) {
    const { name, description, total_quantity = 5, price_per_night = 100.0, currency = 'USD' } = body;

    if (!name || !price_per_night) {
      throw new BadRequestException('Room name and price per night are required');
    }

    // Verify hotel exists
    const hotelRes = await this.db.query(`SELECT * FROM hotels WHERE id = $1`, [hotelId]);
    if (hotelRes.rows.length === 0) {
      throw new NotFoundException('Hotel not found');
    }

    const roomRes = await this.db.query(
      `INSERT INTO room_types (hotel_id, name, description, total_quantity, price_per_night, currency)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [hotelId, name, description, total_quantity, price_per_night, currency]
    );

    return roomRes.rows[0];
  }
}
