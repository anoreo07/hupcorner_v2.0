import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get('q') || '';
    const supabaseAdmin = getSupabaseAdmin() as any;

    const { data, error } = await supabaseAdmin
      .from('documents')
      .select('*, majors(*)')
      .eq('status', 'APPROVED')
      .neq('document_type', 'OUTLINE')
      .or(`title.ilike.%${q}%,subject_name.ilike.%${q}%`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
