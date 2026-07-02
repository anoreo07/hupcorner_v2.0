'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Check, X, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

interface Verification {
  id: string;
  user_id: string;
  full_name: string;
  student_id: string;
  id_card_image: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  users: {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
  };
}

export default function AdminVerificationsPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus === 'loading') return;
    if (!session || (session.user as any)?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    loadVerifications();
  }, [sessionStatus, session]);

  const loadVerifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/verifications');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setVerifications(data);
    } catch {
      toast.error('Không thể tải danh sách xác nhận');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/verifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error();

      toast.success(status === 'APPROVED' ? 'Đã xác nhận sinh viên Dược' : 'Đã từ chối');
      loadVerifications();
    } catch {
      toast.error('Thao tác thất bại');
    } finally {
      setProcessing(null);
    }
  };

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Loader2 size={32} className="animate-spin text-ink-lighter" />
      </div>
    );
  }

  const pending = verifications.filter(v => v.status === 'PENDING');
  const history = verifications.filter(v => v.status !== 'PENDING');

  return (
    <div className="min-h-screen bg-paper">
      <div className="arionear-container py-6 md:py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="label-red mb-2">QUẢN TRỊ</p>
            <h1 className="page-heading">Xác nhận sinh viên Dược</h1>
            <p className="subheading mt-2">Duyệt yêu cầu xác nhận sinh viên trường Đại học Dược.</p>
          </div>
          <button onClick={loadVerifications} className="btn-outline text-sm py-2 px-4" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
          </button>
        </div>

        {/* Pending */}
        <div className="mb-10">
          <h2 className="section-heading text-heading-2 mb-4">
            Chờ duyệt <span className="text-red font-mono text-meta align-middle ml-2">({pending.length})</span>
          </h2>

          {pending.length === 0 ? (
            <div className="border-2 border-dashed border-ink/20 p-12 text-center">
              <p className="font-sans text-body text-ink-lighter">Không có yêu cầu xác nhận nào đang chờ</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((v) => (
                <div key={v.id} className="border-2 border-ink bg-paper p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-serif font-bold text-lg text-ink">{v.full_name || v.users.name}</h3>
                        <span className="badge bg-yellow-200 text-ink border-ink text-meta px-2 py-0.5">PENDING</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-body-sm">
                        <div>
                          <span className="font-mono text-meta uppercase tracking-widest text-ink-lighter block">Email</span>
                          <span className="text-ink">{v.users.email}</span>
                        </div>
                        <div>
                          <span className="font-mono text-meta uppercase tracking-widest text-ink-lighter block">Username</span>
                          <span className="text-ink">@{v.users.username}</span>
                        </div>
                        <div>
                          <span className="font-mono text-meta uppercase tracking-widest text-ink-lighter block">Mã sinh viên</span>
                          <span className="text-ink">{v.student_id || '—'}</span>
                        </div>
                        <div>
                          <span className="font-mono text-meta uppercase tracking-widest text-ink-lighter block">Ngày gửi</span>
                          <span className="text-ink">{dayjs(v.created_at).format('DD/MM/YYYY HH:mm')}</span>
                        </div>
                      </div>
                      {v.id_card_image && (
                        <div className="mt-3">
                          <span className="font-mono text-meta uppercase tracking-widest text-ink-lighter block mb-1">Ảnh thẻ</span>
                          <img src={v.id_card_image} alt="Student card" className="w-48 border border-ink" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleAction(v.id, 'APPROVED')}
                        disabled={processing === v.id}
                        className="bg-green-500 text-white border-2 border-ink px-4 py-2 text-body-sm font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {processing === v.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        Duyệt
                      </button>
                      <button
                        onClick={() => handleAction(v.id, 'REJECTED')}
                        disabled={processing === v.id}
                        className="bg-red text-white border-2 border-ink px-4 py-2 text-body-sm font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-red-dark transition-colors disabled:opacity-50"
                      >
                        <X size={14} />
                        Từ chối
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        <div>
          <h2 className="section-heading text-heading-2 mb-4">Lịch sử duyệt</h2>
          {history.length === 0 ? (
            <div className="border-2 border-dashed border-ink/20 p-12 text-center">
              <p className="font-sans text-body text-ink-lighter">Chưa có lịch sử duyệt</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((v) => (
                <div key={v.id} className="border border-ink/20 bg-paper p-4 flex items-center justify-between">
                  <div>
                    <p className="font-serif font-semibold text-ink">{v.full_name || v.users.name}</p>
                    <p className="font-mono text-meta text-ink-lighter">{v.users.email} · {dayjs(v.created_at).format('DD/MM/YYYY')}</p>
                  </div>
                  <span className={`px-3 py-1 border-2 border-ink font-mono text-meta uppercase font-bold ${
                    v.status === 'APPROVED' ? 'bg-green-200 text-green-800' : 'bg-red-100 text-red'
                  }`}>
                    {v.status === 'APPROVED' ? 'ĐÃ DUYỆT' : 'ĐÃ TỪ CHỐI'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
