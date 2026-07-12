'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Camera, Bookmark as BookmarkIcon, Download, Upload, AlertTriangle, Loader2, LogOut, Save } from 'lucide-react';
import { getCurrentUser, updateProfile, deleteAccount, getBookmarks, getDownloadHistory } from '@/lib/user';
import { getDocumentsByUser } from '@/lib/supabase';
import type { User, Bookmark, DownloadRecord, DocumentWithMajor } from '@/types/database';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

type TabKey = 'bookmarks' | 'downloads' | 'uploads';

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

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('bookmarks');
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [downloads, setDownloads] = useState<any[]>([]);
  const [uploads, setUploads] = useState<DocumentWithMajor[]>([]);
  const [error, setError] = useState('');

  // Edit form
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Danger zone
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');

  // Avatar upload
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status !== 'authenticated') return;
    loadUser();
  }, [status]);

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser();
      if (!userData) {
        router.push('/login');
        return;
      }
      setUser(userData);
      setEditName(userData.name);
      setEditDescription(userData.description || '');
      loadBookmarks(userData.id);
      loadDownloads(userData.id);
      loadUploads(userData.id);
    } catch {
      setError('Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = async (userId: string) => {
    const data = await getBookmarks(userId);
    setBookmarks(data);
  };

  const loadDownloads = async (userId: string) => {
    const data = await getDownloadHistory(userId);
    setDownloads(data);
  };

  const loadUploads = async (userId: string) => {
    const data = await getDocumentsByUser(userId);
    setUploads(data);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError('');
    try {
      const updated = await updateProfile({ name: editName, description: editDescription });
      setUser(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteMessage('');
    try {
      await deleteAccount();
      setDeleteMessage('Tài khoản đã bị khoá. Bạn có 30 ngày để mở khoá.');
      setTimeout(() => signOut({ callbackUrl: '/home' }), 2000);
    } catch (err: any) {
      setDeleteMessage(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh không được quá 5MB');
      return;
    }

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload thất bại');
      }

      const updated = await res.json();
      setUser(updated);
      toast.success('Cập nhật ảnh đại diện thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải ảnh lên');
    } finally {
      setAvatarUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Loader2 size={32} className="animate-spin text-ink-lighter" />
      </div>
    );
  }

  if (!user) return null;

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'bookmarks', label: 'Bookmarks', count: bookmarks.length },
    { key: 'downloads', label: 'Lịch sử tải', count: downloads.length },
    { key: 'uploads', label: 'Đã đóng góp', count: uploads.length },
  ];

  return (
    <div className="min-h-screen bg-white">


      <div className="arionear-container py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column - Profile info card */}
          <div className="w-full lg:w-[340px] shrink-0">
            <div className="border-2 border-ink bg-paper shadow-[6px_6px_0px_0px_#111] p-6">
              {/* Avatar */}
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className="w-full h-full border-2 border-ink overflow-hidden">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url.startsWith('http') ? user.avatar_url : `/api/telegram/preview?fileId=${encodeURIComponent(user.avatar_url)}&preview=true&mimeType=image/jpeg`}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-ink-lighter flex items-center justify-center text-paper font-serif text-4xl font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-ink text-paper flex items-center justify-center border-2 border-ink hover:bg-red transition-colors disabled:opacity-50"
                >
                  {avatarUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              <h1 className="font-serif text-2xl font-bold text-ink text-center">{user.name}</h1>
              <p className="font-mono text-meta text-ink-lighter text-center mt-1">@{user.username}</p>

              <div className="flex justify-center mt-3">
                <span className={`px-3 py-1 border-2 border-ink font-mono text-meta uppercase tracking-widest font-bold ${roleBadgeColors[user.role] || 'bg-yellow-200'}`}>
                  {roleLabels[user.role] || user.role}
                </span>
              </div>

              <hr className="border-t border-ink/20 my-4" />

              <div className="space-y-3">
                <div>
                  <p className="font-mono text-meta uppercase tracking-widest text-ink-lighter">Email cá nhân</p>
                  <p className="font-sans text-body-sm text-ink font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="font-mono text-meta uppercase tracking-widest text-ink-lighter">Thành viên từ</p>
                  <p className="font-sans text-body-sm text-ink font-medium">
                    {dayjs(user.created_at).format('DD/MM/YYYY')}
                  </p>
                </div>
              </div>

              <hr className="border-t border-ink/20 my-4" />

              <button
                onClick={() => signOut({ callbackUrl: '/home' })}
                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red border-2 border-ink px-4 py-3 text-body-sm font-sans font-medium uppercase tracking-[0.08em] hover:bg-red-100 transition-colors"
              >
                <LogOut size={14} />
                Đăng xuất khỏi tài khoản
              </button>
            </div>
          </div>

          {/* Right column */}
          <div className="flex-1 space-y-8">
            {error && (
              <div className="border-2 border-red px-4 py-3 bg-red/5">
                <p className="font-sans text-body-sm text-red font-medium">{error}</p>
              </div>
            )}

            {/* Box 1: Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="border-2 border-ink bg-paper p-5 text-center">
                <p className="text-heading-3 font-serif font-bold text-ink">{downloads.length}</p>
                <p className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter mt-1">Lượt tải</p>
              </div>
              <div className="border-2 border-ink bg-paper p-5 text-center">
                <p className="text-heading-3 font-serif font-bold text-ink">{bookmarks.length}</p>
                <p className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter mt-1">Đã lưu</p>
              </div>
              <div className="border-2 border-ink bg-paper p-5 text-center">
                <p className="text-heading-3 font-serif font-bold text-ink">{uploads.length}</p>
                <p className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter mt-1">Đã đóng góp</p>
              </div>
            </div>

            {/* Box 2: Edit profile */}
            <div className="border-2 border-ink bg-paper p-6 md:p-8">
              <h2 className="font-serif text-heading-3 font-bold text-ink mb-6">Cập nhật hồ sơ cá nhân</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-meta uppercase tracking-widest text-ink-lighter block">
                    Tên hiển thị
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border border-ink bg-transparent px-4 py-3 text-body-sm text-ink focus:border-ink focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono text-meta uppercase tracking-widest text-ink-lighter block">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={user.username}
                      disabled
                      className="w-full border border-ink bg-gray-100/50 px-4 py-3 text-body-sm text-ink/50 cursor-not-allowed"
                    />
                    <p className="font-sans text-caption text-red mt-1">Không thể thay đổi username</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 mt-4">
                <label className="font-mono text-meta uppercase tracking-widest text-ink-lighter block">
                  Chữ ký cá nhân / Mô tả bản thân
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Giới thiệu ngắn về bản thân, sở thích, chuyên ngành..."
                  rows={3}
                  maxLength={500}
                  className="w-full border border-ink bg-transparent px-4 py-3 text-body-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none transition-colors resize-none"
                />
                <p className="font-sans text-caption text-ink-lighter text-right">{editDescription.length}/500</p>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="mt-6 flex items-center justify-center gap-2 bg-ink text-paper px-6 py-3 text-body-sm font-sans font-medium uppercase tracking-[0.08em] shadow-[4px_4px_0px_0px_#22C55E] hover:shadow-[2px_2px_0px_0px_#22C55E] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Lưu thay đổi hồ sơ
              </button>
            </div>

            {/* Box 3: Tabs */}
            <div className="border-2 border-ink bg-paper">
              <div className="flex border-b border-ink bg-ink">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 px-4 py-3 text-meta font-mono uppercase tracking-widest font-medium transition-colors ${
                      activeTab === tab.key
                        ? 'bg-paper text-ink'
                        : 'text-paper/70 hover:text-paper hover:bg-ink-light'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              <div className="p-6 min-h-[200px]">
                {activeTab === 'bookmarks' && (
                  bookmarks.length === 0 ? (
                    <div className="text-center py-10">
                      <BookmarkIcon size={32} className="mx-auto text-ink-lighter/40 mb-3" />
                      <p className="font-sans text-body-sm text-ink-lighter">Không có tài liệu nào được lưu</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {bookmarks.map((bm: any) => (
                        <a
                          key={bm.id}
                          href={`/documents/${bm.document_id}`}
                          className="block p-3 border border-ink/20 hover:border-ink transition-colors"
                        >
                          <p className="font-serif font-bold text-ink">{bm.documents?.title || 'Untitled'}</p>
                        </a>
                      ))}
                    </div>
                  )
                )}

                {activeTab === 'downloads' && (
                  downloads.length === 0 ? (
                    <div className="text-center py-10">
                      <Download size={32} className="mx-auto text-ink-lighter/40 mb-3" />
                      <p className="font-sans text-body-sm text-ink-lighter">Không có lịch sử tải</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {downloads.map((dl: any) => (
                        <a
                          key={dl.id}
                          href={`/documents/${dl.document_id}`}
                          className="block p-3 border border-ink/20 hover:border-ink transition-colors"
                        >
                          <p className="font-serif font-bold text-ink">{dl.documents?.title || 'Untitled'}</p>
                          <p className="font-sans text-caption text-ink-lighter">{dayjs(dl.created_at).format('DD/MM/YYYY HH:mm')}</p>
                        </a>
                      ))}
                    </div>
                  )
                )}

                {activeTab === 'uploads' && (
                  uploads.length === 0 ? (
                    <div className="text-center py-10">
                      <Upload size={32} className="mx-auto text-ink-lighter/40 mb-3" />
                      <p className="font-sans text-body-sm text-ink-lighter">Bạn chưa đóng góp tài liệu nào</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {uploads.map((doc) => (
                        <a
                          key={doc.id}
                          href={`/documents/${doc.id}`}
                          className="block p-3 border border-ink/20 hover:border-ink transition-colors"
                        >
                          <p className="font-serif font-bold text-ink">{doc.title}</p>
                          <p className="font-sans text-caption text-ink-lighter">
                            {doc.status === 'APPROVED' ? 'Đã duyệt' : doc.status === 'REJECTED' ? 'Bị từ chối' : 'Chờ duyệt'}
                          </p>
                        </a>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Box 4: Danger zone */}
            <div className="border-2 border-ink bg-red-50 shadow-[6px_6px_0px_0px_#D43B2C] p-6 md:p-8">
              <h2 className="font-serif text-heading-3 font-bold text-red mb-2">Vùng nguy hiểm</h2>
              <p className="font-sans text-body-sm text-ink-lighter mb-4">
                Xoá tài khoản sẽ vô hiệu hoá ngay lập tức tài khoản và ẩn toàn bộ dữ liệu của bạn.
                Bạn có 30 ngày để đăng nhập và mở khoá nếu muốn khôi phục. Sau 30 ngày, tài khoản sẽ bị xoá vĩnh viễn.
              </p>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center justify-center gap-2 bg-red text-paper border-2 border-ink px-6 py-3 text-body-sm font-sans font-bold uppercase tracking-[0.08em] hover:bg-red-dark transition-colors"
                >
                  <AlertTriangle size={14} />
                  Xoá tài khoản
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="border-2 border-red bg-red/10 p-4">
                    <p className="font-sans text-body-sm text-red font-semibold">
                      Bạn có chắc chắn muốn xoá tài khoản? Hành động này không thể hoàn tác ngay lập tức.
                    </p>
                  </div>
                  {deleteMessage && (
                    <div className="border-2 border-red bg-paper p-3">
                      <p className="font-sans text-body-sm text-ink font-medium">{deleteMessage}</p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading}
                      className="flex items-center justify-center gap-2 bg-red text-paper border-2 border-ink px-6 py-3 text-body-sm font-sans font-bold uppercase tracking-[0.08em] hover:bg-red-dark transition-colors disabled:opacity-50"
                    >
                      {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                      {deleteLoading ? 'Đang xử lý...' : 'Xác nhận xoá'}
                    </button>
                    <button
                      onClick={() => { setShowDeleteConfirm(false); setDeleteMessage(''); }}
                      className="flex items-center justify-center gap-2 bg-paper text-ink border-2 border-ink px-6 py-3 text-body-sm font-sans font-bold uppercase tracking-[0.08em] hover:bg-ink-light transition-colors"
                    >
                      Huỷ bỏ
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
