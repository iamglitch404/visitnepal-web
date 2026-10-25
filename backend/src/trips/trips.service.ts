import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuthUser } from '../middleware/auth';

@Injectable()
export class TripsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(user: AuthUser) {
    const tripsRes = await this.db.query(
      `SELECT t.*, 
        d.name as destination_name, 
        d.image_url as destination_image,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', id,
              'day_number', day_number,
              'date', date,
              'items', COALESCE((SELECT json_agg(i.*) FROM itinerary_items i WHERE i.day_id = itinerary_days.id), '[]'::json)
            ) ORDER BY day_number ASC
          ) FROM itinerary_days WHERE trip_id = t.id),
          '[]'::json
        ) as days
       FROM trips t
       LEFT JOIN destinations d ON t.destination_id = d.id
       WHERE t.profile_id = $1
       ORDER BY t.created_at DESC`,
      [user.id]
    );

    return tripsRes.rows;
  }

  async create(user: AuthUser, body: any) {
    const { title, destination_id, start_date, end_date, budget_limit, stops = [] } = body;

    if (!title) {
      throw new BadRequestException('Trip title is required');
    }

    const trip = await this.db.withTransaction(async (client) => {
      const tripInsert = await client.query(
        `INSERT INTO trips (profile_id, destination_id, title, start_date, end_date, budget_limit, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'planned')
         RETURNING *`,
        [user.id, destination_id || null, title, start_date || null, end_date || null, budget_limit || null]
      );
      const newTrip = tripInsert.rows[0];

      if (Array.isArray(stops) && stops.length > 0) {
        let dayNum = 1;
        for (const stop of stops) {
          const daysCount = stop.days || 1;
          for (let d = 0; d < daysCount; d++) {
            const dayInsert = await client.query(
              `INSERT INTO itinerary_days (trip_id, day_number)
               VALUES ($1, $2)
               RETURNING id`,
              [newTrip.id, dayNum]
            );
            const dayId = dayInsert.rows[0].id;

            if (stop.destination?.name || stop.destination_name) {
              await client.query(
                `INSERT INTO itinerary_items (day_id, activity, location)
                 VALUES ($1, $2, $3)`,
                [dayId, `Explore ${stop.destination?.name || stop.destination_name}`, stop.destination?.location || 'Nepal']
              );
            }
            dayNum++;
          }
        }
      }

      return newTrip;
    });

    return trip;
  }

  async delete(id: string, user: AuthUser) {
    await this.db.query(`DELETE FROM trips WHERE id = $1 AND profile_id = $2`, [id, user.id]);
    return { message: 'Trip deleted successfully' };
  }
}
