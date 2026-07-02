export type DocumentType = 'EXAM' | 'SLIDE' | 'TEXTBOOK' | 'OTHER' | 'OUTLINE';
export type StorageProvider = 'supabase' | 'r2' | 'cloudinary' | 'local' | 'telegram';
export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type UserRole = 'USER' | 'PHARMACY_STUDENT' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'LOCKED' | 'DELETED';
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

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
  user_id: string | null;
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
  status?: DocumentStatus;
  subject_id?: string | null;
  lecturer_name?: string | null;
  faculty?: string | null;
  description?: string | null;
  uploader_name?: string | null;
  uploader_note?: string | null;
  view_count?: number;
  download_count?: number;
  user_id?: string | null;
}

export interface Notification {
  id: string;
  title: string;
  description: string | null;
  published: boolean;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  password_hash: string | null;
  name: string;
  username: string;
  role: UserRole;
  avatar_url: string | null;
  description: string | null;
  status: UserStatus;
  locked_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserInsert {
  email: string;
  password_hash?: string | null;
  name: string;
  username: string;
  role?: UserRole;
  avatar_url?: string | null;
  description?: string | null;
  status?: UserStatus;
}

export interface StudentVerification {
  id: string;
  user_id: string;
  full_name: string | null;
  student_id: string | null;
  id_card_image: string | null;
  status: VerificationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  document_id: string;
  created_at: string;
}

export interface DownloadRecord {
  id: string;
  user_id: string;
  document_id: string;
  created_at: string;
}

export interface DocumentComment {
  id: string;
  document_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ForumThread {
  id: string;
  title: string;
  content: string;
  image_url?: string | null;
  user_id: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface ForumComment {
  id: string;
  thread_id: string;
  user_id: string;
  content: string;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export interface ForumLike {
  id: string;
  user_id: string;
  thread_id: string | null;
  comment_id: string | null;
  created_at: string;
}

export interface VideoLecture {
  id: string;
  title: string;
  lecturer_name: string | null;
  subject_name: string | null;
  subject_code: string | null;
  youtube_url: string;
  description: string | null;
  major_id: string | null;
  created_at: string;
  updated_at: string;
}
