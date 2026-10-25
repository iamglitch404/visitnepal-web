import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import path from 'path';
import fs from 'fs';
import { DatabaseService } from '../database/database.service';
import { AuthUser } from '../middleware/auth';

const uploadDir = path.resolve(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@Injectable()
export class VerificationService {
  constructor(private readonly db: DatabaseService) {}

  getUploadDir() {
    return uploadDir;
  }

  async handleUpload(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const fileUrl = `/uploads/${file.filename}`;
    return {
      file_url: fileUrl,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  async registerDocument(user: AuthUser, body: any) {
    const userId = user.id;
    const { business_id, document_type, file_url } = body;

    if (!document_type || !file_url) {
      throw new BadRequestException('Document type and file URL are required');
    }

    const docRes = await this.db.query(
      `INSERT INTO documents (owner_id, business_id, document_type, file_url, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [userId, business_id || null, document_type, file_url]
    );

    return docRes.rows[0];
  }

  async getSecureFile(id: string, user: AuthUser) {
    const userId = user.id;
    const userRole = user.role;

    const docRes = await this.db.query(`SELECT * FROM documents WHERE id = $1 LIMIT 1`, [id]);
    if (docRes.rows.length === 0) {
      throw new NotFoundException('Document record not found');
    }

    const doc = docRes.rows[0];
    const isOwner = doc.owner_id === userId;
    const isOfficer = ['admin', 'super_admin', 'verification_officer', 'permit_officer'].includes(userRole);

    if (!isOwner && !isOfficer) {
      throw new ForbiddenException('Access denied: You are not authorized to view this confidential document');
    }

    const filename = path.basename(doc.file_url);
    const filePath = path.resolve(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      return {
        fallbackPayload: {
          id: doc.id,
          document_type: doc.document_type,
          status: doc.status,
          verified_access: true,
        },
      };
    }

    return { filePath };
  }
}
