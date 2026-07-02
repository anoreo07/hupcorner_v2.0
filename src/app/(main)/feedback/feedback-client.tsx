'use client';

import { useState, useEffect } from 'react';
import { getSiteReviews, submitSiteReview } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { StarRating } from '@/components/ui/star-rating';

export default function FeedbackClient() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ rating: 5, title: '', content: '', user_name: '', is_anonymous: false });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getSiteReviews().then(setReviews).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) { toast.error('Vui lòng điền đầy đủ thông tin'); return; }
    setSubmitting(true);
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();
      await submitSiteReview({ ...form, ip_address: ip });
      toast.success('Đã gửi đánh giá!');
      setForm({ rating: 5, title: '', content: '', user_name: '', is_anonymous: false });
      const updated = await getSiteReviews();
      setReviews(updated);
    } catch (err: any) {
      toast.error(err.message || 'Gửi thất bại');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="arionear-container py-6 md:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Form */}
        <section className="lg:col-span-5 space-y-8 lg:sticky lg:top-24 self-start">
          <div>
            <p className="label-red mb-3">GÓP Ý</p>
            <h1 className="page-heading">Đánh giá</h1>
            <p className="subheading mt-2">Giúp chúng tôi cải thiện nền tảng HUP Corner.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Đánh giá</label>
              <StarRating value={form.rating} onChange={(n) => setForm(f => ({ ...f, rating: n }))} size={28} />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Tiêu đề *</label>
              <input type="text" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                className="input-field" placeholder="Tóm tắt ý kiến của bạn" required />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Nội dung *</label>
              <textarea value={form.content} onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
                className="input-field min-h-[120px]" placeholder="Chia sẻ ý kiến của bạn..." required />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Tên (không bắt buộc)</label>
              <input type="text" value={form.user_name} onChange={(e) => setForm(f => ({ ...f, user_name: e.target.value }))}
                className="input-field" placeholder="Tên của bạn" />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.is_anonymous}
                onChange={(e) => setForm(f => ({ ...f, is_anonymous: e.target.checked }))}
                className="w-4 h-4 border border-ink" />
              <span className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Gửi ẩn danh</span>
            </label>

            <button type="submit" disabled={submitting}
              className="btn-primary w-full disabled:opacity-50">
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </form>
        </section>

        {/* Reviews */}
        <section className="lg:col-span-7">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="label-red mb-3">CỘNG ĐỒNG</p>
              <h2 className="section-heading">Đánh giá từ cộng đồng</h2>
              <p className="subheading mt-2">Ý kiến từ các sinh viên HUP.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-ink/10 border-t-ink rounded-full animate-spin" /></div>
          ) : reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review: any) => (
                <div key={review.id} className="card p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <StarRating value={review.rating} readonly size={16} />
                    <span className="ml-auto font-mono text-meta uppercase tracking-[0.1em] text-ink-lighter">{new Date(review.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <h3 className="font-serif text-heading-4 font-bold text-ink mb-2">{review.title}</h3>
                  <p className="text-body-sm text-ink-lighter">{review.content}</p>
                  <p className="font-mono text-meta uppercase tracking-[0.1em] text-ink-lighter mt-3">
                    {review.is_anonymous ? 'Ẩn danh' : review.user_name || 'Sinh viên HUP'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <p className="text-body-sm text-ink-lighter">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
