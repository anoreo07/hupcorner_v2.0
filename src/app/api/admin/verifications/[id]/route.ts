import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: verificationId } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Trạng thái không hợp lệ' }, { status: 400 });
    }

    const adminId = (session.user as any).id;
    const supabase = getSupabaseAdmin();

    // Get the verification record
    const { data: verification } = await (supabase.from('student_verifications') as any)
      .select('*')
      .eq('id', verificationId)
      .single();

    if (!verification) {
      return NextResponse.json({ error: 'Không tìm thấy yêu cầu xác nhận' }, { status: 404 });
    }

    // Update verification status
    const { error: updateError } = await (supabase.from('student_verifications') as any)
      .update({
        status,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', verificationId);

    if (updateError) throw updateError;

    // If approved, update user role to PHARMACY_STUDENT
    if (status === 'APPROVED') {
      const { error: roleError } = await (supabase.from('users') as any)
        .update({
          role: 'PHARMACY_STUDENT',
          updated_at: new Date().toISOString(),
        })
        .eq('id', verification.user_id);

      if (roleError) throw roleError;
    }

    return NextResponse.json({ message: status === 'APPROVED' ? 'Đã xác nhận' : 'Đã từ chối' });
  } catch (error) {
    console.error('Update verification error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
