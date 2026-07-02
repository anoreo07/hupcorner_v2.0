import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

function db() {
  return getSupabaseAdmin().from('forum_threads') as any;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { title, content, image_url } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 });
    }

    if (title.length > 200) {
      return NextResponse.json({ error: 'Tiêu đề quá dài (tối đa 200 ký tự)' }, { status: 400 });
    }

    const { data: thread, error } = await db()
      .insert({ user_id: userId, title, content, image_url: image_url || null })
      .select()
      .single();

    if (error) {
      console.error('Create forum thread error:', error);
      return NextResponse.json({ error: 'Không thể tạo bài viết' }, { status: 500 });
    }

    return NextResponse.json(thread, { status: 201 });
  } catch (error) {
    console.error('Create forum thread error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
