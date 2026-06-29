import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper">
      <div className="text-center max-w-md px-6">
        <p className="label-red mb-4">LỖI 404</p>
        <h1 className="font-serif text-display font-bold text-ink mb-4">Không tìm thấy trang</h1>
        <p className="text-body-sm text-ink-lighter mb-10">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
        </p>
        <Link href="/home" className="btn-primary inline-flex">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
