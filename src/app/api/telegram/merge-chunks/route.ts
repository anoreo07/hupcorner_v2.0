import { NextRequest, NextResponse } from 'next/server';
import { getTelegramBotToken } from '@/lib/telegram';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chunksParam = searchParams.get('chunks');
    const fileName = searchParams.get('fileName') || 'file';
    const botIndex = searchParams.get('botIndex') ? parseInt(searchParams.get('botIndex')!, 10) : 1;
    const TELEGRAM_BOT_TOKEN = getTelegramBotToken(botIndex);

    if (!chunksParam) return NextResponse.json({ error: 'No chunks provided' }, { status: 400 });

    const chunks: string[] = [];
    try { const parsed = JSON.parse(chunksParam); chunks.push(...(Array.isArray(parsed) ? parsed : chunksParam.split(','))); }
    catch { chunks.push(...chunksParam.split(',')); }

    if (chunks.length === 0) return NextResponse.json({ error: 'Invalid chunks format' }, { status: 400 });

    const buffers: Uint8Array[] = [];
    for (const fileId of chunks) {
      const infoUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`;
      const infoResponse = await fetch(infoUrl);
      const infoData = await infoResponse.json();
      if (!infoData.ok || !infoData.result?.file_path) throw new Error(`Cannot get file info for ${fileId}`);

      const downloadUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${infoData.result.file_path}`;
      const fileResponse = await fetch(downloadUrl);
      if (!fileResponse.ok) throw new Error(`Failed to download chunk: ${fileResponse.statusText}`);

      buffers.push(new Uint8Array(await fileResponse.arrayBuffer()));
    }

    const totalLength = buffers.reduce((sum, buf) => sum + buf.length, 0);
    const merged = new Uint8Array(totalLength);
    let offset = 0;
    for (const buffer of buffers) { merged.set(buffer, offset); offset += buffer.length; }

    return new NextResponse(merged as any, {
      headers: { 'Content-Type': 'application/octet-stream', 'Content-Disposition': `attachment; filename="${fileName}"`, 'Content-Length': merged.length.toString() },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Merge failed' }, { status: 500 });
  }
}
