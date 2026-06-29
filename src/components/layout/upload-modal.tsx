'use client';

import { useState, useRef } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { useUploadModal } from '@/hooks/use-upload-modal';
import { useFileUploader } from '@/hooks/use-file-uploader';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';

export function UploadModal() {
  const { isOpen, closeModal } = useUploadModal();
  const { uploadFile, uploads, clearUploads, removeUpload } = useFileUploader();
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    await uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const hasSuccess = uploads.some(u => u.status === 'success');
  const hasError = uploads.some(u => u.status === 'error');
  const isUploading = uploads.some(u => u.status === 'uploading');

  return (
    <Dialog open={isOpen} onClose={closeModal} title="Tải lên tài liệu" className="max-w-md">
      <div className="space-y-6">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed p-10 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-burgundy bg-burgundy/5' : 'border-border hover:border-ink/30'
          }`}
        >
          <Upload size={32} className="mx-auto text-ink-lighter mb-3" />
          <p className="text-body-sm text-ink font-medium mb-1">Kéo thả file vào đây</p>
          <p className="font-mono text-meta uppercase tracking-wider text-ink-lighter">hoặc nhấp để chọn file</p>
          <input ref={inputRef} type="file" className="hidden" onChange={handleInput} />
        </div>

        {uploads.length > 0 && (
          <div className="space-y-3">
            {uploads.map((u, i) => (
              <div key={i} className="flex items-center gap-3 border border-border-light p-4">
                {u.status === 'uploading' ? (
                  <div className="w-5 h-5 border-2 border-ink/10 border-t-ink rounded-full animate-spin shrink-0" />
                ) : u.status === 'success' ? (
                  <Check size={20} className="text-olive shrink-0" />
                ) : (
                  <AlertCircle size={20} className="text-burgundy shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm text-ink font-medium truncate">{u.fileName}</p>
                  <p className="font-mono text-meta text-ink-lighter">{u.message || (u.status === 'uploading' ? `${u.progress}%` : '')}</p>
                </div>
                <button onClick={() => removeUpload(i)} className="text-ink-lighter hover:text-ink shrink-0">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="font-mono text-meta text-ink-lighter">Hỗ trợ: PDF, DOC, DOCX, PPT, JPG, PNG</p>
          <div className="flex gap-2">
            {hasSuccess && (
              <button onClick={clearUploads} className="btn-ghost text-sm">
                Xoá danh sách
              </button>
            )}
            <button onClick={closeModal} className="btn-outline text-sm" disabled={isUploading}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
