'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSubjects, getDocumentsBySubject } from '@/lib/supabase';
import { Subject, DocumentWithMajor } from '@/types/database';
import { DocumentCard } from '@/components/editorial/document-card';
import { BookOpen, HelpCircle, Sparkles, FileText, ArrowLeft, ChevronRight, Search } from 'lucide-react';

type TabType = 'quiz' | 'flashcards' | 'outlines';

export default function ExamPrepPage() {
  const [activeTab, setActiveTab] = useState<TabType>('outlines');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [outlines, setOutlines] = useState<DocumentWithMajor[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingOutlines, setLoadingOutlines] = useState(false);

  useEffect(() => {
    getSubjects().then(setSubjects).catch(console.error).finally(() => setLoadingSubjects(false));
  }, []);

  useEffect(() => {
    if (!selectedSubject) { setOutlines([]); return; }
    setLoadingOutlines(true);
    getDocumentsBySubject(selectedSubject.id)
      .then((docs) => setOutlines(docs.filter(doc => doc.document_type === 'OUTLINE')))
      .catch(console.error)
      .finally(() => setLoadingOutlines(false));
  }, [selectedSubject]);

  const filteredSubjects = subjects.filter(
    (s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="arionear-container py-6 md:py-10">
      {/* Hero */}
      <section className="card p-10 md:p-14 mb-16">
        <div className="max-w-2xl">
          <p className="label-red mb-4">HỆ THỐNG ÔN THI</p>
          <h1 className="page-heading mb-6">
            Ôn thi
            <br />
            <span className="text-red">một cách học thuật</span>
          </h1>
          <p className="subheading">
            Bộ sưu tập đề cương, flashcard và câu hỏi thực hành được tuyển chọn
            giúp sinh viên HUP chuẩn bị cho kỳ thi một cách hiệu quả.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex border-b border-ink mb-12">
        {(['quiz', 'flashcards', 'outlines'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-4 font-mono text-meta uppercase tracking-[0.15em] transition-colors duration-200 relative ${
              activeTab === tab ? 'text-ink' : 'text-ink-lighter hover:text-ink'
            }`}
          >
            {activeTab === tab && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink" />}
            <span className="flex items-center gap-2">
              {tab === 'quiz' && <HelpCircle size={14} strokeWidth={1.5} />}
              {tab === 'flashcards' && <Sparkles size={14} strokeWidth={1.5} />}
              {tab === 'outlines' && <BookOpen size={14} strokeWidth={1.5} />}
              {tab === 'quiz' ? 'Câu hỏi ôn tập (Sắp ra mắt)' : tab === 'flashcards' ? 'Thẻ ghi nhớ (Sắp ra mắt)' : 'Đề cương'}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'quiz' && (
            <div className="card p-12 md:p-16 max-w-xl mx-auto text-center">
              <HelpCircle size={48} strokeWidth={1.5} className="mx-auto text-ink-lighter/40 mb-6" />
              <span className="label-red border border-red px-3 py-1 inline-block mb-4">SẮP RA MẮT</span>
              <h2 className="font-serif text-heading-3 font-bold text-ink mb-3">Câu hỏi ôn tập</h2>
              <p className="text-body-sm text-ink-lighter">Ngân hàng câu hỏi theo môn học đang được phát triển.</p>
            </div>
          )}

          {activeTab === 'flashcards' && (
            <div className="card p-12 md:p-16 max-w-xl mx-auto text-center">
              <Sparkles size={48} strokeWidth={1.5} className="mx-auto text-ink-lighter/40 mb-6" />
              <span className="label-red border border-red px-3 py-1 inline-block mb-4">SẮP RA MẮT</span>
              <h2 className="font-serif text-heading-3 font-bold text-ink mb-3">Thẻ ghi nhớ</h2>
              <p className="text-body-sm text-ink-lighter">Hệ thống ôn tập bằng thẻ ghi nhớ đang được chuẩn bị.</p>
            </div>
          )}

          {activeTab === 'outlines' && (
            <div className="space-y-8">
              {!selectedSubject ? (
                <>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <p className="text-body-sm text-ink-lighter">Chọn môn học để xem đề cương.</p>
                    <div className="relative w-full md:w-72">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-lighter" size={16} strokeWidth={1.5} />
                      <input type="text" placeholder="Tìm kiếm môn học..." value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-11" />
                    </div>
                  </div>

                  {loadingSubjects ? (
                    <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-ink/10 border-t-ink rounded-full animate-spin" /></div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredSubjects.map((subject) => (
                        <button key={subject.id} onClick={() => setSelectedSubject(subject)}
                          className="card p-6 text-left group flex items-center justify-between">
                          <div>
                            <p className="font-mono text-meta uppercase tracking-[0.1em] text-ink-lighter mb-1">{subject.code} &bull; {subject.credits} tín chỉ</p>
                            <h3 className="font-serif text-heading-4 font-bold text-ink transition-colors duration-200 group-hover:text-red">{subject.name}</h3>
                          </div>
                          <ChevronRight size={18} strokeWidth={1.5} className="text-ink-lighter transition-colors duration-200 group-hover:text-ink shrink-0" />
                        </button>
                      ))}
                      {filteredSubjects.length === 0 && (
                        <div className="col-span-full card p-12 text-center">
                          <BookOpen size={36} strokeWidth={1.5} className="mx-auto text-ink-lighter/40 mb-3" />
                          <p className="text-body-sm text-ink-lighter">Không tìm thấy môn học.</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center gap-4 pb-6 border-b border-ink/20">
                    <button onClick={() => setSelectedSubject(null)} className="btn-outline"><ArrowLeft size={16} strokeWidth={1.5} /></button>
                    <div>
                      <h2 className="font-serif text-heading-3 font-bold text-ink">Đề cương: {selectedSubject.name}</h2>
                      <p className="font-mono text-meta uppercase tracking-[0.1em] text-ink-lighter mt-1">Mã môn: {selectedSubject.code}</p>
                    </div>
                    <span className="ml-auto font-mono text-meta uppercase tracking-[0.1em] text-ink-lighter border border-ink/20 px-3 py-1">{outlines.length} đề cương</span>
                  </div>

                  {loadingOutlines ? (
                    <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-ink/10 border-t-ink rounded-full animate-spin" /></div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {outlines.map((doc, i) => (<DocumentCard key={doc.id} doc={doc} index={i} />))}
                      {outlines.length === 0 && (
                        <div className="col-span-full card p-12 text-center">
                          <FileText size={36} strokeWidth={1.5} className="mx-auto text-ink-lighter/40 mb-3" />
                          <p className="text-body-sm text-ink-lighter mb-6">Chưa có đề cương cho môn học này.</p>
                          <button onClick={() => setSelectedSubject(null)} className="btn-outline">Chọn môn khác</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
