import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json([], { status: 200 });
    }
    const userId = (session.user as any).id;
    const supabase = getSupabaseAdmin();
    const { data } = await (supabase.from('bookmarks') as any)
      .select('*, documents(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
