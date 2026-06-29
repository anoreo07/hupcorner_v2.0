const CHUNK_SIZE = 19 * 1024 * 1024;

export function getTelegramBotToken(botIndex: number = 1): string {
  const token = process.env[`TELEGRAM_BOT_TOKEN_${botIndex}`];
  if (!token) {
    throw new Error(`Telegram bot token TELEGRAM_BOT_TOKEN_${botIndex} is not configured`);
  }
  return token;
}

export function getConfiguredBotIndexes(): number[] {
  const indexes: number[] = [];
  for (let i = 1; i <= 5; i++) {
    if (process.env[`TELEGRAM_BOT_TOKEN_${i}`]) {
      indexes.push(i);
    }
  }
  return indexes;
}

export function getDefaultChatId(): string {
  return process.env.TELEGRAM_CHANNEL_ID || '-1003810443754';
}

export function parseTelegramFilePath(filePath: string): {
  fileId: string;
  messageId: number | null;
  isChunked: boolean;
  chunks: { fileId: string; messageId: number | null }[];
} {
  if (filePath.startsWith('chunk:')) {
    const chunkData = filePath.slice(6);
    const chunks = chunkData.split(',').map((part) => {
      const [fid, mid] = part.split('|');
      return {
        fileId: fid,
        messageId: mid ? parseInt(mid, 10) : null,
      };
    });
    return {
      fileId: chunks[0].fileId,
      messageId: chunks[0].messageId,
      isChunked: true,
      chunks,
    };
  }

  const parts = filePath.split('|');
  return {
    fileId: parts[0],
    messageId: parts[1] ? parseInt(parts[1], 10) : null,
    isChunked: false,
    chunks: [
      {
        fileId: parts[0],
        messageId: parts[1] ? parseInt(parts[1], 10) : null,
      },
    ],
  };
}

export class TelegramFileTooLargeError extends Error {
  constructor(fileId: string) {
    super(`File ${fileId} exceeds maximum download size`);
    this.name = 'TelegramFileTooLargeError';
  }
}

export async function uploadFileChunked(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  caption?: string
): Promise<{ file_path: string; file_name: string; file_size: number; mime_type: string }> {
  const chatId = getDefaultChatId();
  const botToken = getTelegramBotToken(1);

  if (buffer.length <= CHUNK_SIZE) {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
    formData.append('document', blob, fileName);
    formData.append('chat_id', chatId);
    if (caption) formData.append('caption', caption);

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.description || 'Telegram upload failed');

    return {
      file_path: data.result.document.file_id,
      file_name: data.result.document.file_name || fileName,
      file_size: data.result.document.file_size,
      mime_type: data.result.document.mime_type || mimeType,
    };
  }

  const chunks: string[] = [];
  let offset = 0;
  let part = 1;
  const totalParts = Math.ceil(buffer.length / CHUNK_SIZE);

  while (offset < buffer.length) {
    const end = Math.min(offset + CHUNK_SIZE, buffer.length);
    const chunkBuffer = buffer.slice(offset, end);
    const chunkFileName = `${fileName}.part${part}of${totalParts}`;

    const formData = new FormData();
    const blob = new Blob([chunkBuffer], { type: mimeType });
    formData.append('document', blob, chunkFileName);
    formData.append('chat_id', chatId);
    formData.append('caption', `${caption || fileName} (part ${part}/${totalParts})`);

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.description || `Telegram upload failed at part ${part}`);

    chunks.push(`${data.result.document.file_id}|${data.result.message_id}`);
    offset = end;
    part++;
  }

  return {
    file_path: `chunk:${chunks.join(',')}`,
    file_name: fileName,
    file_size: buffer.length,
    mime_type: mimeType,
  };
}

export async function downloadFileAuto(
  filePath: string,
  botIndex: number = 1
): Promise<{ buffer: Buffer }> {
  const botToken = getTelegramBotToken(botIndex);
  const { isChunked, chunks, fileId } = parseTelegramFilePath(filePath);

  if (!isChunked) {
    return downloadSingleFile(fileId, botToken);
  }

  const buffers: Buffer[] = [];
  for (const chunk of chunks) {
    const result = await downloadSingleFile(chunk.fileId, botToken);
    buffers.push(result.buffer);
  }
  return { buffer: Buffer.concat(buffers) };
}

async function downloadSingleFile(fileId: string, botToken: string): Promise<{ buffer: Buffer }> {
  const infoUrl = `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`;
  const infoRes = await fetch(infoUrl);
  const infoData = await infoRes.json();

  if (!infoData.ok) throw new Error(`Cannot get file info: ${infoData.description}`);

  const filePath = infoData.result.file_path;
  const downloadUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
  const fileRes = await fetch(downloadUrl);

  if (!fileRes.ok) throw new Error(`Failed to download file: ${fileRes.statusText}`);

  const buffer = Buffer.from(await fileRes.arrayBuffer());
  return { buffer };
}

export async function getDirectDownloadUrl(fileId: string, botIndex: number = 1): Promise<string> {
  const botToken = getTelegramBotToken(botIndex);
  const infoUrl = `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`;
  const infoRes = await fetch(infoUrl);
  const infoData = await infoRes.json();
  if (!infoData.ok) throw new Error(`Cannot get file info: ${infoData.description}`);
  return `https://api.telegram.org/file/bot${botToken}/${infoData.result.file_path}`;
}

export async function deleteMessageFromTelegram(messageId: number, botIndex: number = 1): Promise<boolean> {
  const botToken = getTelegramBotToken(botIndex);
  const chatId = getDefaultChatId();
  const res = await fetch(`https://api.telegram.org/bot${botToken}/deleteMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId }),
  });
  const data = await res.json();
  return data.ok;
}
