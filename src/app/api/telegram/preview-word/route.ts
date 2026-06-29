import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { downloadFileAuto, TelegramFileTooLargeError } from '@/lib/telegram';

export const runtime = 'nodejs';
export const maxDuration = 120;
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const botIndex = searchParams.get('botIndex') ? parseInt(searchParams.get('botIndex')!, 10) : 1;

    if (!fileId) return NextResponse.json({ error: 'fileId is required' }, { status: 400 });

    const { buffer } = await downloadFileAuto(fileId, botIndex);
    const result = await mammoth.convertToHtml({ buffer }, {
      styleMap: ["p[style-name='Title'] => h1.doc-title", "p[style-name='Heading 1'] => h1", "p[style-name='Heading 2'] => h2", "p[style-name='Heading 3'] => h3"],
    });

    const htmlContent = `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.7;color:#1f2937;padding:32px 40px;max-width:800px;margin:0 auto;background:#fff}h1{font-size:1.75em;margin:1em 0 0.5em;color:#111827}h2{font-size:1.4em;margin:1em 0 0.4em;color:#1f2937}h3{font-size:1.15em;margin:0.8em 0 0.3em;color:#374151}p{margin:0.5em 0}table{border-collapse:collapse;width:100%;margin:1em 0}th,td{border:1px solid #d1d5db;padding:8px 12px;text-align:left}th{background:#f3f4f6;font-weight:600}ul,ol{margin:0.5em 0;padding-left:1.5em}li{margin:0.25em 0}img{max-width:100%;height:auto;margin:1em 0;border-radius:4px}strong{font-weight:600}em{font-style:italic}blockquote{border-left:4px solid #6366f1;padding:0.5em 1em;margin:1em 0;background:#f8fafc;color:#4b5563}.doc-title{font-size:2em;text-align:center;margin-bottom:1em;color:#111827}a{color:#2563eb;text-decoration:underline}</style></head><body>${result.value}</body></html>`;

    return new NextResponse(htmlContent, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
  } catch (error: any) {
    if (error instanceof TelegramFileTooLargeError) {
      return NextResponse.json({ error: error.message, code: 'TELEGRAM_FILE_TOO_LARGE' }, { status: 413 });
    }
    return NextResponse.json({ error: error.message || 'Preview failed' }, { status: 500 });
  }
}
