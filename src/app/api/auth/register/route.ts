import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

function db() {
  return getSupabaseAdmin().from('users') as any;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, username, role } = body;

    if (!email || !password || !name || !username) {
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Mật khẩu phải có ít nhất 8 ký tự' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 });
    }

    if (username.length < 3) {
      return NextResponse.json({ error: 'Username phải có ít nhất 3 ký tự' }, { status: 400 });
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json({ error: 'Username chỉ được chứa chữ cái, số và dấu gạch dưới' }, { status: 400 });
    }

    const { data: existingEmail } = await db()
      .select('id')
      .eq('email', email)
      .maybeSingle();
    if (existingEmail) {
      return NextResponse.json({ error: 'Email đã được sử dụng' }, { status: 409 });
    }

    const { data: existingUsername } = await db()
      .select('id')
      .eq('username', username)
      .maybeSingle();
    if (existingUsername) {
      return NextResponse.json({ error: 'Username đã được sử dụng' }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const { data: user, error } = await db()
      .insert({
        email,
        password_hash,
        name,
        username,
        role: 'USER',
      })
      .select()
      .single();

    if (error) {
      console.error('Register error:', error);
      return NextResponse.json({ error: 'Không thể tạo tài khoản' }, { status: 500 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      role: user.role,
    }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
