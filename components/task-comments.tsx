'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TaskComment {
  id: string;
  task_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface TaskCommentsProps {
  projectId: string;
  taskId: string;
  comments: TaskComment[];
  onCommentAdded?: () => void;
}

export function TaskComments({
  projectId,
  taskId,
  comments,
  onCommentAdded,
}: TaskCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        setNewComment('');
        router.refresh();
        onCommentAdded?.();
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold text-foreground">Comments</h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{comments.length}</span>
      </div>

      {/* Comments List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="rounded bg-muted/50 p-3">
              <div className="flex items-start justify-between mb-1">
                <p className="text-sm font-medium text-foreground">Author</p>
                <p className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</p>
              </div>
              <p className="text-sm text-foreground">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Add Comment */}
      <div className="flex gap-2 pt-2 border-t border-border">
        <Input
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              handleAddComment();
            }
          }}
          className="text-sm"
        />
        <Button
          size="sm"
          onClick={handleAddComment}
          disabled={!newComment.trim() || isSubmitting}
          className="gap-1"
        >
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">Send</span>
        </Button>
      </div>
    </div>
  );
}
