'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import {
  getForumThread, getForumComments, createForumComment,
  toggleThreadLike, getThreadLikeStatus, incrementThreadView,
  deleteForumThread, deleteForumComment,
} from '@/lib/user';
import type { ForumThread, ForumComment, User } from '@/types/database';
import { ArrowLeft, Heart, MessageCircle, Eye, Trash2, Loader2, Send } from 'lucide-react';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

export default function ThreadDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [thread, setThread] = useState<(ForumThread & { users?: User }) | null>(null);
  const [comments, setComments] = useState<(ForumComment & { users?: User })[]>([]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const userId = (session?.user as any)?.id;

  useEffect(() => {
    loadThread();
  }, [id]);

  const loadThread = async () => {
    try {
      const data = await getForumThread(id);
      if (!data) {
        router.push('/forum');
        return;
      }
      setThread(data);
      const c = await getForumComments(id);
      setComments(c);
      if (userId) {
        const likeStatus = await getThreadLikeStatus(userId, id);
        setLiked(likeStatus);
      }
      incrementThreadView(id);
    } catch {
      router.push('/forum');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!userId) return;
    const newLiked = await toggleThreadLike(userId, id);
    setLiked(newLiked);
    setThread((prev) => prev ? { ...prev, like_count: prev.like_count + (newLiked ? 1 : -1) } : prev);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newComment.trim()) return;
    setSending(true);
    try {
      await createForumComment(id, userId, newComment);
      setNewComment('');
      const c = await getForumComments(id);
      setComments(c);
      setThread((prev) => prev ? { ...prev, comment_count: prev.comment_count + 1 } : prev);
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  const handleDeleteThread = async () => {
    if (!userId || !thread) return;
    if (thread.user_id !== userId) return;
    if (confirm('Bạn có chắc muốn xoá bài viết này?')) {
      await deleteForumThread(id, userId);
      router.push('/forum');
    }
  };

  const handleDeleteComment = async (commentId: string, commentUserId: string) => {
    if (userId !== commentUserId) return;
    await deleteForumComment(commentId, userId);
    const c = await getForumComments(id);
    setComments(c);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Loader2 size={32} className="animate-spin text-ink-lighter" />
      </div>
    );
  }

  if (!thread) return null;

  return (
    <div className="min-h-screen bg-paper">
      <div className="arionear-container py-12">
        <Link href="/forum" className="inline-flex items-center gap-2 font-mono text-meta uppercase tracking-widest text-ink-lighter hover:text-ink mb-6">
          <ArrowLeft size={14} /> Quay lại diễn đàn
        </Link>

        {/* Thread */}
        <div className="border-2 border-ink bg-paper p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-serif text-heading-2 font-bold text-ink tracking-tight">{thread.title}</h1>
            {userId === thread.user_id && (
              <button onClick={handleDeleteThread} className="text-ink-lighter hover:text-red shrink-0">
                <Trash2 size={18} />
              </button>
            )}
          </div>

          <p className="whitespace-pre-wrap font-sans text-body text-ink leading-relaxed mt-4">{thread.content}</p>

          {thread.image_url && (
            <div className="mt-4 border-2 border-ink overflow-hidden max-w-lg">
              <img
                src={`/api/telegram/preview?fileId=${encodeURIComponent(thread.image_url)}&preview=true&mimeType=image/jpeg`}
                alt="Attachment"
                className="w-full h-auto object-contain max-h-96"
              />
            </div>
          )}

          <div className="flex items-center gap-4 mt-6 font-mono text-meta uppercase tracking-widest text-ink-lighter border-t border-ink/20 pt-4">
            <span className="font-sans text-body-sm text-ink font-medium">{thread.users?.name || 'Ẩn danh'}</span>
            <span>{dayjs(thread.created_at).fromNow()}</span>
            <span className="flex items-center gap-1"><Eye size={12} /> {thread.view_count}</span>
            <button onClick={handleLike} className="flex items-center gap-1 hover:text-red transition-colors">
              <Heart size={12} className={liked ? 'fill-red text-red' : ''} /> {thread.like_count}
            </button>
            <span className="flex items-center gap-1"><MessageCircle size={12} /> {thread.comment_count}</span>
          </div>
        </div>

        {/* Comments */}
        <div className="mt-8">
          <h2 className="font-serif text-heading-3 font-bold text-ink mb-4">
            Bình luận ({comments.length})
          </h2>

          {session?.user && (
            <form onSubmit={handleComment} className="flex gap-3 mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết bình luận..."
                rows={2}
                className="flex-1 border border-ink bg-transparent px-4 py-3 text-body-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none resize-none"
              />
              <button
                type="submit"
                disabled={sending || !newComment.trim()}
                className="self-end bg-ink text-paper px-4 py-3 border-2 border-ink hover:bg-red transition-colors disabled:opacity-50"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
          )}

          <div className="space-y-3">
            {comments.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-ink/20">
                <MessageCircle size={32} className="mx-auto text-ink-lighter/40 mb-2" />
                <p className="font-sans text-body-sm text-ink-lighter">Chưa có bình luận nào</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border border-ink/20 bg-paper p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-body-sm text-ink font-medium">
                          {comment.users?.name || 'Ẩn danh'}
                        </span>
                        <span className="font-mono text-meta text-ink-lighter">
                          {dayjs(comment.created_at).fromNow()}
                        </span>
                      </div>
                      <p className="font-sans text-body-sm text-ink mt-2 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                    {userId === comment.user_id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id, comment.user_id)}
                        className="text-ink-lighter hover:text-red shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
