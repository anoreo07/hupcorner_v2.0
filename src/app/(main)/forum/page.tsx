'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { getForumThreads } from '@/lib/user';
import type { ForumThread, User } from '@/types/database';
import { Loader2, MessageCircle, Eye, Heart, Plus } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

export default function ForumPage() {
  const { data: session } = useSession();
  const [threads, setThreads] = useState<(ForumThread & { users?: User })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCharacter, setShowCharacter] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    loadThreads();

    const hasSeen = sessionStorage.getItem('hup_corner_forum_character');
    if (hasSeen) {
      setShowCharacter(false);
      return;
    }

    const timer = setTimeout(() => {
      setFadingOut(true);
      setTimeout(() => {
        setShowCharacter(false);
        sessionStorage.setItem('hup_corner_forum_character', 'true');
      }, 500);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const loadThreads = async () => {
    try {
      const data = await getForumThreads();
      setThreads(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Loader2 size={32} className="animate-spin text-ink-lighter" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="arionear-container py-12">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="font-serif text-heading-1 font-bold text-ink leading-[0.92] tracking-tight">
              DIỄN ĐÀN
            </h1>
            <p className="subheading mt-1">Thảo luận và chia sẻ kiến thức cùng cộng đồng</p>
          </div>
          {session?.user && (
            <Link
              href="/forum/new"
              className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2"
            >
              <Plus size={16} /> Bài mới
            </Link>
          )}
        </div>

        <div className="mt-8 space-y-3">
          {threads.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-ink/20">
              <MessageCircle size={48} className="mx-auto text-ink-lighter/40 mb-3" />
              <p className="font-sans text-body text-ink-lighter">Chưa có bài thảo luận nào</p>
              {session?.user && (
                <Link href="/forum/new" className="btn-primary inline-flex items-center gap-2 mt-4 text-sm py-2.5 px-5">
                  <Plus size={16} /> Tạo bài viết đầu tiên
                </Link>
              )}
            </div>
          ) : (
            threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/forum/${thread.id}`}
                className="block border-2 border-ink bg-paper p-5 hover:shadow-[4px_4px_0px_0px_#111] transition-shadow"
              >
                <h2 className="font-serif font-bold text-lg text-ink">{thread.title}</h2>
                <p className="font-sans text-body-sm text-ink-lighter mt-1 line-clamp-2">{thread.content}</p>
                <div className="flex items-center gap-4 mt-3 font-mono text-meta uppercase tracking-widest text-ink-lighter">
                  <span>{thread.users?.name || 'Ẩn danh'}</span>
                  <span>{dayjs(thread.created_at).fromNow()}</span>
                  <span className="flex items-center gap-1"><Eye size={12} /> {thread.view_count}</span>
                  <span className="flex items-center gap-1"><Heart size={12} /> {thread.like_count}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={12} /> {thread.comment_count}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Character chat bubble */}
      {showCharacter && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-end gap-0 transition-all duration-500 ${fadingOut ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
          <div className="relative bg-paper border-2 border-ink p-4 max-w-[260px] shadow-[4px_4px_0px_0px_#111]">
            <p className="font-sans text-body-sm text-ink leading-relaxed">
              Hãy sử dụng diễn đàn một cách văn minh nhé! {'\uD83D\uDE0A'}
            </p>
            <div className="absolute -right-[11px] bottom-3 w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-ink border-b-[8px] border-b-transparent" />
            <div className="absolute -right-[9px] bottom-3 w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-paper border-b-[6px] border-b-transparent" />
          </div>
          <img
            src="/character.png"
            alt="Character"
            className="w-28 h-28 object-contain -ml-[1px]"
          />
        </div>
      )}
    </div>
  );
}
