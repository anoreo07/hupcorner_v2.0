import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || (token as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, admin_note } = await req.json();
    if (!id) return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });

    const supabaseAdmin = getSupabaseAdmin() as any;
    const { data, error } = await supabaseAdmin
      .from('documents')
      .update({ status: 'APPROVED', admin_note: admin_note || null, approved_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
