import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const userId = (session.user as any).id;

    const bucketName = 'avatars';
    const { data: bucket } = await supabase.storage.getBucket(bucketName);
    if (!bucket) {
      await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
        fileSizeLimit: 5 * 1024 * 1024,
      });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    const { data: user, error: userError } = await (supabase.from('users') as any)
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('email', userId)
      .select()
      .single();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
