'use client';

import { useState, useCallback, useMemo } from 'react';
import { uploadFileWithChunking, calculateChunks, needsChunking } from '@/utils/file-chunking';
import { useGlobalUploads } from './use-global-uploads';

export interface UseFileUploaderOptions {
  maxSize?: number;
  allowedTypes?: string[];
}

export interface FileUploadResult {
  file_id: string;
  file_unique_id: string;
  file_name: string;
  file_size: number;
  message_id: number;
  telegram_bot_index?: number;
}

export interface FileUploadState {
  fileName: string;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  message?: string;
  result?: FileUploadResult;
}

const DEFAULT_OPTIONS: UseFileUploaderOptions = {
  maxSize: 500 * 1024 * 1024,
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'video/mp4',
    'audio/mpeg',
  ],
};

const EXTENSION_TO_MIME_TYPE: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
};

export function useFileUploader(options: UseFileUploaderOptions = {}) {
  const { uploads, setUploads } = useGlobalUploads();
  const opts = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);

  const validateFile = useCallback(
    (file: File): { valid: boolean; message?: string } => {
      if (file.size > opts.maxSize!) {
        return {
          valid: false,
          message: `File quá lớn. Tối đa ${(opts.maxSize! / 1024 / 1024).toFixed(0)}MB (file: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
        };
      }
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const detectedMimeType = EXTENSION_TO_MIME_TYPE[fileExtension];
      const isMimeTypeValid = opts.allowedTypes!.includes(file.type) || (detectedMimeType && opts.allowedTypes!.includes(detectedMimeType));
      if (!isMimeTypeValid) {
        return {
          valid: false,
          message: `Định dạng không hỗ trợ: ${fileExtension}. Hỗ trợ: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, MP4, MP3`,
        };
      }
      return { valid: true };
    },
    [opts]
  );

  const uploadFile = useCallback(
    async (file: File, chatId?: string): Promise<FileUploadResult | null> => {
      const validation = validateFile(file);
      if (!validation.valid) {
        const uploadState: FileUploadState = {
          fileName: file.name,
          progress: 0,
          status: 'error',
          message: validation.message,
        };
        setUploads((prev) => [...prev, uploadState]);
        return null;
      }

      const channelId = chatId || process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_ID || '-1003810443754';
      if (!channelId || channelId.trim() === '') {
        const uploadState: FileUploadState = {
          fileName: file.name,
          progress: 0,
          status: 'error',
          message: 'Telegram Channel ID is not configured',
        };
        setUploads((prev) => [...prev, uploadState]);
        return null;
      }

      const uploadIndex = uploads.length;
      const isChunked = needsChunking(file.size);
      const chunkCount = calculateChunks(file.size);

      setUploads((prev) => [
        ...prev,
        {
          fileName: file.name,
          progress: 0,
          status: 'uploading',
          message: isChunked ? `Chia nhỏ file thành ${chunkCount} phần...` : undefined,
        },
      ]);

      try {
        let botIndex = 1;
        try {
          const res = await fetch('/api/telegram/upload-proxy');
          if (res.ok) {
            const data = await res.json();
            if (data.bot_index) botIndex = data.bot_index;
          }
        } catch (e) {
          console.error('Failed to pre-fetch bot index', e);
        }

        const fileIds = await uploadFileWithChunking(file, channelId, (progress, message) => {
          setUploads((prev) => {
            const updated = [...prev];
            updated[uploadIndex] = {
              ...updated[uploadIndex],
              progress,
              message: message || (isChunked ? `Đang upload... (${progress}%)` : undefined),
            };
            return updated;
          });
        }, botIndex);

        if (!fileIds || fileIds.length === 0) {
          throw new Error('Upload thất bại - không nhận được file_id từ Telegram');
        }

        const firstFileId = fileIds[0];
        const result: FileUploadResult = {
          file_id: firstFileId,
          file_unique_id: firstFileId,
          file_name: file.name,
          file_size: file.size,
          message_id: 0,
          telegram_bot_index: botIndex,
        };

        if (isChunked) {
          result.file_id = `chunk:${fileIds.join(',')}`;
        }

        setUploads((prev) => {
          const updated = [...prev];
          updated[uploadIndex] = {
            ...updated[uploadIndex],
            status: 'success',
            progress: 100,
            message: isChunked ? `✓ Upload thành công! (${chunkCount} phần)` : '✓ Upload thành công!',
            result,
          };
          return updated;
        });

        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed';
        setUploads((prev) => {
          const updated = [...prev];
          updated[uploadIndex] = { ...updated[uploadIndex], status: 'error', message };
          return updated;
        });
        return null;
      }
    },
    [validateFile, setUploads, uploads.length]
  );

  const clearUploads = useCallback(() => setUploads([]), [setUploads]);

  const removeUpload = useCallback(
    (index: number) => setUploads((prev) => prev.filter((_, i) => i !== index)),
    [setUploads]
  );

  return { uploads, uploadFile, clearUploads, removeUpload };
}
