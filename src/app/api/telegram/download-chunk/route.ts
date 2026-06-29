import { NextRequest, NextResponse } from 'next/server';
import { getDirectDownloadUrl } from '@/lib/telegram';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const botIndex = searchParams.get('botIndex') ? parseInt(searchParams.get('botIndex')!, 10) : 1;

    if (!fileId) return NextResponse.json({ error: 'fileId is required' }, { status: 400 });

    const downloadUrl = await getDirectDownloadUrl(fileId, botIndex);
    const response = await fetch(downloadUrl);

    if (!response.ok) return NextResponse.json({ error: 'Failed to fetch chunk from Telegram' }, { status: response.status });

    return new NextResponse(response.body, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Length': response.headers.get('Content-Length') || '',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Chunk download failed' }, { status: 500 });
  }
}
