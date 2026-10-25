import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class GuideRequestsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    try {
      const result = await this.db.query('SELECT * FROM guide_requests ORDER BY created_at DESC');
      return result.rows;
    } catch (error) {
      throw new InternalServerErrorException('Failed to load guide requests');
    }
  }

  async confirm(id: string) {
    try {
      const result = await this.db.query(
        'UPDATE guide_requests SET status = $1 WHERE id = $2 RETURNING *',
        ['active', id],
      );
      if (result.rows.length === 0) {
        throw new NotFoundException('Guide request not found');
      }
      return { message: 'Request confirmed successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to confirm request');
    }
  }

  async delete(id: string) {
    try {
      const result = await this.db.query('DELETE FROM guide_requests WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        throw new NotFoundException('Guide request not found');
      }
      return { message: 'Request deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete request');
    }
  }
}
