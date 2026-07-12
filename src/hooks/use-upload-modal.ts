'use client';

import { atom, useAtom } from 'jotai';

export type UploadType = 'document' | 'video' | null;

const uploadModalAtom = atom(false);
const uploadTypeAtom = atom<UploadType>(null);

export function useUploadModal() {
  const [isOpen, setIsOpen] = useAtom(uploadModalAtom);
  const [uploadType, setUploadType] = useAtom(uploadTypeAtom);
  const openModal = (type?: UploadType) => {
    setUploadType(type ?? null);
    setIsOpen(true);
  };
  const closeModal = () => {
    setIsOpen(false);
    setUploadType(null);
  };
  return { isOpen, openModal, closeModal, uploadType, setUploadType };
}
