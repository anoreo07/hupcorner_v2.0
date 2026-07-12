import { getSupabaseAdmin } from './supabaseAdmin';
import { supabase } from './supabaseClient';
import type {
  User, StudentVerification, Bookmark, DownloadRecord,
  DocumentComment, ForumThread, ForumComment, VideoLecture,
} from '@/types/database';

const sb = {
  from: (table: string) => supabase.from(table) as any,
  admin: (table: string) => getSupabaseAdmin().from(table) as any,
};

/* ─── User API ─── */

export async function getCurrentUser(): Promise<User | null> {
  const res = await fetch('/api/auth/user');
  if (!res.ok) return null;
  return res.json();
}

export async function updateProfile(data: { name?: string; description?: string; avatar_url?: string }): Promise<User> {
  const res = await fetch('/api/auth/user', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error);
  }
  return res.json();
}

export async function deleteAccount(): Promise<void> {
  const res = await fetch('/api/auth/delete-account', { method: 'POST' });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error);
  }
}

export async function unlockAccount(): Promise<void> {
  const res = await fetch('/api/auth/unlock', { method: 'POST' });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error);
  }
}

/* ─── Bookmarks ─── */

export async function getBookmarks(userId: string): Promise<Bookmark[]> {
  const { data } = await sb.from('bookmarks')
    .select('*, documents(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return (data || []) as any;
}

export async function addBookmark(userId: string, documentId: string): Promise<void> {
  await sb.from('bookmarks').insert({ user_id: userId, document_id: documentId });
}

export async function removeBookmark(userId: string, documentId: string): Promise<void> {
  await sb.from('bookmarks').delete().eq('user_id', userId).eq('document_id', documentId);
}

/* ─── Download History ─── */

export async function getDownloadHistory(userId: string): Promise<DownloadRecord[]> {
  const { data } = await sb.from('download_history')
    .select('*, documents(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return (data || []) as any;
}

export async function recordDownload(userId: string, documentId: string): Promise<void> {
  await sb.from('download_history').insert({ user_id: userId, document_id: documentId });
}

/* ─── Document Comments ─── */

export async function getDocumentComments(documentId: string): Promise<(DocumentComment & { users?: User })[]> {
  const { data } = await sb.from('document_comments')
    .select('*, users!inner(*)')
    .eq('document_id', documentId)
    .order('created_at', { ascending: true });
  return (data || []) as any;
}

export async function addDocumentComment(documentId: string, userId: string, content: string): Promise<void> {
  await sb.from('document_comments').insert({ document_id: documentId, user_id: userId, content });
}

export async function deleteDocumentComment(commentId: string, userId: string): Promise<void> {
  await sb.from('document_comments').delete().eq('id', commentId).eq('user_id', userId);
}

/* ─── Forum ─── */

export async function getForumThreads(): Promise<(ForumThread & { users?: User })[]> {
  const { data } = await sb.from('forum_threads')
    .select('*, users!inner(*)')
    .order('created_at', { ascending: false });
  return (data || []) as any;
}

export async function getForumThread(id: string): Promise<(ForumThread & { users?: User }) | null> {
  const { data } = await sb.from('forum_threads')
    .select('*, users!inner(*)')
    .eq('id', id)
    .single();
  return data as any;
}

export async function createForumThread(title: string, content: string, image_url?: string): Promise<void> {
  const res = await fetch('/api/forum/threads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, image_url }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error);
  }
}

export async function updateForumThread(id: string, userId: string, title: string, content: string): Promise<void> {
  await sb.from('forum_threads').update({ title, content }).eq('id', id).eq('user_id', userId);
}

export async function deleteForumThread(id: string, userId: string): Promise<void> {
  await sb.from('forum_threads').delete().eq('id', id).eq('user_id', userId);
}

export async function incrementThreadView(id: string): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  await (supabaseAdmin as any).rpc('increment_thread_view', { thread_id: id });
}

export async function getForumComments(threadId: string): Promise<(ForumComment & { users?: User })[]> {
  const res = await fetch(`/api/forum/comments?threadId=${encodeURIComponent(threadId)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function createForumComment(threadId: string, userId: string, content: string): Promise<void> {
  const res = await fetch('/api/forum/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ thread_id: threadId, content }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error);
  }
}

export async function deleteForumComment(commentId: string, userId: string): Promise<void> {
  const res = await fetch(`/api/forum/comments?id=${encodeURIComponent(commentId)}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error);
  }
}

export async function toggleThreadLike(userId: string, threadId: string): Promise<boolean> {
  const { data: existing } = await sb.from('forum_likes')
    .select('id')
    .eq('user_id', userId)
    .eq('thread_id', threadId)
    .maybeSingle();
  if (existing) {
    await sb.from('forum_likes').delete().eq('id', existing.id);
    return false;
  } else {
    await sb.from('forum_likes').insert({ user_id: userId, thread_id: threadId });
    return true;
  }
}

export async function getThreadLikeStatus(userId: string, threadId: string): Promise<boolean> {
  const { data } = await sb.from('forum_likes')
    .select('id')
    .eq('user_id', userId)
    .eq('thread_id', threadId)
    .maybeSingle();
  return !!data;
}

/* ─── Video Lectures ─── */

export async function getVideoLectures(): Promise<VideoLecture[]> {
  const { data } = await sb.from('video_lectures')
    .select('*')
    .order('created_at', { ascending: false });
  return (data || []) as VideoLecture[];
}

/* ─── Student Verifications ─── */

export async function submitStudentVerification(
  userId: string,
  data: { full_name: string; student_id: string; id_card_image: string }
): Promise<void> {
  await sb.from('student_verifications').insert({
    user_id: userId,
    full_name: data.full_name,
    student_id: data.student_id,
    id_card_image: data.id_card_image,
  });
}

export async function getStudentVerification(userId: string): Promise<StudentVerification | null> {
  const { data } = await sb.from('student_verifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as StudentVerification | null;
}
