import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { ArrowLeft } from 'lucide-react';
import dayjs from 'dayjs';
import type { User } from '@/types/database';

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

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUserById(id);
  if (!user) notFound();

  return (
    <div className="min-h-screen bg-white">
      <div className="arionear-container py-8 md:py-12">
        <Link href="/home" className="inline-flex items-center gap-2 text-ink-lighter hover:text-ink transition-colors mb-8">
          <ArrowLeft size={16} />
          <span className="font-mono text-meta uppercase tracking-[0.15em]">Trang chủ</span>
        </Link>

        <div className="max-w-[400px] mx-auto">
          <div className="border-2 border-ink bg-paper shadow-[6px_6px_0px_0px_#111] p-6">
            {/* Avatar */}
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
        </div>
      </div>
    </div>
  );
}
