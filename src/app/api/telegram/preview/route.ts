import { NextRequest, NextResponse } from 'next/server';
import { downloadFileAuto, TelegramFileTooLargeError } from '@/lib/telegram';

export const runtime = 'nodejs';
export const maxDuration = 120;
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const mimeType = searchParams.get('mimeType') || 'application/octet-stream';
    const botIndex = searchParams.get('botIndex') ? parseInt(searchParams.get('botIndex')!, 10) : 1;

    if (!fileId) return NextResponse.json({ error: 'fileId is required' }, { status: 400 });

    const { buffer } = await downloadFileAuto(fileId, botIndex);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: { 'Content-Type': mimeType, 'Content-Length': buffer.length.toString(), 'Content-Disposition': 'inline', 'Cache-Control': 'public, max-age=3600' },
    });
  } catch (error: any) {
    if (error instanceof TelegramFileTooLargeError) {
      return NextResponse.json({ error: error.message, code: 'TELEGRAM_FILE_TOO_LARGE' }, { status: 413 });
    }
    return NextResponse.json({ error: error.message || 'Preview failed' }, { status: 500 });
  }
}
