import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

function db() {
  return getSupabaseAdmin().from('users') as any;
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const { data: raw } = await db()
      .select('*')
      .eq('id', userId)
      .single();

    if (!raw) {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản' }, { status: 404 });
    }

    const user = raw as { status: string; locked_until: string | null };

    if (user.status === 'DELETED') {
      return NextResponse.json({ error: 'Tài khoản đã bị xoá' }, { status: 400 });
    }

    if (user.status === 'ACTIVE' && user.locked_until && new Date(user.locked_until) > new Date()) {
      const cooldownEnd = new Date(user.locked_until);
      const daysLeft = Math.ceil((cooldownEnd.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
      return NextResponse.json({
        error: `Tính năng xoá tài khoản tạm thời bị vô hiệu hoá. Vui lòng thử lại sau ${daysLeft} ngày.`,
        cooldownDays: daysLeft,
      }, { status: 400 });
    }

    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await db()
      .update({ status: 'LOCKED', locked_until: thirtyDaysLater })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({
      message: 'Tài khoản đã bị khoá. Bạn có 30 ngày để mở khoá nếu muốn khôi phục.',
      locked_until: thirtyDaysLater,
    });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
