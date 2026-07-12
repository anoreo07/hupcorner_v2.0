import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  return NextResponse.json({ exists: !!data });
}
