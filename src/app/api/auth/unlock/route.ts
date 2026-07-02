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

    if (user.status !== 'LOCKED') {
      return NextResponse.json({ error: 'Tài khoản không bị khoá' }, { status: 400 });
    }

    const now = new Date();
    if (user.locked_until && new Date(user.locked_until) <= now) {
      const tenDaysLater = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
      const { error } = await db()
        .update({ status: 'ACTIVE', locked_until: tenDaysLater.toISOString() })
        .eq('id', userId);

      if (error) throw error;
      return NextResponse.json({ message: 'Tài khoản đã được mở khoá. Tính năng xoá tài khoản sẽ bị vô hiệu hoá trong 10 ngày.' });
    }

    return NextResponse.json({
      error: 'Tài khoản đang bị khoá',
      locked_until: user.locked_until,
    }, { status: 400 });
  } catch (error) {
    console.error('Unlock error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
