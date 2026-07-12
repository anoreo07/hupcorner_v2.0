import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== 'PHARMACY_STUDENT' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Chỉ sinh viên Dược mới có thể đăng bài giảng' }, { status: 403 });
    }

    const body = await request.json();
    const { title, youtube_url, lecturer_name, subject_name, subject_code, description, major_id } = body;

    if (!title || !youtube_url) {
      return NextResponse.json({ error: 'Vui lòng điền tiêu đề và link bài giảng' }, { status: 400 });
    }

    const youtubeMatch = youtube_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/);
    if (!youtubeMatch) {
      return NextResponse.json({ error: 'Link YouTube không hợp lệ' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin() as any;
    const { data, error } = await supabaseAdmin.from('video_lectures').insert({
      title,
      youtube_url,
      lecturer_name: lecturer_name || null,
      subject_name: subject_name || null,
      subject_code: subject_code || null,
      description: description || null,
      major_id: major_id || null,
    }).select().single();

    if (error) {
      return NextResponse.json({ error: 'Không thể tạo bài giảng' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
