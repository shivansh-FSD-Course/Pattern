import React, { useState } from 'react';
import api from '../api/axios';

export default function CommentSection({ patternId, comments, onCommentAdded }) {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState(''); // Separate state for replies!
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const textToPost = replyTo ? replyText : newComment;
    
    if (!textToPost.trim()) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        `/patterns/${patternId}/comments`,
        {
          text: textToPost,
          parentCommentId: replyTo
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setNewComment('');
        setReplyText('');
        setReplyTo(null);
        onCommentAdded();
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert(error.response?.data?.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      await api.post(
        `/patterns/${patternId}/comments/${commentId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      onCommentAdded();
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      const token = localStorage.getItem('token');
      await api.delete(
        `/patterns/${patternId}/comments/${commentId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      onCommentAdded();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  // Organize comments into nested structure
  const organizeComments = (comments) => {
    const commentMap = {};
    const rootComments = [];

    comments.forEach(comment => {
      commentMap[comment._id] = { ...comment, children: [] };
    });

    comments.forEach(comment => {
      if (comment.parentComment) {
        if (commentMap[comment.parentComment]) {
          commentMap[comment.parentComment].children.push(commentMap[comment._id]);
        }
      } else {
        rootComments.push(commentMap[comment._id]);
      }
    });

    return rootComments;
  };

  const renderComment = (comment, depth = 0) => {
    const currentUser = localStorage.getItem('username');

    return (
      <div
        key={comment._id}
        className={`${depth > 0 ? 'ml-8 mt-3' : 'mt-4'}`}
      >
        <div className="flex gap-3 p-3 bg-white/50 rounded-sm">
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-serif text-sm flex-shrink-0"
            style={{ backgroundColor: comment.user?.avatar?.color || '#7BA591' }}
          >
            {comment.user?.avatar?.char || comment.user?.username?.[0]?.toUpperCase() || '?'}
          </div>

          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">@{comment.user?.username || 'Unknown'}</span>
              <span className="text-xs opacity-40">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Comment Text */}
            <p className="text-sm opacity-75 mb-2 whitespace-pre-wrap">
              {comment.text}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3 text-xs">
              <button
                onClick={() => handleLikeComment(comment._id)}
                className="opacity-60 hover:opacity-100 transition flex items-center gap-1"
              >
                <HeartIcon size={14} /> {comment.likes || 0}
              </button>

              <button
                onClick={() => {
                  setReplyTo(replyTo === comment._id ? null : comment._id);
                  setReplyText('');
                }}
                className="opacity-60 hover:opacity-100 transition"
              >
                {replyTo === comment._id ? 'Cancel' : 'Reply'}
              </button>

              {currentUser === comment.user?.username && (
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  className="opacity-60 hover:opacity-100 hover:text-red-500 transition"
                >
                  Delete
                </button>
              )}
            </div>

            {/* Reply Form */}
            {replyTo === comment._id && (
              <form onSubmit={handleSubmit} className="mt-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to @${comment.user?.username}...`}
                  className="
                    w-full h-16 resize-none px-3 py-2 border border-ink/25
                    outline-none bg-white/70 rounded-sm focus:border-ink text-sm
                  "
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !replyText.trim()}
                    className="
                      px-4 py-1.5 border border-ink text-sm rounded-sm
                      hover:bg-ink hover:text-paper transition
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    {isSubmitting ? 'Posting...' : 'Post Reply'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyTo(null);
                      setReplyText('');
                    }}
                    className="
                      px-4 py-1.5 border border-ink/30 text-sm rounded-sm
                      hover:bg-ink/5 transition
                    "
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Nested Replies */}
        {comment.children && comment.children.length > 0 && (
          <div>
            {comment.children.map(child => renderComment(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const organizedComments = organizeComments(comments);

  return (
    <div className="mt-4" onClick={(e) => e.stopPropagation()}>
      <h4 className="font-serif text-lg mb-3">
        Comments ({comments.length})
      </h4>

      {/* New Comment Form */}
      {!replyTo && (
        <form onSubmit={handleSubmit} className="mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment... (use @username to mention someone)"
            className="
              w-full h-20 resize-none px-3 py-2 border border-ink/25
              outline-none bg-white/70 rounded-sm focus:border-ink text-sm
            "
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="
              mt-2 px-4 py-1.5 border border-ink text-sm rounded-sm
              hover:bg-ink hover:text-paper transition
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {organizedComments.length > 0 ? (
          organizedComments.map(comment => renderComment(comment))
        ) : (
          <p className="text-sm opacity-60 text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
}

const HeartIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);