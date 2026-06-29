'use client';

export interface FileChunk {
  index: number;
  blob: Blob;
  fileName: string;
  totalChunks: number;
}

const CHUNK_SIZE = 4 * 1024 * 1024;
const VERCEL_LIMIT = 4.5 * 1024 * 1024;
const MAX_CONCURRENT_UPLOADS = 3;

export function needsChunking(fileSize: number): boolean {
  return fileSize > VERCEL_LIMIT;
}

export function calculateChunks(fileSize: number): number {
  if (fileSize <= CHUNK_SIZE) return 1;
  return Math.ceil(fileSize / CHUNK_SIZE);
}

export function splitFileIntoChunks(file: File): FileChunk[] {
  const chunks: FileChunk[] = [];
  const totalChunks = calculateChunks(file.size);

  if (totalChunks === 1) {
    chunks.push({ index: 0, blob: file, fileName: file.name, totalChunks: 1 });
    return chunks;
  }

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const blob = file.slice(start, end);
    const baseName = file.name.substring(0, file.name.lastIndexOf('.'));
    const extension = file.name.substring(file.name.lastIndexOf('.'));
    const chunkFileName = `${baseName}.chunk${i + 1}of${totalChunks}${extension}`;

    chunks.push({
      index: i,
      blob: new File([blob], chunkFileName, { type: file.type }),
      fileName: chunkFileName,
      totalChunks,
    });
  }

  return chunks;
}

export async function uploadChunkToTelegram(
  chunk: FileChunk,
  chatId: string,
  onProgress?: (progress: number) => void,
  retryCount = 0,
  botIndex?: number
): Promise<{ file_id: string; message_id: number; file_name: string; file_size: number; chunk_info: string }> {
  const MAX_RETRIES = 3;

  return new Promise((resolve, reject) => {
    if (!chatId || chatId.trim() === '') {
      reject(new Error('Telegram Channel ID is not configured'));
      return;
    }

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        if (onProgress) {
          const totalProgress = ((chunk.index / chunk.totalChunks) * 100) + ((percentComplete / chunk.totalChunks));
          onProgress(Math.round(totalProgress));
        }
      }
    });

    xhr.addEventListener('load', async () => {
      if (xhr.status === 200) {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve({
            file_id: result.file_id,
            message_id: result.message_id || 0,
            file_name: result.file_name,
            file_size: result.file_size,
            chunk_info: `Chunk ${chunk.index + 1}/${chunk.totalChunks}`,
          });
        } catch {
          reject(new Error('Invalid response from server'));
        }
      } else if (xhr.status === 429 && retryCount < MAX_RETRIES) {
        const retryAfter = parseInt(xhr.getResponseHeader('Retry-After') || '5', 10);
        setTimeout(() => {
          uploadChunkToTelegram(chunk, chatId, onProgress, retryCount + 1, botIndex)
            .then(resolve)
            .catch(reject);
        }, retryAfter * 1000);
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.error || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

    const formData = new FormData();
    formData.append('document', chunk.blob, chunk.fileName);
    formData.append('chat_id', chatId);

    if (chunk.totalChunks > 1) {
      formData.append('caption', `${chunk.fileName} (${chunk.index + 1}/${chunk.totalChunks})`);
    }

    if (botIndex) {
      formData.append('bot_index', String(botIndex));
    }

    xhr.open('POST', '/api/telegram/upload-proxy');
    xhr.send(formData);
  });
}

export async function uploadFileWithChunking(
  file: File,
  chatId: string,
  onProgress?: (progress: number, message?: string) => void,
  botIndex?: number
): Promise<string[]> {
  const chunks = splitFileIntoChunks(file);

  if (chunks.length === 1) {
    onProgress?.(0, 'Đang tải lên...');
    const result = await uploadChunkToTelegram(chunks[0], chatId, (p) => onProgress?.(p), 0, botIndex);
    onProgress?.(100, 'Hoàn tất!');
    return [result.file_id];
  }

  onProgress?.(0, `Chia nhỏ file thành ${chunks.length} phần...`);

  const results: string[] = [];
  let completedChunks = 0;

  const uploadChunk = async (chunk: FileChunk): Promise<string> => {
    const result = await uploadChunkToTelegram(
      chunk,
      chatId,
      (p) => {
        const overallProgress = Math.round((completedChunks / chunks.length) * 100 + (p / chunks.length));
        onProgress?.(overallProgress, `Đang tải phần ${chunk.index + 1}/${chunks.length}...`);
      },
      0,
      botIndex
    );
    return `${result.file_id}|${result.message_id}`;
  };

  for (let i = 0; i < chunks.length; i += MAX_CONCURRENT_UPLOADS) {
    const batch = chunks.slice(i, i + MAX_CONCURRENT_UPLOADS);
    const batchResults = await Promise.all(batch.map(uploadChunk));
    results.push(...batchResults);
    completedChunks += batch.length;
    onProgress?.(Math.round((completedChunks / chunks.length) * 100));
  }

  onProgress?.(100, `✓ Hoàn tất! (${chunks.length} phần)`);
  return results;
}

export async function downloadFileParallel(
  filePath: string,
  fileName: string,
  onProgress?: (progress: number, message?: string) => void,
  botIndex: number = 1
): Promise<void> {
  if (!filePath.startsWith('chunk:')) {
    const a = document.createElement('a');
    const botQuery = botIndex ? `&botIndex=${botIndex}` : '';
    a.href = `/api/telegram/download?fileId=${encodeURIComponent(filePath)}&fileName=${encodeURIComponent(fileName)}${botQuery}`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  const chunks = filePath.substring(6).split(',');
  onProgress?.(0, `Đang tải ${chunks.length} phần...`);

  const blobPromises = chunks.map(async (chunk, index) => {
    const fileId = chunk.split('|')[0];
    const botQuery = botIndex ? `&botIndex=${botIndex}` : '';
    const res = await fetch(`/api/telegram/download-chunk?fileId=${encodeURIComponent(fileId)}${botQuery}`);
    if (!res.ok) throw new Error(`Failed to download chunk ${index + 1}`);
    onProgress?.(Math.round(((index + 1) / chunks.length) * 80), `Đang tải phần ${index + 1}/${chunks.length}...`);
    return res.blob();
  });

  const blobs = await Promise.all(blobPromises);

  onProgress?.(90, 'Đang ghép tệp...');
  const mergedBlob = new Blob(blobs);

  onProgress?.(95, 'Đang lưu tệp...');
  const url = URL.createObjectURL(mergedBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  onProgress?.(100, 'Hoàn tất!');
}
