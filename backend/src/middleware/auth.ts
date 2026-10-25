import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db';
import { sendError } from '../utils/response';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  fullName?: string;
  status?: string;
  isVerified?: boolean;
}

declare global {
  namespace Express {
    interface User extends AuthUser {}
  }
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

const JWT_SECRET = process.env.JWT_SECRET || '31f763d5-c205-4408-97b9-e59d8e900c05';

export function createToken(payload: { id: string; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '14d' });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export async function authRequired(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication required', 'UNAUTHORIZED', 401);
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded || !decoded.id) {
    return sendError(res, 'Invalid or expired authentication token', 'UNAUTHORIZED', 401);
  }

  try {
    const userRes = await query(
      `SELECT a.id, a.email, a.status, r.name as role, p.full_name, p.is_verified
       FROM accounts a
       LEFT JOIN roles r ON a.role_id = r.id
       LEFT JOIN profiles p ON a.id = p.id
       WHERE a.id = $1`,
      [decoded.id]
    );

    if (userRes.rows.length === 0) {
      return sendError(res, 'User account not found', 'UNAUTHORIZED', 401);
    }

    const row = userRes.rows[0];

    if (row.status === 'banned') {
      return sendError(res, 'This account has been banned.', 'ACCOUNT_BANNED', 403);
    }

    if (row.status === 'suspended') {
      return sendError(res, 'This account is currently suspended.', 'ACCOUNT_SUSPENDED', 403);
    }

    req.user = {
      id: row.id,
      email: row.email,
      role: row.role || 'tourist',
      fullName: row.full_name,
      status: row.status,
      isVerified: row.is_verified,
    };

    next();
  } catch (err: any) {
    console.error('Auth middleware error:', err);
    return sendError(res, 'Authentication check failed', 'INTERNAL_ERROR', 500);
  }
}

export async function authOptional(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded || !decoded.id) {
    return next();
  }

  try {
    const userRes = await query(
      `SELECT a.id, a.email, a.status, r.name as role, p.full_name, p.is_verified
       FROM accounts a
       LEFT JOIN roles r ON a.role_id = r.id
       LEFT JOIN profiles p ON a.id = p.id
       WHERE a.id = $1`,
      [decoded.id]
    );

    if (userRes.rows.length > 0) {
      const row = userRes.rows[0];
      if (row.status === 'active') {
        req.user = {
          id: row.id,
          email: row.email,
          role: row.role || 'tourist',
          fullName: row.full_name,
          status: row.status,
          isVerified: row.is_verified,
        };
      }
    }
  } catch (err) {
    // optional, proceed
  }

  next();
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    // Super admin has access to all admin/moderator actions
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Role mapping normalization
    const userRole = req.user.role === 'traveler' ? 'tourist' : req.user.role;
    const normalizedAllowed = allowedRoles.map((r) => (r === 'traveler' ? 'tourist' : r));

    if (!normalizedAllowed.includes(userRole)) {
      return sendError(
        res,
        `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]`,
        'FORBIDDEN',
        403
      );
    }

    next();
  };
}
