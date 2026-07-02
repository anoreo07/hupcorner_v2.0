import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

function db() {
  return getSupabaseAdmin().from('users') as any;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, full_name, student_id, id_card_image } = body;

    if (!email || !full_name || !student_id) {
      return NextResponse.json({ error: 'Thiếu thông tin xác nhận' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: raw } = await db()
      .select('id')
      .eq('email', email)
      .single();

    if (!raw) {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản' }, { status: 404 });
    }

    const user = raw as { id: string };

    await (supabase.from('student_verifications') as any).insert({
      user_id: user.id,
      full_name,
      student_id,
      id_card_image: id_card_image || null,
    });

    return NextResponse.json({ message: 'Đã gửi yêu cầu xác nhận' }, { status: 201 });
  } catch (error) {
    console.error('Student verification error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
