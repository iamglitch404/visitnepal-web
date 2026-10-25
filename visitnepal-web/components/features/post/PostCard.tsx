'use client';

import React, { useState } from 'react';
import { MapPin, Heart, MessageCircle, Send } from 'lucide-react';
import { FeedPost } from '@/store/useTravelStore';
import Comment from './CommentItem';

export interface PostProps {
  post: FeedPost;
  theme?: 'light' | 'dark';
  onUserClick?: (userId: string) => void;
  onCommenterClick?: (userName: string) => void;
  onLike?: (id: string) => void;
  onCommentAdd?: (postId: string, text: string) => void;
}

export default function Post({
  post,
  theme = 'dark',
  onUserClick,
  onCommenterClick,
  onLike,
  onCommentAdd,
}: PostProps) {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    onCommentAdd?.(post.id, commentText.trim());
    setCommentText('');
  };

  if (theme === 'light') {
    return (
      <div
        className="rounded-2xl overflow-hidden text-left bg-white/95"
        style={{
          border: '1px solid rgba(194,147,103,0.14)',
          boxShadow: '0 4px 16px rgba(61,45,39,0.025)',
        }}
      >
        {/* Post header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2.5">
            <img
              src={post.userAvatar}
              alt={post.userName}
              onClick={() => onUserClick?.(post.userId)}
              className="h-8 w-8 rounded-full object-cover border cursor-pointer hover:scale-95 transition-transform"
              style={{ borderColor: 'rgba(194,147,103,0.25)' }}
            />
            <div>
              <h3
                onClick={() => onUserClick?.(post.userId)}
                className="text-[11px] font-bold text-[#3D2D27] cursor-pointer hover:text-[var(--caramel)] transition-colors"
              >
                {post.userName}
              </h3>
              <div className="flex items-center gap-1 text-[8px] font-mono text-[#A89286] mt-0.5">
                <span className="text-[var(--caramel)] font-bold uppercase">{post.userRole}</span>
                {post.location && (
                  <>
                    <span>·</span>
                    <span>{post.location}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <span className="text-[8px] font-mono text-[#A89286]">{post.timestamp}</span>
        </div>

        {/* Content */}
        <p className="px-4 py-2 text-[11px] text-[#7A6258] leading-relaxed">{post.content}</p>

        {/* Image */}
        {post.image && (
          <div
            className="w-full overflow-hidden border-y"
            style={{ borderColor: 'rgba(194,147,103,0.12)', maxHeight: '320px' }}
          >
            <img
              src={post.image}
              alt="log"
              className="w-full object-cover"
              style={{ maxHeight: '320px' }}
            />
          </div>
        )}

        {/* Actions */}
        <div
          className="flex items-center gap-4 px-4 py-3 border-t"
          style={{ borderColor: 'rgba(194,147,103,0.1)' }}
        >
          <button
            onClick={() => onLike?.(post.id)}
            className={`flex items-center gap-1.5 text-[10px] font-medium transition-colors cursor-pointer ${
              post.likedByUser ? 'text-pink-500' : 'text-[#A89286] hover:text-pink-500'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              width="13"
              height="13"
              fill={post.likedByUser ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            <span className="font-mono">{post.likes}</span>
          </button>
          
          <button
            onClick={() => setShowCommentInput(!showCommentInput)}
            className="flex items-center gap-1.5 text-[10px] font-medium text-[#A89286] hover:text-[var(--caramel)] transition-colors cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="font-mono">{post.comments.length}</span>
          </button>
        </div>

        {/* Comments List */}
        {post.comments.length > 0 && (
          <div
            className="px-4 pb-3 flex flex-col gap-2 border-t"
            style={{ borderColor: 'rgba(194,147,103,0.07)' }}
          >
            {post.comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                theme="light"
                onCommenterClick={onCommenterClick}
              />
            ))}
          </div>
        )}

        {/* Comment input */}
        {showCommentInput && (
          <div
            className="px-4 pb-4 pt-2 border-t flex gap-2"
            style={{ borderColor: 'rgba(194,147,103,0.1)' }}
          >
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCommentSubmit();
                }
              }}
              placeholder="Add a comment... (Enter)"
              className="flex-1 text-[10px] rounded-xl px-3 py-2 focus:outline-none"
              style={{
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(194,147,103,0.3)',
                color: '#3D2D27',
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // Dark Theme (Community Feed)
  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-zinc-800/80 hover:border-zinc-700 transition-all duration-300">
      {/* Post header */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <div
          onClick={() => onUserClick?.(post.userId)}
          className="h-10 w-10 rounded-full overflow-hidden border border-zinc-700 flex-shrink-0 cursor-pointer hover:scale-95 transition-transform"
        >
          <img src={post.userAvatar} alt={post.userName} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p
            onClick={() => onUserClick?.(post.userId)}
            className="text-sm font-bold text-white leading-tight cursor-pointer hover:text-cyan-400 transition-colors text-left"
          >
            {post.userName}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest">
              {post.userRole}
            </span>
            {post.location && (
              <>
                <span className="text-zinc-700">·</span>
                <span className="text-[9px] font-mono text-purple-400 flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5" />
                  {post.location}
                </span>
              </>
            )}
          </div>
        </div>
        <span className="text-[9px] font-mono text-zinc-600 flex-shrink-0">{post.timestamp}</span>
      </div>

      {/* Post image */}
      {post.image && (
        <div className="relative w-full overflow-hidden" style={{ maxHeight: '320px' }}>
          <img
            src={post.image}
            alt="post"
            className="w-full object-cover"
            style={{ maxHeight: '320px' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent pointer-events-none" />
        </div>
      )}

      {/* Post content */}
      <p className="px-4 py-3 text-sm text-zinc-300 leading-6 text-left">{post.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 pb-3 border-t border-zinc-800/50 pt-3">
        <button
          onClick={() => onLike?.(post.id)}
          className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${
            post.likedByUser ? 'text-pink-400' : 'text-zinc-500 hover:text-pink-400'
          }`}
        >
          <Heart className={`h-4 w-4 ${post.likedByUser ? 'fill-pink-400' : ''}`} />
          <span className="font-mono">{post.likes}</span>
        </button>
        
        <button
          onClick={() => setShowCommentInput(!showCommentInput)}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="font-mono">{post.comments.length}</span>
        </button>
      </div>

      {/* Comments List */}
      {post.comments.length > 0 && (
        <div className="px-4 pb-2 flex flex-col gap-2">
          {post.comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              theme="dark"
              onCommenterClick={onCommenterClick}
            />
          ))}
        </div>
      )}

      {/* Comment input */}
      {showCommentInput && (
        <div className="px-4 pb-3 flex items-center gap-2">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCommentSubmit();
              }
            }}
            placeholder="Write a comment… (Enter to send)"
            className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-cyan-500/60 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none"
          />
          <button
            onClick={handleCommentSubmit}
            className="h-8 w-8 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl flex items-center justify-center transition-all cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
