'use client';

import { useEffect, useState } from 'react';
import { DocumentWithMajor, Major } from '@/types/database';
import { DocumentCard } from '@/components/editorial/document-card';
import Link from 'next/link';
import { ArrowRight, FileText, BookOpen, Upload, CheckCircle, Search, Users } from 'lucide-react';

interface HomePageClientProps {
  featuredDocuments: DocumentWithMajor[];
  recentDocuments: DocumentWithMajor[];
  majors: Major[];
}

export default function HomePageClient({ featuredDocuments, recentDocuments, majors }: HomePageClientProps) {
  const totalDocs = featuredDocuments.length + recentDocuments.length;

  return (
    <div>
      {/* HERO SECTION — white bg */}
      <section className="border-b border-ink">
        <div className="arionear-container py-10 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Left: text */}
            <div className="max-w-xl">
              <p className="label-red mb-5">CỔNG TRI THỨC HỌC THUẬT</p>
              <h1 className="page-heading mb-6">
                Kho tàng <span className="italic">học thuật</span>
                <br />
                dành cho sinh viên HUP
              </h1>
              <p className="subheading mb-10">
                Bộ sưu tập các đề thi, bài giảng, giáo trình và tài nguyên học thuật
                được đóng góp bởi cộng đồng Trường Đại học Dược Hà Nội.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/all-majors" className="btn-primary">
                  Tra cứu tài liệu <ArrowRight size={16} strokeWidth={1.5} />
                </Link>
                <Link href="/subjects" className="btn-outline">
                  Xem môn học
                </Link>
              </div>
            </div>

            {/* Right: Vietnam clock */}
            <div className="card p-8 self-start">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-red inline-block" />
                <span className="label-red">ĐỒNG HỒ &bull; GIỜ VIỆT NAM</span>
              </div>
              <h3 className="font-serif text-heading-3 font-bold text-ink mb-6">Giờ Hà Nội</h3>
              <VietnamClock />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED DOCUMENTS — alt bg */}
      <section className="section-alt border-b border-ink">
        <div className="arionear-container py-14 md:py-20">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="label-red mb-3">TÀI LIỆU CHỌN LỌC</p>
              <h2 className="section-heading">Tài liệu nổi bật</h2>
            </div>
            <Link href="/all-majors" className="btn-meta hidden md:flex">
              Xem tất cả <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          </div>

          {featuredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDocuments.map((doc, i) => (
                <DocumentCard key={doc.id} doc={doc} index={i} />
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <FileText size={36} strokeWidth={1.5} className="mx-auto text-ink-lighter/40 mb-3" />
              <p className="text-body-sm text-ink-lighter">Chưa có tài liệu nổi bật.</p>
            </div>
          )}

          <Link href="/all-majors" className="btn-meta mt-8 md:hidden">
            Xem tất cả <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      {/* HOW THE PRESS RUNS — black bg */}
      <section className="section-black border-b border-ink/10">
        <div className="arionear-container py-14 md:py-20">
          <div className="flex items-end justify-between mb-16">
            <p className="label-red">QUY TRÌNH</p>
            <Link href="/feedback" className="btn-meta text-paper/60 hover:text-paper hidden md:flex">
              Gửi góp ý &rarr;
            </Link>
          </div>

          <h2 className="font-serif text-heading-1 font-bold text-paper leading-[1.0] mb-16">
            Cách thức hoạt động
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-paper/10">
            <div className="pr-8 pb-8 md:pb-0">
              <p className="card-number mb-4">BƯỚC 01</p>
              <h3 className="font-serif text-heading-3 font-bold text-paper mb-3">Tìm kiếm &amp; Khám phá</h3>
              <p className="text-body-sm text-paper/60 leading-relaxed">
                Tra cứu kho tàng tài liệu học thuật theo ngành, môn học hoặc từ khoá.
              </p>
            </div>
            <div className="px-8 py-8 md:py-0 md:pt-0">
              <p className="card-number mb-4">BƯỚC 02</p>
              <h3 className="font-serif text-heading-3 font-bold text-paper mb-3">Đóng góp &amp; Chia sẻ</h3>
              <p className="text-body-sm text-paper/60 leading-relaxed">
                Tải lên tài liệu — đề thi, bài giảng, giáo trình — để chia sẻ với cộng đồng.
              </p>
            </div>
            <div className="px-8 py-8 md:py-0">
              <p className="card-number mb-4">BƯỚC 03</p>
              <h3 className="font-serif text-heading-3 font-bold text-paper mb-3">Kiểm duyệt</h3>
              <p className="text-body-sm text-paper/60 leading-relaxed">
                Ban quản trị xem xét và phê duyệt tài liệu trước khi công bố.
              </p>
            </div>
            <div className="pl-8 pt-8 md:pt-0">
              <p className="card-number mb-4">BƯỚC 04</p>
              <h3 className="font-serif text-heading-3 font-bold text-paper mb-3">Tri thức học thuật</h3>
              <p className="text-body-sm text-paper/60 leading-relaxed">
                Tài liệu đã duyệt sẽ có sẵn cho toàn thể sinh viên HUP.
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <Link href="/all-majors" className="btn-outline-white">
              BẮT ĐẦU TRA CỨU <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* RECENT UPLOADS — white bg */}
      <section className="border-b border-ink">
        <div className="arionear-container py-14 md:py-20">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="label-red mb-3">MỚI CẬP NHẬT</p>
              <h2 className="section-heading">Tải lên gần đây</h2>
            </div>
          </div>

          <div className="border border-ink divide-y divide-ink/20">
            {recentDocuments.map((doc) => (
              <Link
                key={doc.id}
                href={`/documents/${doc.id}`}
                className="flex items-center gap-4 p-5 transition-colors duration-200 hover:bg-paper-light group"
              >
                <div className="w-10 h-10 border border-ink/20 flex items-center justify-center shrink-0">
                  <FileText size={18} strokeWidth={1.5} className="text-ink-lighter" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm text-ink font-medium truncate transition-colors duration-200 group-hover:text-red">
                    {doc.title}
                  </p>
                  <p className="font-mono text-meta uppercase tracking-[0.1em] text-ink-lighter mt-0.5">
                    {new Date(doc.created_at).toLocaleDateString('vi-VN')} &bull; {doc.majors?.name || 'Học thuật'}
                  </p>
                </div>
                <span className="font-mono text-meta uppercase tracking-[0.1em] text-ink-lighter shrink-0">
                  {doc.file_size ? `${(doc.file_size / (1024 * 1024)).toFixed(1)} MB` : ''}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function VietnamClock() {
  const [angles, setAngles] = useState({ h: 0, m: 0, s: 0 });
  const [digital, setDigital] = useState('00:00:00');
  const [today, setToday] = useState('');

  useEffect(() => {
    setToday(new Date().toLocaleDateString('vi-VN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    }));
  }, []);

  useEffect(() => {
    function tick() {
      const now = new Date();
      const h = (now.getUTCHours() + 7) % 24;
      const m = now.getUTCMinutes();
      const s = now.getUTCSeconds();

      setAngles({
        h: (h % 12) * 30 + m * 0.5,
        m: m * 6 + s * 0.1,
        s: s * 6,
      });
      setDigital(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const cx = 100, cy = 100;

  return (
    <div className="border-t border-ink/20 pt-6 flex flex-col items-center gap-4">
      <svg viewBox="0 0 200 200" className="w-[180px] h-[180px]">
        {/* Outer circle */}
        <circle cx={cx} cy={cy} r="90" fill="#F7F5F1" stroke="#111" strokeWidth="2.5" />

        {/* Tick marks */}
        {Array.from({ length: 12 }, (_, i) => {
          const rad = (i * 30 * Math.PI) / 180;
          const isLong = i % 3 === 0;
          const innerR = isLong ? 74 : 82;
          const outerR = 88;
          return (
            <line
              key={i}
              x1={cx + innerR * Math.sin(rad)}
              y1={cy - innerR * Math.cos(rad)}
              x2={cx + outerR * Math.sin(rad)}
              y2={cy - outerR * Math.cos(rad)}
              stroke={isLong ? '#111' : '#777'}
              strokeWidth={isLong ? 2 : 1}
            />
          );
        })}

        {/* Numbers at 12, 3, 6, 9 */}
        <text x={cx} y="65" textAnchor="middle" dominantBaseline="middle" fontFamily="Playfair Display, Georgia, serif" fontSize="11" fill="#111" fontWeight="700">12</text>
        <text x="136" y={cy} textAnchor="middle" dominantBaseline="middle" fontFamily="Playfair Display, Georgia, serif" fontSize="11" fill="#111" fontWeight="700">3</text>
        <text x={cx} y="135" textAnchor="middle" dominantBaseline="middle" fontFamily="Playfair Display, Georgia, serif" fontSize="11" fill="#111" fontWeight="700">6</text>
        <text x="64" y={cy} textAnchor="middle" dominantBaseline="middle" fontFamily="Playfair Display, Georgia, serif" fontSize="11" fill="#111" fontWeight="700">9</text>

        {/* Hour hand */}
        <g transform={`rotate(${angles.h}, ${cx}, ${cy})`}>
          <line x1={cx} y1={cy + 12} x2={cx} y2={cy - 38} stroke="#111" strokeWidth="4.5" strokeLinecap="round" />
        </g>

        {/* Minute hand */}
        <g transform={`rotate(${angles.m}, ${cx}, ${cy})`}>
          <line x1={cx} y1={cy + 12} x2={cx} y2={cy - 58} stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Second hand */}
        <g transform={`rotate(${angles.s}, ${cx}, ${cy})`}>
          <line x1={cx} y1={cy + 18} x2={cx} y2={cy - 73} stroke="#D43B2C" strokeWidth="1.2" strokeLinecap="round" />
        </g>

        {/* Center dot */}
        <circle cx={cx} cy={cy} r="3" fill="#111" />
      </svg>

      <p className="font-serif font-bold text-heading-2 text-ink leading-none tracking-tight">
        {digital}
      </p>
      {today && (
        <p className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">
          {today}
        </p>
      )}
      <p className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">
        GMT+7 &bull; ASIA/HO_CHI_MINH
      </p>
    </div>
  );
}
