import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin() as any;
    const { data, error } = await supabaseAdmin
      .from('documents')
      .select('*, majors(*)')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
