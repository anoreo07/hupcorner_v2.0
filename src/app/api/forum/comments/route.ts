import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const sa = () => getSupabaseAdmin() as any;
const db = (table: string) => sa().from(table);

async function updateCommentCount(threadId: string) {
  const { count } = await db('forum_comments')
    .select('*', { count: 'exact', head: true })
    .eq('thread_id', threadId);
  await db('forum_threads')
    .update({ comment_count: count ?? 0 })
    .eq('id', threadId);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');
    if (!threadId) {
      return NextResponse.json({ error: 'Missing threadId' }, { status: 400 });
    }

    const { data, error } = await db('forum_comments')
      .select('*, users!inner(*)')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { thread_id, content } = body;

    if (!thread_id || !content) {
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 });
    }

    const { data: comment, error: commentError } = await db('forum_comments')
      .insert({ thread_id, user_id: userId, content })
      .select()
      .single();

    if (commentError) {
      return NextResponse.json({ error: 'Không thể tạo bình luận' }, { status: 500 });
    }

    await updateCommentCount(thread_id);

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('id');

    if (!commentId) {
      return NextResponse.json({ error: 'Missing comment id' }, { status: 400 });
    }

    const { data: comment } = await db('forum_comments').select('thread_id, user_id').eq('id', commentId).single();
    if (!comment) {
      return NextResponse.json({ error: 'Không tìm thấy bình luận' }, { status: 404 });
    }
    if (comment.user_id !== userId) {
      return NextResponse.json({ error: 'Không có quyền xoá' }, { status: 403 });
    }

    const { error } = await db('forum_comments').delete().eq('id', commentId).eq('user_id', userId);
    if (error) {
      return NextResponse.json({ error: 'Không thể xoá bình luận' }, { status: 500 });
    }

    await updateCommentCount(comment.thread_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
