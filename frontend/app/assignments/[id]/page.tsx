'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Download, RefreshCw, Loader2 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { useStore } from '@/store';
import { getAssignment } from '@/lib/api';
import type { GeneratedPaper, Difficulty } from '@/store';

type QuestionType = 'mcq' | 'short' | 'long' | 'true_false';

const TYPE_LABEL: Record<QuestionType, string> = {
  mcq: 'Multiple Choice Questions',
  short: 'Short Answer Questions',
  long: 'Long Answer Questions',
  true_false: 'True / False Questions',
};

const DIFF: Record<Difficulty, { bg: string; color: string; label: string }> = {
  easy:   { bg: '#D1FAE5', color: '#065F46', label: 'Easy' },
  medium: { bg: '#FEF3C7', color: '#92400E', label: 'Moderate' },
  hard:   { bg: '#FEE2E2', color: '#991B1B', label: 'Challenging' },
};

function ExamPaper({ paper }: { paper: GeneratedPaper }) {
  return (
    <div id="exam-paper" style={{
      background: 'white', border: '1px solid #E5E7EB',
      borderRadius: 12, padding: '32px 40px',
      fontFamily: "'Times New Roman', Georgia, serif",
    }}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>
          Delhi Public School, Sector-4, Bokaro
        </div>
        <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>Subject: {paper.subject}</div>
        <div style={{ fontSize: 13, color: '#6B7280' }}>Class: {paper.gradeLevel}</div>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6B7280',
        padding: '10px 0', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', margin: '12px 0',
      }}>
        <span>Time Allowed: {paper.duration || '45 minutes'}</span>
        <span>Maximum Marks: {paper.totalMarks}</span>
      </div>

      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>
        All questions are compulsory unless stated otherwise.
      </p>

      {/* Student info — Name, Roll Number, Section only */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {['Name', 'Roll Number', 'Section'].map((label) => (
          <div key={label} style={{ fontSize: 13, display: 'flex', alignItems: 'baseline', gap: 6 }}>
            {label}:
            <span style={{ borderBottom: '1.5px solid #111827', display: 'inline-block', width: 180, height: 14 }} />
          </div>
        ))}
      </div>

      <hr style={{ border: 'none', borderTop: '1.5px solid #111827', margin: '16px 0' }} />

      {paper.sections.map((sec) => (
        <div key={sec.id} style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, textAlign: 'center', marginBottom: 6 }}>
            {sec.title}
          </h3>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
            {TYPE_LABEL[sec.questions[0]?.type as QuestionType] ?? 'Questions'}
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', fontStyle: 'italic', marginBottom: 10 }}>
            {sec.instruction}
          </div>

          {sec.questions.map((q, i) => (
            <div key={q.id} style={{ borderBottom: '1px solid #F3F4F6', padding: '10px 0' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, fontSize: 13, flexShrink: 0, minWidth: 22 }}>{i + 1}.</span>
                <span style={{ flex: 1, fontSize: 13, lineHeight: 1.6, minWidth: 200 }}>{q.text}</span>
                <span style={{ fontSize: 12, color: '#6B7280', flexShrink: 0, fontStyle: 'italic' }}>
                  [{q.marks} Mark{q.marks > 1 ? 's' : ''}]
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, flexShrink: 0,
                  background: (DIFF[q.difficulty] ?? DIFF.medium).bg,
                  color: (DIFF[q.difficulty] ?? DIFF.medium).color,
                }}>
                  {(DIFF[q.difficulty] ?? DIFF.medium).label}
                </span>
              </div>
              {q.options && (
                <div style={{ marginLeft: 28, marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {q.options.map((opt, oi) => (
                    <div key={oi} style={{ fontSize: 13, color: '#374151' }}>{opt}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      <p style={{ textAlign: 'center', fontSize: 13, color: '#9CA3AF', marginTop: 24, fontStyle: 'italic' }}>
        — End of Question Paper —
      </p>
    </div>
  );
}

export default function AssignmentOutputPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { papers, setPaper } = useStore();
  const [loading, setLoading] = useState(!papers[id]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (papers[id]) return;
    (async () => {
      try {
        const data = await getAssignment(id);
        if (data.paper) setPaper(id, data.paper);
        else if (data.status === 'failed') setNotFound(true);
        else router.push('/assignments');
      } catch { setNotFound(true); }
      setLoading(false);
    })();
  }, [id]);

  const paper = papers[id];

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #print-target { display: block !important; position: fixed; top: 0; left: 0; width: 100%; padding: 40px; background: white; }
          #print-target * { visibility: visible !important; }
        }
        #print-target { display: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .desktop-topbar-wrap { display: none !important; }
          .output-content { padding: 72px 16px 80px !important; max-width: 100% !important; }
          .ai-banner { flex-direction: column !important; align-items: flex-start !important; }
          #exam-paper { padding: 20px 16px !important; }
        }
      `}</style>

      {paper && (
        <div id="print-target">
          <ExamPaper paper={paper} />
        </div>
      )}

      <div style={{ display: 'flex', minHeight: '100vh', background: '#F2F2F2' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="desktop-topbar-wrap">
            <Topbar title="Create New" showBack backHref="/assignments" />
          </div>

          <div className="output-content" style={{
            flex: 1, padding: 24, display: 'flex', flexDirection: 'column',
            gap: 16, overflowY: 'auto', maxWidth: 860,
          }}>
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 300, color: '#6B7280' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                Loading question paper...
              </div>
            )}

            {notFound && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, minHeight: 300, justifyContent: 'center' }}>
                <p style={{ color: '#6B7280' }}>Assignment not found or generation failed.</p>
                <button onClick={() => router.push('/assignments/new')} style={{
                  background: '#E8541A', color: 'white', border: 'none',
                  padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
                }}>Try Again</button>
              </div>
            )}

            {paper && (
              <>
                <div className="ai-banner" style={{
                  background: '#1F2937', color: 'white', padding: '14px 20px',
                  borderRadius: 12, display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: 16, fontSize: 13, lineHeight: 1.5,
                }}>
                  <span>Certainly! Here is a customized Question Paper for your {paper.subject} {paper.gradeLevel} class.</span>
                  <button onClick={() => window.print()} style={{
                    display: 'flex', alignItems: 'center', gap: 6, background: 'white',
                    color: '#111827', border: 'none', borderRadius: 8, padding: '7px 14px',
                    fontSize: 13, fontWeight: 500, cursor: 'pointer', flexShrink: 0,
                  }}>
                    <Download size={14} /> Download as PDF
                  </button>
                </div>

                <ExamPaper paper={paper} />

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 32 }}>
                  <button onClick={() => router.push('/assignments/new')} style={{
                    display: 'flex', alignItems: 'center', gap: 6, background: '#FEF0EA',
                    color: '#E8541A', border: '1px solid #E8541A', borderRadius: 8,
                    padding: '9px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  }}>
                    <RefreshCw size={14} /> Regenerate
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}