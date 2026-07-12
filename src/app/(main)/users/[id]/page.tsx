import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { ArrowLeft, FileText } from 'lucide-react';
import dayjs from 'dayjs';
import type { User, DocumentWithMajor } from '@/types/database';

const roleLabels: Record<string, string> = {
  USER: 'SINH VIÊN',
  PHARMACY_STUDENT: 'SINH VIÊN DƯỢC',
  ADMIN: 'QUẢN TRỊ VIÊN',
};

const roleBadgeColors: Record<string, string> = {
  USER: 'bg-yellow-200',
  PHARMACY_STUDENT: 'bg-green-200',
  ADMIN: 'bg-red-200',
};

async function getUserById(id: string): Promise<User | null> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  return data as User | null;
}

async function getUserDocuments(userId: string): Promise<DocumentWithMajor[]> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await (supabaseAdmin as any)
    .from('documents')
    .select('*, majors(*)')
    .eq('user_id', userId)
    .eq('status', 'APPROVED')
    .order('created_at', { ascending: false })
    .limit(20);
  return (data || []) as DocumentWithMajor[];
}

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUserById(id);
  if (!user) notFound();

  const documents = await getUserDocuments(id);

  return (
    <div className="min-h-screen bg-paper">
      <div className="arionear-container py-8 md:py-12">
        <Link href="/home" className="inline-flex items-center gap-2 text-ink-lighter hover:text-ink transition-colors mb-8">
          <ArrowLeft size={16} />
          <span className="font-mono text-meta uppercase tracking-[0.15em]">Trang chủ</span>
        </Link>

        <div className="max-w-[600px] mx-auto">
          {/* Profile Card */}
          <div className="border-2 border-ink bg-paper shadow-[6px_6px_0px_0px_#111] p-6">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <div className="w-full h-full border-2 border-ink overflow-hidden bg-ink-lighter">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url.startsWith('http') ? user.avatar_url : `/api/telegram/preview?fileId=${encodeURIComponent(user.avatar_url)}&preview=true&mimeType=image/jpeg`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-paper font-serif text-4xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <h1 className="font-serif text-2xl font-bold text-ink text-center">{user.name}</h1>
            <p className="font-mono text-meta text-ink-lighter text-center mt-1">@{user.username}</p>

            <div className="flex justify-center mt-3">
              <span className={`px-3 py-1 border-2 border-ink font-mono text-meta uppercase tracking-widest font-bold ${roleBadgeColors[user.role] || 'bg-yellow-200'}`}>
                {roleLabels[user.role] || user.role}
              </span>
            </div>

            {user.description && (
              <>
                <hr className="border-t border-ink/20 my-4" />
                <p className="font-sans text-body-sm text-ink leading-relaxed whitespace-pre-line text-center">
                  {user.description}
                </p>
              </>
            )}

            <hr className="border-t border-ink/20 my-4" />

            <div className="space-y-3">
              <div>
                <p className="font-mono text-meta uppercase tracking-widest text-ink-lighter">Thành viên từ</p>
                <p className="font-sans text-body-sm text-ink font-medium">
                  {dayjs(user.created_at).format('DD/MM/YYYY')}
                </p>
              </div>
            </div>
          </div>

          {/* Contributed Documents */}
          <div className="mt-8">
            <h2 className="font-serif text-heading-3 font-bold text-ink mb-4">
              Tài liệu đã đóng góp ({documents.length})
            </h2>

            {documents.length === 0 ? (
              <div className="border-2 border-dashed border-ink/20 p-8 text-center">
                <FileText size={32} className="mx-auto text-ink-lighter/40 mb-2" />
                <p className="font-sans text-body-sm text-ink-lighter">Chưa có tài liệu nào</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/documents/${doc.id}`}
                    className="flex items-center gap-3 border border-ink/20 bg-paper p-4 hover:border-ink transition-colors group"
                  >
                    <div className="w-10 h-10 border border-ink/20 flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-ink-lighter" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-body-sm text-ink font-medium truncate group-hover:text-red transition-colors">
                        {doc.title}
                      </p>
                      <p className="font-mono text-meta text-ink-lighter mt-0.5">
                        {doc.majors?.name || ''}{doc.majors?.name && ' • '}{dayjs(doc.created_at).format('DD/MM/YYYY')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
