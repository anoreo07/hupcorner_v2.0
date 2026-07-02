import { Metadata } from 'next';

const siteConfig = {
  title: 'HUP Corner',
  description: 'Thư viện tri thức học thuật dành cho sinh viên Đại học HUP',
  url: 'https://hupcorner.vercel.app',
  mode: 'light' as const,
};

export function metaObject(title?: string): Metadata {
  const metaTitle = title
    ? `${title} — ${siteConfig.title}`
    : `${siteConfig.title} — Thư viện tri thức học thuật`;

  return {
    title: metaTitle,
    description: siteConfig.description,
    icons: { icon: '/favicon.ico' },
    openGraph: {
      title: metaTitle,
      description: siteConfig.description,
      url: siteConfig.url,
      siteName: siteConfig.title,
      locale: 'vi_VN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: siteConfig.description,
    },
  };
}

export default siteConfig;
