import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { deleteMessageFromTelegram, parseTelegramFilePath } from '@/lib/telegram';

export async function DELETE(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || (token as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });

    const supabaseAdmin = getSupabaseAdmin() as any;
    const { data: doc, error: docError } = await supabaseAdmin.from('documents').select('*').eq('id', id).maybeSingle();
    if (docError || !doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    if (doc.storage_provider === 'telegram' && doc.file_path) {
      const { chunks } = parseTelegramFilePath(doc.file_path);
      for (const chunk of chunks) {
        if (chunk.messageId) await deleteMessageFromTelegram(chunk.messageId);
      }
    }

    const { error } = await supabaseAdmin.from('documents').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
