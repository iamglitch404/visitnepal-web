import { Router, Response } from 'express';
import { query } from '../db';
import { sendSuccess, sendError } from '../utils/response';
import { authRequired, AuthenticatedRequest } from '../middleware/auth';
import { emitRealtimeEvent, EVENT_TYPES } from '../services/realtime.service';

const router = Router();

// GET /api/chat/conversations - List user's active conversations
router.get('/conversations', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await query(
      `SELECT 
        c.id,
        c.last_message,
        CASE WHEN c.participant1_id = $1 THEN c.participant2_id ELSE c.participant1_id END as other_user_id,
        p.full_name as other_user_name,
        p.avatar_url as other_user_avatar,
        (SELECT created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message_time
       FROM conversations c
       JOIN profiles p ON (CASE WHEN c.participant1_id = $1 THEN c.participant2_id ELSE c.participant1_id END) = p.id
       WHERE c.participant1_id = $1 OR c.participant2_id = $1
       ORDER BY last_message_time DESC NULLS LAST`,
      [userId]
    );

    // If user has no conversations yet, return helpful starter conversations with Guides or Butler
    if (result.rows.length === 0) {
      const guideRes = await query(
        `SELECT a.id, p.full_name, p.avatar_url 
         FROM accounts a 
         JOIN roles r ON a.role_id = r.id 
         JOIN profiles p ON a.id = p.id 
         WHERE r.name IN ('guide', 'butler') AND a.id != $1
         LIMIT 3`,
        [userId]
      );

      const starters = guideRes.rows.map((g) => ({
        id: `demo-${g.id}`,
        other_user_id: g.id,
        other_user_name: g.full_name,
        other_user_avatar: g.avatar_url,
        last_message: 'Namaste! How can I assist with your Nepal journey?',
        last_message_time: new Date().toISOString(),
      }));

      return sendSuccess(res, starters);
    }

    return sendSuccess(res, result.rows);
  } catch (err: any) {
    console.error('Get conversations error:', err);
    return sendError(res, err.message || 'Failed to fetch conversations', 'SERVER_ERROR', 500);
  }
});

// GET /api/chat/conversations/:id/messages - Message history
router.get('/conversations/:id/messages', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const userId = req.user!.id;

    if (id.startsWith('demo-')) {
      return sendSuccess(res, [
        {
          id: 'msg-starter-1',
          conversation_id: id,
          sender_id: id.replace('demo-', ''),
          content: 'Namaste! Welcome to Nepal. Let me know your trekking dates and preferences!',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          is_me: false,
        },
      ]);
    }

    const messages = await query(
      `SELECT m.*, (m.sender_id = $2) as is_me
       FROM messages m
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC`,
      [id, userId]
    );

    return sendSuccess(res, messages.rows);
  } catch (err: any) {
    return sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// POST /api/chat/conversations/:id/messages - Send message
router.post('/conversations/:id/messages', authRequired, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { content, recipient_id } = req.body;
    const userId = req.user!.id;

    if (!content || !content.trim()) {
      return sendError(res, 'Message content cannot be empty');
    }

    let actualConvoId = id;

    // If starting from a starter thread, create real conversation
    if (id.startsWith('demo-')) {
      const otherId = recipient_id || id.replace('demo-', '');
      const existing = await query(
        `SELECT id FROM conversations WHERE (participant1_id = $1 AND participant2_id = $2) OR (participant1_id = $2 AND participant2_id = $1)`,
        [userId, otherId]
      );
      if (existing.rows.length > 0) {
        actualConvoId = existing.rows[0].id;
      } else {
        const newConvo = await query(
          `INSERT INTO conversations (participant1_id, participant2_id, last_message)
           VALUES ($1, $2, $3)
           RETURNING id`,
          [userId, otherId, content.trim()]
        );
        actualConvoId = newConvo.rows[0].id;
      }
    } else {
      await query(`UPDATE conversations SET last_message = $1 WHERE id = $2`, [content.trim(), actualConvoId]);
    }

    const msgRes = await query(
      `INSERT INTO messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [actualConvoId, userId, content.trim()]
    );

    const savedMsg = msgRes.rows[0];

    // Identify recipient for scoped delivery
    const cRes = await query(`SELECT participant1_id, participant2_id FROM conversations WHERE id = $1`, [actualConvoId]);
    let otherParticipantId = recipient_id;
    if (cRes.rows.length > 0) {
      const c = cRes.rows[0];
      otherParticipantId = c.participant1_id === userId ? c.participant2_id : c.participant1_id;
    }

    // Emit Realtime Event to conversation and other participant
    await emitRealtimeEvent({
      event: EVENT_TYPES.MESSAGE_CREATED,
      entity: 'message',
      entityId: savedMsg.id,
      action: 'created',
      scope: {
        conversationId: actualConvoId,
        userId: otherParticipantId,
      },
      metadata: {
        id: savedMsg.id,
        conversation_id: actualConvoId,
        sender_id: userId,
        content: content.trim(),
        created_at: savedMsg.created_at,
        sender_name: req.user?.fullName || 'Traveler',
      },
    });

    // Also emit notification to other participant
    if (otherParticipantId) {
      await emitRealtimeEvent({
        event: EVENT_TYPES.NOTIFICATION_CREATED,
        entity: 'notification',
        entityId: `notif-msg-${savedMsg.id}`,
        action: 'created',
        scope: { userId: otherParticipantId },
        metadata: {
          title: `New message from ${req.user?.fullName || 'Traveler'}`,
          message: content.trim().substring(0, 80),
          relatedEntityId: actualConvoId,
        },
      });
    }

    return sendSuccess(res, {
      ...savedMsg,
      is_me: true,
      conversation_id: actualConvoId,
    }, 201);
  } catch (err: any) {
    console.error('Send message error:', err);
    return sendError(res, err.message || 'Failed to send message', 'SERVER_ERROR', 500);
  }
});

export default router;
