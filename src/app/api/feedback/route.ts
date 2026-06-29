import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { submitSiteReview } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

    const result = await submitSiteReview({ ...body, ip_address: ip });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit review' }, { status: 400 });
  }
}
