'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getVideoLectures } from '@/lib/user';
import type { VideoLecture } from '@/types/database';
import toast from 'react-hot-toast';
import { Loader2, Play } from 'lucide-react';

export default function VideoLecturesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [videos, setVideos] = useState<VideoLecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const user = session?.user as any;
  const canAccess = user?.role === 'PHARMACY_STUDENT' || user?.role === 'ADMIN';

  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Bạn cần đăng nhập là sinh viên Dược để truy cập mục này.');
      router.push('/login');
      return;
    }
    if (status === 'authenticated' && !canAccess) {
      toast.error('Bạn cần là sinh viên Dược để truy cập mục này.');
      router.push('/home');
      return;
    }
    if (status === 'authenticated') {
      loadVideos();
    }
  }, [status]);

  const loadVideos = async () => {
    try {
      const data = await getVideoLectures();
      setVideos(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Loader2 size={32} className="animate-spin text-ink-lighter" />
      </div>
    );
  }

  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/);
    return match ? match[1] : null;
  };

  return (
    <div className="min-h-screen bg-paper">
      <div className="arionear-container py-12">
        <h1 className="font-serif text-heading-1 font-bold text-ink leading-[0.92] tracking-tight mb-2">
          BÀI GIẢNG
        </h1>
        <p className="subheading mb-10">Video bài giảng dành cho sinh viên Dược</p>

        {selectedVideo && (
          <div className="mb-10 border-2 border-ink bg-black aspect-video max-w-4xl">
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideo}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {videos.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-ink/20">
            <Play size={48} className="mx-auto text-ink-lighter/40 mb-3" />
            <p className="font-sans text-body text-ink-lighter">Chưa có bài giảng nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => {
              const youtubeId = getYoutubeId(video.youtube_url);
              return (
                <div key={video.id} className="border-2 border-ink bg-paper card-shadow overflow-hidden">
                  <button
                    onClick={() => setSelectedVideo(youtubeId)}
                    className="w-full aspect-video bg-black relative group"
                  >
                    {youtubeId ? (
                      <img
                        src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-ink-lighter">
                        <Play size={48} className="text-paper" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-red/90 flex items-center justify-center group-hover:bg-red transition-colors">
                        <Play size={28} className="text-paper ml-1" />
                      </div>
                    </div>
                  </button>
                  <div className="p-4">
                    <h3 className="font-serif font-bold text-ink text-lg">{video.title}</h3>
                    {video.lecturer_name && (
                      <p className="font-sans text-body-sm text-ink-lighter mt-1">
                        GV: {video.lecturer_name}
                      </p>
                    )}
                    {(video.subject_name || video.subject_code) && (
                      <div className="flex items-center gap-2 mt-2">
                        {video.subject_name && (
                          <span className="font-mono text-meta uppercase tracking-widest text-ink-lighter">
                            {video.subject_name}
                          </span>
                        )}
                        {video.subject_code && (
                          <span className="font-mono text-meta text-ink-lighter bg-paper-light px-2 py-0.5">
                            {video.subject_code}
                          </span>
                        )}
                      </div>
                    )}
                    {video.description && (
                      <p className="font-sans text-body-sm text-ink-lighter mt-2 line-clamp-2">
                        {video.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
