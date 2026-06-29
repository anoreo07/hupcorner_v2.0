import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { documentId, title, subject_name, academic_year, category } = await request.json();
    if (!documentId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin() as any;
    const { error } = await supabaseAdmin
      .from('documents')
      .update({ title, subject_name: subject_name?.toUpperCase() ?? null, academic_year: academic_year ?? null, category: category ?? null, updated_at: new Date().toISOString() })
      .eq('id', documentId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Document updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update document' }, { status: 500 });
  }
}
