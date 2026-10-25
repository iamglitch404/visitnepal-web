
import { Router, Response } from 'express';
import { query } from '../db';
import { sendSuccess, sendError } from '../utils/response';
import { authRequired, AuthenticatedRequest } from '../middleware/auth';
import * as fs from 'fs/promises';
import * as path from 'path';

const router = Router();

// GET /api/posts - Public feed of traveler stories
router.get('/', async (_req, res: Response) => {
  try {
    const result = await query(
      `SELECT 
        p.*,
        pr.full_name as author_name,
        pr.avatar_url as author_avatar,
        pr.title as author_title,
        COALESCE(pr.rating, 5.0) as author_rating
       FROM posts p
       JOIN profiles pr ON p.author_id = pr.id
       ORDER BY p.created_at DESC`
    );

    // If empty, return initial community sample stories
    if (result.rows.length === 0) {
      try {
        const postsData = await fs.readFile(path.join(__dirname, '../data/posts.json'), 'utf-8');
        const samplePosts = JSON.parse(postsData);
        return sendSuccess(res, samplePosts);
      } catch (e) {
        console.error('Error reading posts.json', e);
        return sendSuccess(res, []);
      }
    }

    return sendSuccess(res, result.rows);
  } catch (err: any) {
    console.error('Fetch posts error:', err);
    return sendError(res, err.message || 'Failed to fetch community posts', 'SERVER_ERROR', 500);
  }
});

// POST /api/posts - Create traveler story
router.post('/', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { caption, image_url, location, package_name, package_details, package_price } = req.body;

    if (!caption || !image_url) {
      return sendError(res, 'Caption and image are required');
    }

    const postRes = await query(
      `INSERT INTO posts (author_id, caption, image_url, location, package_name, package_details, package_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, caption, image_url, location || null, package_name || null, package_details || null, package_price || null]
    );

    return sendSuccess(res, postRes.rows[0], 201);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// POST /api/posts/:id/like - Like story
router.post('/:id/like', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await query(`UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1`, [id]);
    return sendSuccess(res, { message: 'Post liked' });
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

export default router;
