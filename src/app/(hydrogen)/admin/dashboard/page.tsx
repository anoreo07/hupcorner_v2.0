'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { DocumentWithMajor, DocumentStatus, DocumentType } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { Loading } from '@/components/ui/loading';
import { ArrowLeft, Eye, Download, Check, X, Trash2, RefreshCw, FileText } from 'lucide-react';

const documentTypeLabels: Record<DocumentType, string> = {
  EXAM: 'Đề thi', SLIDE: 'Bài giảng', TEXTBOOK: 'Giáo trình', OUTLINE: 'Đề cương', OTHER: 'Khác',
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [documents, setDocuments] = useState<DocumentWithMajor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [actionId, setActionId] = useState<string | null>(null);

  const loadDocuments = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch('/api/admin/documents/all', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setDocuments(data || []);
    } catch {
      if (!silent) toast.error('Không thể tải tài liệu');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any)?.role !== 'admin') { router.push('/admin/login'); return; }
    loadDocuments();
  }, [status, session, router, loadDocuments]);

  useEffect(() => {
    const interval = setInterval(() => loadDocuments(true), 15000);
    let bc: BroadcastChannel | null = null;
    try { bc = new BroadcastChannel('documents'); bc.onmessage = () => loadDocuments(true); } catch {}
    const handleStorage = (e: StorageEvent) => { if (e.key === 'documents-updated') loadDocuments(true); };
    window.addEventListener('storage', handleStorage);
    return () => { clearInterval(interval); bc?.close(); window.removeEventListener('storage', handleStorage); };
  }, [loadDocuments]);

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      const res = await fetch('/api/documents/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error('Approve failed');
      toast.success('Đã phê duyệt tài liệu');
      loadDocuments(true);
    } catch { toast.error('Phê duyệt thất bại'); } finally { setActionId(null); }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Từ chối tài liệu này? Tệp sẽ bị xoá.')) return;
    setActionId(id);
    try {
      const res = await fetch('/api/documents/reject', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error('Reject failed');
      toast.success('Đã từ chối tài liệu');
      loadDocuments(true);
    } catch { toast.error('Từ chối thất bại'); } finally { setActionId(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá vĩnh viễn tài liệu này?')) return;
    setActionId(id);
    try {
      const res = await fetch('/api/documents/delete', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Đã xoá tài liệu');
      loadDocuments(true);
    } catch { toast.error('Xoá thất bại'); } finally { setActionId(null); }
  };

  const filteredDocuments = documents.filter((doc) => filter === 'all' || doc.status === filter);
  const counts = {
    total: documents.length,
    pending: documents.filter(d => d.status === 'PENDING').length,
    approved: documents.filter(d => d.status === 'APPROVED').length,
    rejected: documents.filter(d => d.status === 'REJECTED').length,
  };

  if (status === 'loading') return <Loading className="min-h-screen" />;
  if (!session || (session.user as any)?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-paper">
      <div className="arionear-container py-10 md:py-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
          <div>
            <Link href="/admin" className="btn-meta mb-2 inline-flex"><ArrowLeft size={14} strokeWidth={1.5} /> Quay lại</Link>
            <h1 className="page-heading mt-2">Kiểm duyệt tài liệu</h1>
            <p className="subheading mt-1">Xem xét và quản lý tài liệu được gửi lên.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => loadDocuments()} className="btn-outline"><RefreshCw size={16} strokeWidth={1.5} /> Làm mới</button>
            <Link href="/admin/notifications" className="btn-primary">Tạo thông báo</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink/10 mb-10">
          {[
            { label: 'Tổng số', value: counts.total, key: 'all' as const },
            { label: 'Chờ duyệt', value: counts.pending, key: 'PENDING' as const },
            { label: 'Đã duyệt', value: counts.approved, key: 'APPROVED' as const },
            { label: 'Từ chối', value: counts.rejected, key: 'REJECTED' as const },
          ].map((stat) => (
            <button
              key={stat.key}
              onClick={() => setFilter(stat.key)}
              className={`bg-paper p-6 text-left transition-colors duration-200 ${filter === stat.key ? 'ring-1 ring-ink ring-inset' : 'hover:bg-paper-light'}`}
            >
              <p className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">{stat.label}</p>
              <p className="font-serif text-heading-1 font-bold text-ink leading-none mt-1">{stat.value}</p>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="border border-ink overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header text-left pl-6">Tiêu đề</th>
                  <th className="table-header text-left">Loại</th>
                  <th className="table-header text-left">Môn học</th>
                  <th className="table-header text-left">Trạng thái</th>
                  <th className="table-header text-left">Ngày</th>
                  <th className="table-header text-right pr-6">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="transition-colors duration-200">
                    <td className="table-cell pl-6 font-medium max-w-[250px] truncate">{doc.title}</td>
                    <td className="table-cell">{documentTypeLabels[doc.document_type]}</td>
                    <td className="table-cell">{doc.subject_name || '—'}</td>
                    <td className="table-cell">
                      <Badge variant={doc.status === 'APPROVED' ? 'success' : doc.status === 'REJECTED' ? 'danger' : 'warning'}>
                        {doc.status === 'PENDING' ? 'Chờ duyệt' : doc.status === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
                      </Badge>
                    </td>
                    <td className="table-cell font-mono text-meta">{new Date(doc.created_at).toLocaleDateString('vi-VN')}</td>
                    <td className="table-cell text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/documents/${doc.id}`} className="p-2 text-ink-lighter hover:text-ink transition-colors duration-200"><Eye size={16} strokeWidth={1.5} /></Link>
                        {doc.status === 'PENDING' && (
                          <>
                            <button onClick={() => handleApprove(doc.id)} disabled={actionId === doc.id} className="p-2 text-ink hover:text-red transition-colors duration-200 disabled:opacity-30"><Check size={16} strokeWidth={1.5} /></button>
                            <button onClick={() => handleReject(doc.id)} disabled={actionId === doc.id} className="p-2 text-ink-lighter hover:text-red transition-colors duration-200 disabled:opacity-30"><X size={16} strokeWidth={1.5} /></button>
                          </>
                        )}
                        <button onClick={() => handleDelete(doc.id)} disabled={actionId === doc.id} className="p-2 text-ink-lighter hover:text-red transition-colors duration-200 disabled:opacity-30"><Trash2 size={16} strokeWidth={1.5} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredDocuments.length === 0 && (
                  <tr><td colSpan={6} className="p-12 text-center text-body-sm text-ink-lighter">Không tìm thấy tài liệu.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
