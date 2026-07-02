'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createForumThread } from '@/lib/user';
import { uploadFileWithChunking, needsChunking } from '@/utils/file-chunking';
import { ArrowLeft, Loader2, Send, ImageIcon, X, Eye, Heart, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function NewThreadPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!session?.user) {
    router.push('/login');
    return null;
  }

  const user = session.user as any;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ảnh không được quá 10MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    setImageUploading(true);
    try {
      const channelId = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_ID || '-1003810443754';
      let botIndex = 1;
      try {
        const res = await fetch('/api/telegram/upload-proxy');
        if (res.ok) {
          const data = await res.json();
          if (data.bot_index) botIndex = data.bot_index;
        }
      } catch {}

      const fileIds = await uploadFileWithChunking(imageFile, channelId, undefined, botIndex);
      if (!fileIds || fileIds.length === 0) throw new Error('Upload thất bại');

      const fileId = fileIds[0];
      const isChunked = needsChunking(imageFile.size);
      return isChunked ? `chunk:${fileIds.join(',')}` : fileId;
    } catch (err) {
      toast.error('Không thể tải ảnh lên');
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const imageUrl = await uploadImage();
      await createForumThread(title, content, imageUrl || undefined);
      router.push('/forum');
      router.refresh();
    } catch {
      setError('Không thể tạo bài viết');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <div className="arionear-container py-12">
        <Link href="/forum" className="inline-flex items-center gap-2 font-mono text-meta uppercase tracking-widest text-ink-lighter hover:text-ink mb-6">
          <ArrowLeft size={14} /> Quay lại diễn đàn
        </Link>

        <h1 className="font-serif text-heading-1 font-bold text-ink tracking-tight mb-8">TẠO BÀI VIẾT MỚI</h1>

        {error && (
          <div className="border-2 border-red px-4 py-3 bg-red/5 mb-6">
            <p className="font-sans text-body-sm text-red font-medium">{error}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Form */}
          <form onSubmit={handleSubmit} className="flex-1 space-y-5">
            <div className="space-y-1.5">
              <label className="font-mono text-meta uppercase tracking-widest text-ink-lighter block">
                Tiêu đề
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tiêu đề bài viết"
                required
                className="w-full border border-ink bg-transparent px-4 py-3 text-body-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-meta uppercase tracking-widest text-ink-lighter block">
                Nội dung
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Chia sẻ suy nghĩ, câu hỏi hoặc kiến thức của bạn..."
                rows={12}
                required
                className="w-full border border-ink bg-transparent px-4 py-3 text-body-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none resize-y"
              />
            </div>

            <div className="space-y-2">
              <label className="font-mono text-meta uppercase tracking-widest text-ink-lighter block">
                Đính kèm ảnh (tuỳ chọn)
              </label>

              {imagePreview ? (
                <div className="relative inline-block border-2 border-ink">
                  <img src={imagePreview} alt="Preview" className="max-h-64 object-contain" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-7 h-7 bg-red text-paper border-2 border-ink flex items-center justify-center hover:bg-red-dark transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageUploading}
                  className="inline-flex items-center gap-2 border-2 border-ink px-4 py-2.5 text-body-sm font-sans text-ink-lighter hover:text-ink hover:bg-paper-light transition-colors"
                >
                  {imageUploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                  {imageUploading ? 'Đang tải ảnh...' : 'Chọn ảnh'}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            <button
              type="submit"
              disabled={loading || imageUploading}
              className="inline-flex items-center gap-2 bg-ink text-paper px-7 py-3.5 text-body-sm font-sans font-medium uppercase tracking-[0.08em] shadow-[4px_4px_0px_0px_#D43B2C] hover:shadow-[2px_2px_0px_0px_#D43B2C] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Đăng bài
            </button>
          </form>

          {/* Right: Preview */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="sticky top-32">
              <p className="font-mono text-meta uppercase tracking-widest text-ink-lighter mb-4">XEM TRƯỚC</p>

              <div className="border-2 border-ink bg-paper p-5">
                {title ? (
                  <h2 className="font-serif font-bold text-lg text-ink">{title}</h2>
                ) : (
                  <p className="font-serif font-bold text-lg text-ink/30 italic">Tiêu đề bài viết</p>
                )}

                {content ? (
                  <p className="font-sans text-body-sm text-ink-lighter mt-2 line-clamp-3">{content}</p>
                ) : (
                  <p className="font-sans text-body-sm text-ink-lighter/30 italic mt-2">Nội dung bài viết sẽ hiển thị ở đây...</p>
                )}

                {imagePreview && (
                  <div className="mt-3 border border-ink/20 overflow-hidden max-h-32">
                    <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-center gap-4 mt-3 font-mono text-meta uppercase tracking-widest text-ink-lighter">
                  <span className="font-sans text-body-sm text-ink font-medium">{user?.name || 'Ẩn danh'}</span>
                  <span className="flex items-center gap-1"><Eye size={12} /> 0</span>
                  <span className="flex items-center gap-1"><Heart size={12} /> 0</span>
                  <span className="flex items-center gap-1"><MessageCircle size={12} /> 0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
