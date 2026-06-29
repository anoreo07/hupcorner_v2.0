import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, checkRateLimit, RATE_LIMITS } from '@/utils/rate-limiter';
import { getTelegramBotToken, getConfiguredBotIndexes } from '@/lib/telegram';

export async function GET() {
  try {
    const activeBots = getConfiguredBotIndexes();
    if (activeBots.length === 0) {
      return NextResponse.json({ error: 'Server not configured for Telegram uploads' }, { status: 403 });
    }
    const randomIndex = Math.floor(Math.random() * activeBots.length);
    return NextResponse.json({ success: true, bot_index: activeBots[randomIndex], available_bots: activeBots });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to retrieve active bots' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(Object.fromEntries(request.headers.entries()));
    const rateLimitResult = checkRateLimit(clientIp, RATE_LIMITS.UPLOAD);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: rateLimitResult.message }, { status: 429, headers: { 'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } });
    }

    const activeBots = getConfiguredBotIndexes();
    if (activeBots.length === 0) {
      return NextResponse.json({ error: 'Server not configured for Telegram uploads' }, { status: 403 });
    }

    const formData = await request.formData();
    const document = formData.get('document') as Blob | null;
    const chatId = formData.get('chat_id') as string;
    const caption = formData.get('caption') as string;
    const clientBotIndexStr = formData.get('bot_index') as string | null;

    if (!document) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!chatId) return NextResponse.json({ error: 'No chat_id provided' }, { status: 400 });

    let botIndex = 1;
    if (clientBotIndexStr) {
      const idx = parseInt(clientBotIndexStr, 10);
      botIndex = activeBots.includes(idx) ? idx : activeBots[0];
    } else {
      botIndex = activeBots[Math.floor(Math.random() * activeBots.length)];
    }

    const botToken = getTelegramBotToken(botIndex);
    const telegramFormData = new FormData();
    telegramFormData.append('chat_id', chatId);
    telegramFormData.append('document', document);
    if (caption) telegramFormData.append('caption', caption);

    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, { method: 'POST', body: telegramFormData });
    const telegramData = await telegramResponse.json();

    if (!telegramResponse.ok) return NextResponse.json({ error: telegramData.description || 'Telegram API error' }, { status: telegramResponse.status });

    const fileInfo = telegramData.result?.document;
    if (!fileInfo) return NextResponse.json({ error: 'Invalid Telegram response' }, { status: 500 });

    return NextResponse.json({
      success: true,
      file_id: fileInfo.file_id,
      file_unique_id: fileInfo.file_unique_id,
      file_name: fileInfo.file_name,
      file_size: fileInfo.file_size,
      message_id: telegramData.result.message_id,
      telegram_bot_index: botIndex,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Upload failed' }, { status: 500 });
  }
}
