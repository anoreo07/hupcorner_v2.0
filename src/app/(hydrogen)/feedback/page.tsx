import { metaObject } from '@/config/site.config';
import FeedbackClient from './feedback-client';

export const metadata = { ...metaObject('Feedback') };

export default function FeedbackPage() {
  return <FeedbackClient />;
}
