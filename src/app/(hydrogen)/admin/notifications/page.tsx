'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Notification } from '@/types/database';
import { ArrowLeft, Plus, Trash2, Megaphone } from 'lucide-react';

export default function AdminNotificationsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any)?.role !== 'admin') { router.push('/admin/login'); return; }
    loadNotifications();
  }, [status, session, router]);

  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications/all');
      if (res.ok) setNotifications(await res.json());
    } catch {} finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, published: true }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Đã tạo thông báo');
      setTitle('');
      setDescription('');
      loadNotifications();
    } catch { toast.error('Tạo thất bại'); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá thông báo này?')) return;
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Đã xoá');
      loadNotifications();
    } catch { toast.error('Xoá thất bại'); }
  };

  if (status === 'loading') return null;
  if (!session || (session.user as any)?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-paper">
      <div className="arionear-container py-10 md:py-16">
        <Link href="/admin" className="btn-meta mb-8 inline-flex"><ArrowLeft size={14} strokeWidth={1.5} /> Quay lại</Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <section className="lg:col-span-5">
            <p className="label-red mb-3">QUẢN LÝ</p>
            <h1 className="page-heading mb-2">Thông báo</h1>
            <p className="subheading mb-8">Tạo thông báo hiển thị trên trang chủ.</p>

            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-1.5">
                <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Tiêu đề</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" required />
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Mô tả</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field min-h-[100px]" />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full"><Plus size={16} strokeWidth={1.5} /> {submitting ? 'Đang tạo...' : 'Tạo thông báo'}</button>
            </form>
          </section>

          <section className="lg:col-span-7">
            <h2 className="section-heading text-ink mb-6">Thông báo gần đây</h2>
            {loading ? (
              <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-ink/10 border-t-ink rounded-full animate-spin" /></div>
            ) : notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((n) => (
                  <div key={n.id} className="card p-6 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Megaphone size={16} strokeWidth={1.5} className="text-ink-lighter" />
                        <h3 className="font-serif text-heading-4 font-bold text-ink">{n.title}</h3>
                      </div>
                      {n.description && <p className="text-body-sm text-ink-lighter">{n.description}</p>}
                      <p className="font-mono text-meta uppercase tracking-[0.1em] text-ink-lighter mt-2">{new Date(n.created_at).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <button onClick={() => handleDelete(n.id)} className="p-2 text-ink-lighter hover:text-red transition-colors duration-200 shrink-0"><Trash2 size={16} strokeWidth={1.5} /></button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-12 text-center"><p className="text-body-sm text-ink-lighter">Chưa có thông báo.</p></div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
