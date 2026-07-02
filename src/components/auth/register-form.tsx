'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, UserPlus, ArrowRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';

type Step = 1 | 2 | 3;

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'USER' | 'PHARMACY_STUDENT'>('USER');
  const [description, setDescription] = useState('');

  const [studentFullName, setStudentFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentCardImage, setStudentCardImage] = useState('');

  const validateStep1 = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return false;
    }
    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!username || username.length < 3) {
      setError('Username phải có ít nhất 3 ký tự');
      return false;
    }
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      setError('Username chỉ được chứa chữ cái, số và dấu gạch dưới');
      return false;
    }
    return true;
  };

  const handleNextToStep2 = () => {
    setError('');
    if (validateStep1()) setStep(2);
  };

  const handleNextToStep3 = () => {
    setError('');
    if (validateStep2()) {
      if (role === 'PHARMACY_STUDENT') {
        setStep(3);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async (verifyData?: { full_name: string; student_id: string; id_card_image: string }) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, username }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Không thể tạo tài khoản');
        setLoading(false);
        return;
      }

      const createdUser = await res.json();

      if (role === 'PHARMACY_STUDENT') {
        const verifyRes = await fetch('/api/auth/student-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            full_name: verifyData?.full_name || name,
            student_id: verifyData?.student_id || '',
            id_card_image: verifyData?.id_card_image || '',
          }),
        });

        if (!verifyRes.ok) {
          setError('Tài khoản đã tạo nhưng gửi xác nhận thất bại. Vui lòng liên hệ admin.');
          setLoading(false);
          return;
        }
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        router.push('/login');
        return;
      }

      if (role === 'PHARMACY_STUDENT') {
        toast.success('Tài khoản đã tạo! Yêu cầu xác nhận sinh viên Dược đã gửi tới admin để duyệt.');
      }

      router.push('/home');
      router.refresh();
    } catch {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = () => {
    if (!studentFullName || !studentId) {
      setError('Vui lòng điền đầy đủ thông tin xác nhận');
      return;
    }
    handleSubmit({
      full_name: studentFullName,
      student_id: studentId,
      id_card_image: studentCardImage,
    });
  };

  return (
    <div className="space-y-5">
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-6">
        {([1, 2, 3] as Step[]).map((s) => (
          <div key={s} className="flex items-center gap-3">
            <span className={`font-mono text-meta uppercase tracking-[0.15em] ${
              step >= s ? 'text-red' : 'text-ink-lighter'
            }`}>
              {step > s ? '✓' : `0${s}`}
            </span>
            {s < 3 && <div className={`w-8 h-px ${step > s ? 'bg-red' : 'bg-ink/20'}`} />}
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-serif text-heading-3 font-bold text-ink tracking-tight">
          {step === 1 ? 'Tạo tài khoản' : step === 2 ? 'Hoàn tất hồ sơ' : 'Xác nhận sinh viên'}
        </h2>
        <p className="subheading mt-1">
          {step === 1
            ? 'Đăng ký miễn phí trong vài giây'
            : step === 2
            ? 'Thiết lập hồ sơ cá nhân của bạn'
            : 'Xác nhận bạn là sinh viên trường Đại học Dược'}
        </p>
      </div>

      {error && (
        <div className="border border-red px-4 py-3 bg-red/5">
          <p className="font-sans text-body-sm text-red font-medium">{error}</p>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="label-red block">
              Họ và tên
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              required
              className="input-field"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-email" className="label-red block">
              Email học viên
            </label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="input-field"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-password" className="label-red block">
              Mật khẩu (tối thiểu 8 ký tự)
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-lighter hover:text-ink"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm-password" className="label-red block">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-lighter hover:text-ink"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleNextToStep2}
            className="btn-primary w-full"
          >
            Tiếp tục <ArrowRight size={16} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="username" className="label-red block">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="nguyenvan_a"
              required
              className="input-field"
            />
          </div>

          <div className="space-y-1.5">
            <label className="label-red block">
              Vai trò của bạn
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('USER')}
                className={`p-4 border text-left transition-all ${
                  role === 'USER'
                    ? 'border-ink bg-ink text-paper'
                    : 'border-ink/30 bg-paper text-ink hover:border-ink'
                }`}
              >
                <p className="font-serif font-bold text-sm">Sinh viên thông thường</p>
                <p className="font-sans text-caption mt-1 opacity-70">Truy cập tài liệu Public</p>
              </button>
              <button
                type="button"
                onClick={() => setRole('PHARMACY_STUDENT')}
                className={`p-4 border text-left transition-all ${
                  role === 'PHARMACY_STUDENT'
                    ? 'border-ink bg-ink text-paper'
                    : 'border-ink/30 bg-paper text-ink hover:border-ink'
                }`}
              >
                <p className="font-serif font-bold text-sm">Sinh viên Đại học Dược</p>
                <p className="font-sans text-caption mt-1 opacity-70">Truy cập tất cả tài liệu + Video</p>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="desc" className="label-red block">
              Mô tả bản thân (không bắt buộc)
            </label>
            <textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Giới thiệu ngắn về bản thân..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <button
            type="button"
            onClick={handleNextToStep3}
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {role === 'PHARMACY_STUDENT' ? 'Xác nhận sinh viên →' : 'Hoàn tất đăng ký →'}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="border border-red/30 bg-red/5 p-4">
            <p className="font-sans text-body-sm text-ink">
              Vui lòng cung cấp thông tin để xác nhận bạn là sinh viên trường Đại học Dược. 
              Dữ liệu của bạn sẽ được admin xem xét và duyệt thủ công.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="label-red block">
              Tên sinh viên
            </label>
            <input
              type="text"
              value={studentFullName}
              onChange={(e) => setStudentFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="input-field"
            />
          </div>

          <div className="space-y-1.5">
            <label className="label-red block">
              Mã sinh viên
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="21010001"
              className="input-field"
            />
          </div>

          <div className="space-y-1.5">
            <label className="label-red block">
              Ảnh thẻ sinh viên (URL)
            </label>
            <input
              type="text"
              value={studentCardImage}
              onChange={(e) => setStudentCardImage(e.target.value)}
              placeholder="https://example.com/student-card.jpg"
              className="input-field"
            />
          </div>

          <button
            type="button"
            onClick={handleStep3Submit}
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            {loading ? 'Đang tạo tài khoản...' : 'Xác nhận & tạo tài khoản →'}
          </button>
        </div>
      )}

      <p className="text-center font-sans text-body-sm text-ink-lighter">
        Đã có tài khoản?{' '}
        <Link href="/login" className="text-red font-semibold hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
