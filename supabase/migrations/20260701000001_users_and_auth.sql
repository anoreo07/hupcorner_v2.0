-- Users & Auth system for HUP Corner
-- Adds user registration, role management, profiles, forum, comments, bookmarks, video lectures

-- 1. User role enum
CREATE TYPE public.user_role AS ENUM ('USER', 'PHARMACY_STUDENT', 'ADMIN');
ALTER TYPE public.user_role OWNER TO postgres;

-- 2. User status enum
CREATE TYPE public.user_status AS ENUM ('ACTIVE', 'LOCKED', 'DELETED');
ALTER TYPE public.user_status OWNER TO postgres;

-- 3. Verification status enum
CREATE TYPE public.verification_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
ALTER TYPE public.verification_status OWNER TO postgres;

-- 4. Users table
CREATE TABLE IF NOT EXISTS public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password_hash text,
    name text NOT NULL,
    username text NOT NULL,
    role public.user_role DEFAULT 'USER'::public.user_role NOT NULL,
    avatar_url text,
    description text,
    status public.user_status DEFAULT 'ACTIVE'::public.user_status NOT NULL,
    locked_until timestamp with time zone,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_username_key UNIQUE (username)
);
ALTER TABLE public.users OWNER TO postgres;

-- 5. Student verifications table
CREATE TABLE IF NOT EXISTS public.student_verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    full_name text,
    student_id text,
    id_card_image text,
    status public.verification_status DEFAULT 'PENDING'::public.verification_status NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT student_verifications_pkey PRIMARY KEY (id),
    CONSTRAINT student_verifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT student_verifications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id)
);
ALTER TABLE public.student_verifications OWNER TO postgres;

-- 6. Bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    document_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT bookmarks_pkey PRIMARY KEY (id),
    CONSTRAINT bookmarks_user_id_document_id_key UNIQUE (user_id, document_id),
    CONSTRAINT bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT bookmarks_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE
);
ALTER TABLE public.bookmarks OWNER TO postgres;

-- 7. Download history table
CREATE TABLE IF NOT EXISTS public.download_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    document_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT download_history_pkey PRIMARY KEY (id),
    CONSTRAINT download_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT download_history_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE
);
ALTER TABLE public.download_history OWNER TO postgres;

-- 8. Document comments table
CREATE TABLE IF NOT EXISTS public.document_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    document_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT document_comments_pkey PRIMARY KEY (id),
    CONSTRAINT document_comments_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE,
    CONSTRAINT document_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
ALTER TABLE public.document_comments OWNER TO postgres;

-- 9. Forum threads table
CREATE TABLE IF NOT EXISTS public.forum_threads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    image_url text,
    view_count integer DEFAULT 0,
    like_count integer DEFAULT 0,
    comment_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT forum_threads_pkey PRIMARY KEY (id),
    CONSTRAINT forum_threads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
ALTER TABLE public.forum_threads OWNER TO postgres;

-- 10. Forum comments table
CREATE TABLE IF NOT EXISTS public.forum_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    thread_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    like_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT forum_comments_pkey PRIMARY KEY (id),
    CONSTRAINT forum_comments_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    CONSTRAINT forum_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
ALTER TABLE public.forum_comments OWNER TO postgres;

-- 11. Forum likes table
CREATE TABLE IF NOT EXISTS public.forum_likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    thread_id uuid,
    comment_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT forum_likes_pkey PRIMARY KEY (id),
    CONSTRAINT forum_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT forum_likes_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    CONSTRAINT forum_likes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.forum_comments(id) ON DELETE CASCADE,
    CONSTRAINT forum_likes_target_check CHECK (
        (thread_id IS NOT NULL AND comment_id IS NULL) OR
        (thread_id IS NULL AND comment_id IS NOT NULL)
    )
);
ALTER TABLE public.forum_likes OWNER TO postgres;

-- 12. Video lectures table
CREATE TABLE IF NOT EXISTS public.video_lectures (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    lecturer_name text,
    subject_name text,
    subject_code text,
    youtube_url text NOT NULL,
    description text,
    major_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT video_lectures_pkey PRIMARY KEY (id),
    CONSTRAINT video_lectures_major_id_fkey FOREIGN KEY (major_id) REFERENCES public.majors(id) ON DELETE SET NULL
);
ALTER TABLE public.video_lectures OWNER TO postgres;

