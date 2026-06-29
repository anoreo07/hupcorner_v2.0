export type DocumentType = 'EXAM' | 'SLIDE' | 'TEXTBOOK' | 'OTHER' | 'OUTLINE';
export type StorageProvider = 'supabase' | 'r2' | 'cloudinary' | 'local' | 'telegram';
export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Major {
  id: string;
  code: string;
  name: string;
  created_at: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  theory_hours: number;
  practice_hours: number;
  exercise_hours: number;
  seminar_hours: number;
  major_id: string | null;
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  document_type: DocumentType;
  category: 'THEORY' | 'PRACTICAL' | null;
  telegram_bot_index: number | null;
  major_id: string | null;
  subject_name: string | null;
  academic_year: string | null;
  storage_provider: StorageProvider;
  file_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  status: DocumentStatus;
  view_count: number;
  download_count: number;
  subject_id: string | null;
  lecturer_name: string | null;
  faculty: string | null;
  description: string | null;
  uploader_name: string | null;
  uploader_note: string | null;
  created_at: string;
}

export interface DocumentWithMajor extends Document {
  majors?: Major | null;
  subjects?: Subject | null;
}

export interface DocumentInsert {
  title: string;
  document_type: DocumentType;
  category?: 'THEORY' | 'PRACTICAL' | null;
  telegram_bot_index?: number | null;
  major_id?: string | null;
  subject_name?: string | null;
  academic_year?: string | null;
  storage_provider: StorageProvider;
  file_path: string;
  file_name: string;
  file_size?: number | null;
  mime_type?: string | null;
  view_count?: number;
  download_count?: number;
  subject_id?: string | null;
  status?: DocumentStatus;
  lecturer_name?: string | null;
  faculty?: string | null;
  description?: string | null;
  uploader_name?: string | null;
  uploader_note?: string | null;
}

export interface Notification {
  id: string;
  title: string;
  description: string | null;
  published: boolean;
  created_at: string;
}
