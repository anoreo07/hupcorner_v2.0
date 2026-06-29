import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
