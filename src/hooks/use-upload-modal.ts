'use client';

import { atom, useAtom } from 'jotai';

const uploadModalAtom = atom(false);

export function useUploadModal() {
  const [isOpen, setIsOpen] = useAtom(uploadModalAtom);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  return { isOpen, openModal, closeModal };
}