-- 13. Add user_id to documents table for tracking uploaders
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.documents ADD CONSTRAINT documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- 14. Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_student_verifications_user_id ON public.student_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_student_verifications_status ON public.student_verifications(status);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_document_id ON public.bookmarks(document_id);
CREATE INDEX IF NOT EXISTS idx_download_history_user_id ON public.download_history(user_id);
CREATE INDEX IF NOT EXISTS idx_download_history_document_id ON public.download_history(document_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_document_id ON public.document_comments(document_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_user_id ON public.forum_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_created_at ON public.forum_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_comments_thread_id ON public.forum_comments(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_user_id ON public.forum_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_thread_id ON public.forum_likes(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_comment_id ON public.forum_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_video_lectures_major_id ON public.video_lectures(major_id);

-- 15. RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_lectures ENABLE ROW LEVEL SECURITY;

-- Users: select for all, update own, insert for anon
CREATE POLICY "Users can read own data" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert during registration" ON public.users FOR INSERT WITH CHECK (true);

-- Student verifications: insert/read own, admin read/update all
CREATE POLICY "Read own verifications" ON public.student_verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insert own verification" ON public.student_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin manage verifications" ON public.student_verifications FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'ADMIN'));

-- Bookmarks: user manages own
CREATE POLICY "Manage own bookmarks" ON public.bookmarks FOR ALL USING (auth.uid() = user_id);

-- Download history: user reads own, insert own
CREATE POLICY "Read own downloads" ON public.download_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insert own downloads" ON public.download_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Document comments: all read, auth insert, own update/delete
CREATE POLICY "Read comments" ON public.document_comments FOR SELECT USING (true);
CREATE POLICY "Insert comments" ON public.document_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own comments" ON public.document_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Delete own comments" ON public.document_comments FOR DELETE USING (auth.uid() = user_id);

-- Forum threads: all read, auth insert, own update/delete
CREATE POLICY "Read threads" ON public.forum_threads FOR SELECT USING (true);
CREATE POLICY "Insert threads" ON public.forum_threads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own threads" ON public.forum_threads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Delete own threads" ON public.forum_threads FOR DELETE USING (auth.uid() = user_id);

-- Forum comments: all read, auth insert, own update/delete
CREATE POLICY "Read forum comments" ON public.forum_comments FOR SELECT USING (true);
CREATE POLICY "Insert forum comments" ON public.forum_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own forum comments" ON public.forum_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Delete own forum comments" ON public.forum_comments FOR DELETE USING (auth.uid() = user_id);

-- Forum likes: all read, auth insert, own delete
CREATE POLICY "Read likes" ON public.forum_likes FOR SELECT USING (true);
CREATE POLICY "Insert likes" ON public.forum_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own likes" ON public.forum_likes FOR DELETE USING (auth.uid() = user_id);

-- Video lectures: all read, admin write
CREATE POLICY "Read video lectures" ON public.video_lectures FOR SELECT USING (true);
CREATE POLICY "Admin manage videos" ON public.video_lectures FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'ADMIN'));

-- 16. RPC functions for forum
CREATE OR REPLACE FUNCTION public.increment_thread_view(thread_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.forum_threads
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = thread_id;
END;
$$;
ALTER FUNCTION public.increment_thread_view(thread_id uuid) OWNER TO postgres;
GRANT ALL ON FUNCTION public.increment_thread_view(thread_id uuid) TO anon;
GRANT ALL ON FUNCTION public.increment_thread_view(thread_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.increment_thread_view(thread_id uuid) TO service_role;

-- 17. Grant permissions
GRANT ALL ON public.users TO anon;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.student_verifications TO anon;
GRANT ALL ON public.student_verifications TO authenticated;
GRANT ALL ON public.student_verifications TO service_role;
GRANT ALL ON public.bookmarks TO anon;
GRANT ALL ON public.bookmarks TO authenticated;
GRANT ALL ON public.bookmarks TO service_role;
GRANT ALL ON public.download_history TO anon;
GRANT ALL ON public.download_history TO authenticated;
GRANT ALL ON public.download_history TO service_role;
GRANT ALL ON public.document_comments TO anon;
GRANT ALL ON public.document_comments TO authenticated;
GRANT ALL ON public.document_comments TO service_role;
GRANT ALL ON public.forum_threads TO anon;
GRANT ALL ON public.forum_threads TO authenticated;
GRANT ALL ON public.forum_threads TO service_role;
GRANT ALL ON public.forum_comments TO anon;
GRANT ALL ON public.forum_comments TO authenticated;
GRANT ALL ON public.forum_comments TO service_role;
GRANT ALL ON public.forum_likes TO anon;
GRANT ALL ON public.forum_likes TO authenticated;
GRANT ALL ON public.forum_likes TO service_role;
GRANT ALL ON public.video_lectures TO anon;
GRANT ALL ON public.video_lectures TO authenticated;
GRANT ALL ON public.video_lectures TO service_role;
