import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

function db() {
  return getSupabaseAdmin().from('users') as any;
}

export async function GET() {
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

    return NextResponse.json(raw);
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();

    const allowedFields = ['name', 'description', 'avatar_url'];
    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Không có dữ liệu để cập nhật' }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    const { data: raw, error } = await db()
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Update user error:', error);
      return NextResponse.json({ error: 'Không thể cập nhật hồ sơ' }, { status: 500 });
    }

    return NextResponse.json(raw);
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
