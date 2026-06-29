import { getDocumentById, getRelatedDocuments } from '@/lib/supabase';
import { metaObject } from '@/config/site.config';
import { notFound } from 'next/navigation';
import DocumentDetailClient from './document-detail-client';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const document = await getDocumentById(id);
  if (!document) return metaObject('Document not found');
  return metaObject(document.title);
}

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const document = await getDocumentById(id);
  if (!document) notFound();

  const relatedDocuments = await getRelatedDocuments(document);
  return <DocumentDetailClient document={document} relatedDocuments={relatedDocuments} />;
}
