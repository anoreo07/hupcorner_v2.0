import { redirect } from 'next/navigation';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject(),
};

export default function RootRedirect() {
  redirect('/home');
}
