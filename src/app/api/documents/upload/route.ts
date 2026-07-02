import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { z } from 'zod';

const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  document_type: z.string().min(1, 'Document type is required'),
  category: z.enum(['THEORY', 'PRACTICAL']).nullable().optional(),
  telegram_bot_index: z.number().nullable().optional().default(1),
  major_id: z.string().nullable().optional(),
  subject_id: z.string().nullable().optional(),
  subject_name: z.string().nullable().optional(),
  academic_year: z.string().nullable().optional(),
  lecturer_name: z.string().nullable().optional(),
  faculty: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  storage_provider: z.enum(['telegram', 'local', 's3']).default('telegram'),
  file_path: z.string().min(1, 'File path is required'),
  file_name: z.string().min(1, 'File name is required'),
  file_size: z.number().default(0),
  mime_type: z.string().nullable().optional(),
  uploader_name: z.string().nullable().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('PENDING'),
  view_count: z.number().default(0),
  download_count: z.number().default(0),
});

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const json = await req.json();
    const result = uploadSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.flatten().fieldErrors }, { status: 400 });
    }

    const { uploader_name, ...rest } = result.data;
    const dataToInsert: Record<string, any> = {
      ...rest,
      user_id: token?.sub || null,
    };
    if (uploader_name) dataToInsert.uploader_name = uploader_name;

    const supabaseAdmin = getSupabaseAdmin() as any;
    const { data, error } = await supabaseAdmin.from('documents').insert(dataToInsert).select().single();

    if (error) return NextResponse.json({ error: error.message, code: error.code, details: error.details }, { status: 500 });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
