import { Router, Response } from 'express';
import { query } from '../db';
import { sendSuccess, sendError } from '../utils/response';
import { authRequired, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/destinations - Public list of destinations with search & filters
router.get('/', async (req, res: Response) => {
  try {
    const { search, category, difficulty, budget, status = 'published' } = req.query;

    let sql = `SELECT * FROM destinations WHERE 1=1`;
    const params: any[] = [];

    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    if (category && category !== 'All') {
      params.push(category);
      sql += ` AND LOWER(category) = LOWER($${params.length})`;
    }

    if (difficulty && difficulty !== 'All') {
      params.push(difficulty);
      sql += ` AND LOWER(difficulty) = LOWER($${params.length})`;
    }

    if (budget && budget !== 'All') {
      params.push(budget);
      sql += ` AND budget = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (LOWER(name) LIKE LOWER($${params.length}) OR LOWER(location) LIKE LOWER($${params.length}) OR LOWER(description) LIKE LOWER($${params.length}))`;
    }

    sql += ` ORDER BY rating DESC, name ASC`;

    const result = await query(sql, params);
    return sendSuccess(res, result.rows);
  } catch (err: any) {
    console.error('Fetch destinations error:', err);
    return sendError(res, err.message || 'Failed to fetch destinations', 'SERVER_ERROR', 500);
  }
});

// GET /api/destinations/:id - Detail view with related hotels and guides
router.get('/:id', async (req, res: Response) => {
  try {
    const { id } = req.params;
    const destRes = await query(`SELECT * FROM destinations WHERE id = $1`, [id]);
    if (destRes.rows.length === 0) {
      return sendError(res, 'Destination not found', 'NOT_FOUND', 404);
    }

    const destination = destRes.rows[0];

    // Related hotels
    const hotelsRes = await query(
      `SELECT * FROM hotels WHERE LOWER(location) LIKE LOWER($1) AND status = 'published' LIMIT 4`,
      [`%${destination.location.split(',')[0]}%`]
    );

    // Related activities
    const activitiesRes = await query(
      `SELECT * FROM activities WHERE destination_id = $1 AND status = 'published'`,
      [id]
    );

    return sendSuccess(res, {
      ...destination,
      related_hotels: hotelsRes.rows,
      activities: activitiesRes.rows,
    });
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// POST /api/destinations - Admin destination creation
router.post('/', authRequired, requireRole('admin', 'super_admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      location,
      description,
      image_url,
      category,
      best_season,
      difficulty,
      duration,
      budget,
      highlights,
      status = 'published',
    } = req.body;

    if (!name || !location || !description || !image_url) {
      return sendError(res, 'Name, location, description, and image URL are required');
    }

    const insertRes = await query(
      `INSERT INTO destinations 
        (name, location, description, image_url, category, best_season, difficulty, duration, budget, highlights, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        name,
        location,
        description,
        image_url,
        category || 'General',
        best_season || 'Year-round',
        difficulty || 'Medium',
        duration || 'N/A',
        budget || '$$',
        highlights || [],
        status,
      ]
    );

    return sendSuccess(res, insertRes.rows[0], 201);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// PUT /api/destinations/:id - Admin update
router.put('/:id', authRequired, requireRole('admin', 'super_admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, location, description, image_url, category, best_season, difficulty, duration, budget, highlights, status } = req.body;

    const updateRes = await query(
      `UPDATE destinations SET
        name = COALESCE($1, name),
        location = COALESCE($2, location),
        description = COALESCE($3, description),
        image_url = COALESCE($4, image_url),
        category = COALESCE($5, category),
        best_season = COALESCE($6, best_season),
        difficulty = COALESCE($7, difficulty),
        duration = COALESCE($8, duration),
        budget = COALESCE($9, budget),
        highlights = COALESCE($10, highlights),
        status = COALESCE($11, status)
       WHERE id = $12
       RETURNING *`,
      [name, location, description, image_url, category, best_season, difficulty, duration, budget, highlights, status, id]
    );

    if (updateRes.rows.length === 0) {
      return sendError(res, 'Destination not found', 'NOT_FOUND', 404);
    }

    return sendSuccess(res, updateRes.rows[0]);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// DELETE /api/destinations/:id - Admin delete
router.delete('/:id', authRequired, requireRole('admin', 'super_admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM destinations WHERE id = $1`, [id]);
    return sendSuccess(res, { message: 'Destination deleted successfully' });
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

export default router;
