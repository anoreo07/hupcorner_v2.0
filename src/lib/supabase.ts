import { supabase } from './supabaseClient';
import type { Major, DocumentWithMajor, Document, DocumentInsert, Subject, Notification } from '@/types/database';

export { supabase };

export async function getMajors(): Promise<Major[]> {
  const { data, error } = await supabase.from('majors').select('*').order('name');
  if (error) throw error;
  return (data || []) as Major[];
}

export async function getSubjects(): Promise<Subject[]> {
  const { data, error } = await supabase.from('subjects').select('*').order('name');
  if (error) throw error;
  return (data || []) as Subject[];
}

export async function getSubjectById(id: string): Promise<Subject | null> {
  const { data, error } = await supabase.from('subjects').select('*').eq('id', id).single();
  if (error) return null;
  return data as Subject;
}

export async function getApprovedDocuments(majorCode?: string): Promise<DocumentWithMajor[]> {
  if (typeof window === 'undefined') {
    const { getSupabaseAdmin } = await import('./supabaseAdmin');
    const supabaseAdmin = getSupabaseAdmin();
    let query = supabaseAdmin
      .from('documents')
      .select('*, majors(*)')
      .eq('status', 'APPROVED')
      .neq('document_type', 'OUTLINE')
      .order('created_at', { ascending: false });

    if (majorCode) {
      const { data: major } = await supabaseAdmin.from('majors').select('id').eq('code', majorCode).single();
      if (major) query = query.eq('major_id', (major as Major).id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as DocumentWithMajor[];
  }

  const url = majorCode ? `/api/documents/approved?majorCode=${encodeURIComponent(majorCode)}` : '/api/documents/approved';
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch approved documents');
  return (await res.json()) as DocumentWithMajor[];
}

export async function getApprovedDocumentsPaginated(
  majorCode?: string,
  page: number = 1,
  perPage: number = 12
): Promise<{ data: DocumentWithMajor[]; count: number; page: number; perPage: number; totalPages: number }> {
  const start = (page - 1) * perPage;
  const end = start + perPage - 1;

  if (typeof window === 'undefined') {
    const { getSupabaseAdmin } = await import('./supabaseAdmin');
    const supabaseAdmin = getSupabaseAdmin();
    let query = supabaseAdmin
      .from('documents')
      .select('*, majors(*)', { count: 'exact' })
      .eq('status', 'APPROVED')
      .neq('document_type', 'OUTLINE')
      .order('created_at', { ascending: false })
      .range(start, end);

    if (majorCode) {
      const { data: major } = await supabaseAdmin.from('majors').select('id').eq('code', majorCode).single();
      if (major) query = query.eq('major_id', (major as Major).id);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    return { data: (data || []) as DocumentWithMajor[], count: total, page, perPage, totalPages };
  }

  const url = majorCode
    ? `/api/documents/approved?majorCode=${encodeURIComponent(majorCode)}&page=${page}&perPage=${perPage}`
    : `/api/documents/approved?page=${page}&perPage=${perPage}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch approved documents');
  return (await res.json()) as { data: DocumentWithMajor[]; count: number; page: number; perPage: number; totalPages: number };
}

export async function getPendingDocuments(): Promise<DocumentWithMajor[]> {
  if (typeof window === 'undefined') {
    const { getSupabaseAdmin } = await import('./supabaseAdmin');
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('documents')
      .select('*, majors(*)')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as DocumentWithMajor[];
  }
  const res = await fetch('/api/documents/pending', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch pending documents');
  return (await res.json()) as DocumentWithMajor[];
}

export async function getAllDocumentsForAdmin(): Promise<DocumentWithMajor[]> {
  if (typeof window === 'undefined') {
    const { getSupabaseAdmin } = await import('./supabaseAdmin');
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('documents')
      .select('*, majors(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as DocumentWithMajor[];
  }
  const { data, error } = await supabase
    .from('documents')
    .select('*, majors(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as DocumentWithMajor[];
}

export async function uploadDocument(doc: DocumentInsert): Promise<Document> {
  const response = await fetch('/api/documents/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doc),
  });
  if (!response.ok) throw new Error('Failed to upload document');
  return response.json();
}

export async function getNotifications(): Promise<Notification[]> {
  if (typeof window === 'undefined') {
    const { getSupabaseAdmin } = await import('./supabaseAdmin');
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(5);
    if (error) throw error;
    return (data || []) as Notification[];
  }
  const res = await fetch('/api/notifications', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return (await res.json()) as Notification[];
}

export async function approveDocument(id: string): Promise<Document> {
  const response = await fetch('/api/documents/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) throw new Error('Failed to approve document');
  return response.json();
}

export async function rejectDocument(id: string): Promise<Document> {
  const response = await fetch('/api/documents/reject', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) throw new Error('Failed to reject document');
  return response.json();
}

export async function deleteDocument(id: string): Promise<boolean> {
  const response = await fetch('/api/documents/delete', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) throw new Error('Failed to delete document');
  return true;
}

export async function getOtherDocumentsPaginated(
  page: number = 1,
  perPage: number = 12
): Promise<{ data: DocumentWithMajor[]; count: number; page: number; perPage: number; totalPages: number }> {
  const start = (page - 1) * perPage;
  const end = start + perPage - 1;

  if (typeof window === 'undefined') {
    const { getSupabaseAdmin } = await import('./supabaseAdmin');
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error, count } = await supabaseAdmin
      .from('documents')
      .select('*, majors(*)', { count: 'exact' })
      .eq('status', 'APPROVED')
      .neq('document_type', 'OUTLINE')
      .is('major_id', null)
      .order('created_at', { ascending: false })
      .range(start, end);
    if (error) throw error;
    const totalPages = Math.ceil((count || 0) / perPage);
    return { data: (data as DocumentWithMajor[]) || [], count: count || 0, page, perPage, totalPages };
  }
  return { data: [], count: 0, page, perPage, totalPages: 0 };
}

export async function getSiteReviews() {
  const { data, error } = await supabase
    .from('site_reviews')
    .select('*')
    .not('title', 'ilike', 'Đánh giá:%')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function submitSiteReview(review: {
  rating: number;
  title: string;
  content: string;
  user_name?: string;
  is_anonymous: boolean;
  ip_address: string;
}) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await supabase
    .from('site_reviews')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', review.ip_address)
    .gt('created_at', oneHourAgo);
  if (countError) throw countError;
  if (count && count > 0) {
    throw new Error('Bạn chỉ có thể gửi đánh giá 1 lần mỗi giờ. Vui lòng quay lại sau.');
  }
  const { data, error } = await supabase.from('site_reviews').insert([review]).select().single();
  if (error) throw error;
  return data;
}

export async function getDocumentById(id: string): Promise<DocumentWithMajor | null> {
  if (typeof window === 'undefined') {
    const { getSupabaseAdmin } = await import('./supabaseAdmin');
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.from('documents').select('*, majors(*)').eq('id', id).single();
    if (error) return null;
    return data as DocumentWithMajor;
  }
  const { data, error } = await supabase.from('documents').select('*, majors(*)').eq('id', id).single();
  if (error) return null;
  return data as DocumentWithMajor;
}

export async function getRelatedDocuments(doc: DocumentWithMajor): Promise<DocumentWithMajor[]> {
  if (typeof window === 'undefined') {
    const { getSupabaseAdmin } = await import('./supabaseAdmin');
    const supabaseAdmin = getSupabaseAdmin();
    let query = supabaseAdmin
      .from('documents')
      .select('*, majors(*)')
      .eq('status', 'APPROVED')
      .neq('id', doc.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (doc.subject_name) {
      query = query.eq('subject_name', doc.subject_name);
    } else if (doc.major_id) {
      query = query.eq('major_id', doc.major_id);
    }

    const { data, error } = await query;
    if (error) return [];
    return (data || []) as DocumentWithMajor[];
  }
  const { data, error } = await supabase
    .from('documents')
    .select('*, majors(*)')
    .eq('status', 'APPROVED')
    .neq('id', doc.id)
    .order('created_at', { ascending: false })
    .limit(5);
  if (error) return [];
  return (data || []) as DocumentWithMajor[];
}

export async function getDocumentsByUser(userId: string): Promise<DocumentWithMajor[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*, majors(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []) as DocumentWithMajor[];
}

export async function getDocumentsBySubject(subjectId: string): Promise<DocumentWithMajor[]> {
  if (typeof window === 'undefined') {
    const { getSupabaseAdmin } = await import('./supabaseAdmin');
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('documents')
      .select('*, majors(*)')
      .eq('status', 'APPROVED')
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as DocumentWithMajor[];
  }
  const { data, error } = await supabase
    .from('documents')
    .select('*, majors(*)')
    .eq('status', 'APPROVED')
    .eq('subject_id', subjectId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as DocumentWithMajor[];
}
