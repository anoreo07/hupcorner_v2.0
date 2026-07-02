-- Add uploader_name to documents for display purposes
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS uploader_name text;
