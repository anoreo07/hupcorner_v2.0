


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."document_status" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE "public"."document_status" OWNER TO "postgres";


CREATE TYPE "public"."document_type" AS ENUM (
    'EXAM',
    'SLIDE',
    'TEXTBOOK',
    'OTHER'
);


ALTER TYPE "public"."document_type" OWNER TO "postgres";


CREATE TYPE "public"."document_visibility" AS ENUM (
    'PUBLIC',
    'PRIVATE',
    'SCHOOL_ONLY'
);


ALTER TYPE "public"."document_visibility" OWNER TO "postgres";


CREATE TYPE "public"."exam_type" AS ENUM (
    'MIDTERM',
    'FINAL',
    'QUIZ',
    'PRACTICE'
);


ALTER TYPE "public"."exam_type" OWNER TO "postgres";


CREATE TYPE "public"."storage_provider" AS ENUM (
    'supabase',
    'r2',
    'cloudinary',
    'local'
);


ALTER TYPE "public"."storage_provider" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_download_count"("doc_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE documents
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE id = doc_id;
END;
$$;


ALTER FUNCTION "public"."increment_download_count"("doc_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_view_count"("doc_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE documents
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = doc_id;
END;
$$;


ALTER FUNCTION "public"."increment_view_count"("doc_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."limit_documents_per_minute"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  upload_count integer;
begin
  select count(*) into upload_count
  from public.documents
  where user_id = new.user_id
    and created_at > now() - interval '1 minute';

  if upload_count >= 5 then
    raise exception 'Rate limit exceeded: max 5 documents per minute';
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."limit_documents_per_minute"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."limit_documents_per_minute_global"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  upload_count integer;
begin
  select count(*) into upload_count
  from public.documents
  where created_at > now() - interval '1 minute';

  if upload_count >= 5 then
    raise exception 'Rate limit exceeded: max 5 documents per minute (global)';
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."limit_documents_per_minute_global"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_auth" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "password_hash" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_auth" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "document_type" "text" NOT NULL,
    "major_id" "uuid",
    "subject_name" "text",
    "academic_year" "text",
    "lecturer_name" "text",
    "faculty" "text",
    "description" "text",
    "storage_provider" "text" NOT NULL,
    "file_path" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_size" bigint,
    "mime_type" "text",
    "status" "text" DEFAULT 'PENDING'::"text" NOT NULL,
    "approved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "view_count" integer DEFAULT 0,
    "download_count" integer DEFAULT 0,
    "subject_id" "uuid",
    "category" "text",
    "telegram_bot_index" integer DEFAULT 1,
    CONSTRAINT "documents_category_check" CHECK (("category" = ANY (ARRAY['THEORY'::"text", 'PRACTICAL'::"text"]))),
    CONSTRAINT "documents_document_type_check" CHECK (("document_type" = ANY (ARRAY['EXAM'::"text", 'SLIDE'::"text", 'TEXTBOOK'::"text", 'OTHER'::"text", 'OUTLINE'::"text"]))),
    CONSTRAINT "documents_status_check" CHECK (("status" = ANY (ARRAY['PENDING'::"text", 'APPROVED'::"text", 'REJECTED'::"text"])))
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."majors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."majors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "published" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."site_reviews" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "rating" integer NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "user_name" "text",
    "is_anonymous" boolean DEFAULT false,
    "ip_address" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "site_reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."site_reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subjects" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "credits" integer DEFAULT 2,
    "theory_hours" integer DEFAULT 0,
    "practice_hours" integer DEFAULT 0,
    "exercise_hours" integer DEFAULT 0,
    "seminar_hours" integer DEFAULT 0,
    "major_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."subjects" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_auth"
    ADD CONSTRAINT "admin_auth_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."majors"
    ADD CONSTRAINT "majors_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."majors"
    ADD CONSTRAINT "majors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_reviews"
    ADD CONSTRAINT "site_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_documents_category" ON "public"."documents" USING "btree" ("category");



CREATE INDEX "idx_documents_created_at" ON "public"."documents" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_documents_major" ON "public"."documents" USING "btree" ("major_id");



CREATE INDEX "idx_documents_status" ON "public"."documents" USING "btree" ("status");



CREATE INDEX "idx_documents_subject_id" ON "public"."documents" USING "btree" ("subject_id");



CREATE INDEX "idx_notifications_created_at" ON "public"."notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_notifications_published" ON "public"."notifications" USING "btree" ("published");



CREATE INDEX "idx_site_reviews_ip_created" ON "public"."site_reviews" USING "btree" ("ip_address", "created_at");



CREATE OR REPLACE TRIGGER "documents_rate_limit" BEFORE INSERT ON "public"."documents" FOR EACH ROW EXECUTE FUNCTION "public"."limit_documents_per_minute_global"();

ALTER TABLE "public"."documents" DISABLE TRIGGER "documents_rate_limit";



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_major_id_fkey" FOREIGN KEY ("major_id") REFERENCES "public"."majors"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id");



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_major_id_fkey" FOREIGN KEY ("major_id") REFERENCES "public"."majors"("id");



CREATE POLICY "Allow public read subjects" ON "public"."subjects" FOR SELECT USING (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."site_reviews" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."documents" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."majors" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."site_reviews" FOR SELECT USING (true);



ALTER TABLE "public"."admin_auth" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."majors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."site_reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subjects" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_download_count"("doc_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_download_count"("doc_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_download_count"("doc_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_view_count"("doc_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_view_count"("doc_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_view_count"("doc_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."limit_documents_per_minute"() TO "anon";
GRANT ALL ON FUNCTION "public"."limit_documents_per_minute"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."limit_documents_per_minute"() TO "service_role";



GRANT ALL ON FUNCTION "public"."limit_documents_per_minute_global"() TO "anon";
GRANT ALL ON FUNCTION "public"."limit_documents_per_minute_global"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."limit_documents_per_minute_global"() TO "service_role";



GRANT ALL ON TABLE "public"."admin_auth" TO "anon";
GRANT ALL ON TABLE "public"."admin_auth" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_auth" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."majors" TO "anon";
GRANT ALL ON TABLE "public"."majors" TO "authenticated";
GRANT ALL ON TABLE "public"."majors" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."site_reviews" TO "anon";
GRANT ALL ON TABLE "public"."site_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."site_reviews" TO "service_role";



GRANT ALL ON TABLE "public"."subjects" TO "anon";
GRANT ALL ON TABLE "public"."subjects" TO "authenticated";
GRANT ALL ON TABLE "public"."subjects" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







