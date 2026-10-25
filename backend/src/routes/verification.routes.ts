import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { query } from '../db';
import { sendSuccess, sendError } from '../utils/response';
import { authRequired, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Ensure upload directory exists
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// POST /api/verification/upload - Upload verification file
router.post('/upload', authRequired, upload.single('file'), (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded');
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    return sendSuccess(res, {
      file_url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// POST /api/verification/document - Register document
router.post('/document', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { business_id, document_type, file_url } = req.body;

    if (!document_type || !file_url) {
      return sendError(res, 'Document type and file URL are required');
    }

    const docRes = await query(
      `INSERT INTO documents (owner_id, business_id, document_type, file_url, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [userId, business_id || null, document_type, file_url]
    );

    return sendSuccess(res, docRes.rows[0], 201);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// GET /api/verification/documents/:id/secure-file - Protected confidential document retrieval
router.get('/documents/:id/secure-file', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { id } = req.params;

    const docRes = await query(`SELECT * FROM documents WHERE id = $1 LIMIT 1`, [id]);
    if (docRes.rows.length === 0) {
      return sendError(res, 'Document record not found', 'NOT_FOUND', 404);
    }

    const doc = docRes.rows[0];

    // Strict Authorization: Only owner or verified regulatory officers can access
    const isOwner = doc.owner_id === userId;
    const isOfficer = ['admin', 'super_admin', 'verification_officer', 'permit_officer'].includes(userRole);

    if (!isOwner && !isOfficer) {
      return sendError(res, 'Access denied: You are not authorized to view this confidential document', 'FORBIDDEN', 403);
    }

    const filename = path.basename(doc.file_url);
    const filePath = path.resolve(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      return sendSuccess(res, {
        id: doc.id,
        document_type: doc.document_type,
        status: doc.status,
        verified_access: true,
      });
    }

    return res.sendFile(filePath);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

export default router;
