import { AuthLayout } from '@/components/auth/auth-layout';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata = {
  title: 'Đăng ký - HUP Corner',
};

export default function RegisterPage() {
  return (
    <AuthLayout
      headingLine1="THAM GIA"
      headingLine2="CỘNG ĐỒNG"
      highlightText="SINH VIÊN DƯỢC"
      description="Tạo tài khoản để lưu tài liệu yêu thích, theo dõi lịch sử tải, và đóng góp bài học cho cộng đồng HUP Corner."
      badgeText="HUP CORNER"
      accentColor="blue"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
