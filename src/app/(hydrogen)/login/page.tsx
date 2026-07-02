import { AuthLayout } from '@/components/auth/auth-layout';
import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
  title: 'Đăng nhập - HUP Corner',
};

export default function LoginPage() {
  return (
    <AuthLayout
      headingLine1="CHIA SẺ"
      headingLine2="KIẾN THỨC"
      highlightText="HUP Corner"
      description="Đăng nhập để mở khóa kho tàng tri thức học thuật dành cho sinh viên Dược. Truy cập đề thi, bài giảng, giáo trình và nhiều hơn nữa."
      badgeText="HUP CORNER"
      accentColor="yellow"
    >
      <LoginForm />
    </AuthLayout>
  );
}
