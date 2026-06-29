'use client';

import { atom, useAtom } from 'jotai';

export interface FileUploadResult {
  file_id: string;
  file_unique_id: string;
  file_name: string;
  file_size: number;
  message_id: number;
}

export interface FileUploadState {
  fileName: string;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  message?: string;
  result?: FileUploadResult;
}

const uploadsAtom = atom<FileUploadState[]>([]);

export function useGlobalUploads() {
  const [uploads, setUploads] = useAtom(uploadsAtom);

  const addUpload = (upload: FileUploadState) => {
    setUploads((prev) => [...prev, upload]);
    return uploads.length;
  };

  const updateUpload = (index: number, update: Partial<FileUploadState>) => {
    setUploads((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], ...update };
      }
      return next;
    });
  };

  const clearUploads = () => setUploads([]);

  const removeUpload = (index: number) => {
    setUploads((prev) => prev.filter((_, i) => i !== index));
  };

  return { uploads, setUploads, addUpload, updateUpload, clearUploads, removeUpload };
}
