import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-ink bg-paper-light">
      <div className="arionear-container py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <span className="font-serif font-bold text-ink text-2xl leading-none block mb-4">HUP Corner</span>
            <p className="text-body-sm text-ink-lighter max-w-md leading-relaxed">
              Kho tàng tri thức học thuật dành cho sinh viên Trường Đại học Dược Hà Nội.
              Khám phá, chia sẻ và bảo tồn tài nguyên giáo dục.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-meta uppercase tracking-[0.15em] text-ink mb-5">Danh mục</h4>
            <div className="space-y-3">
              <Link href="/all-majors" className="block text-body-sm text-ink-lighter hover:text-ink transition-colors duration-200">Tài liệu</Link>
              <Link href="/subjects" className="block text-body-sm text-ink-lighter hover:text-ink transition-colors duration-200">Môn học</Link>
              <Link href="/exam-prep" className="block text-body-sm text-ink-lighter hover:text-ink transition-colors duration-200">Ôn thi</Link>
            </div>
          </div>

          <div>
            <h4 className="font-mono text-meta uppercase tracking-[0.15em] text-ink mb-5">Liên kết</h4>
            <div className="space-y-3">
              <Link href="/feedback" className="block text-body-sm text-ink-lighter hover:text-ink transition-colors duration-200">Góp ý</Link>
              <Link href="/privacy" className="block text-body-sm text-ink-lighter hover:text-ink transition-colors duration-200">Riêng tư</Link>
              <Link href="/terms" className="block text-body-sm text-ink-lighter hover:text-ink transition-colors duration-200">Điều khoản</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-ink/20 mt-16 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">
              &copy; {new Date().getFullYear()} HUP Corner
            </p>
            <p className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">
              Xây dựng với tâm huyết học thuật
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
