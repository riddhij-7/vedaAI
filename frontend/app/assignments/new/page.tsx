'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Plus, Minus, CalendarIcon, ChevronDown, Loader2 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { useStore } from '@/store';
import { useAssignmentSocket } from '@/hooks/useAssignmentSocket';
import { createAssignment } from '@/lib/api';
import type { QuestionType } from '@/store';

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'mcq', label: 'Multiple Choice Questions' },
  { value: 'short', label: 'Short Questions' },
  { value: 'long', label: 'Long Answer Questions' },
  { value: 'true_false', label: 'True / False Questions' },
];

const GRADE_OPTIONS = ['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'];

function Counter({ value, onChange, min = 1 }: { value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F2F2F2', borderRadius: 8, padding: 4 }}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} style={{
        width: 26, height: 26, border: '1px solid #E5E7EB', background: 'white', borderRadius: 6,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280',
      }}>
        <Minus size={12} />
      </button>
      <span style={{ minWidth: 24, textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#111827' }}>{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} style={{
        width: 26, height: 26, border: '1px solid #E5E7EB', background: 'white', borderRadius: 6,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280',
      }}>
        <Plus size={12} />
      </button>
    </div>
  );
}

export default function NewAssignmentPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const { form, setForm, resetForm, setGenerating, generatingId, generationProgress, generationStatus } = useStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useAssignmentSocket(generatingId);

  useEffect(() => { resetForm(); }, []);

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.gradeLevel) e.gradeLevel = 'Grade level is required';
    if (!form.dueDate) e.dueDate = 'Due date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (form.questionConfigs.length === 0) e.configs = 'Add at least one question type';
    form.questionConfigs.forEach((qc, i) => {
      if (qc.count < 1) e[`count_${i}`] = 'Min 1';
      if (qc.marksEach < 1) e[`marks_${i}`] = 'Min 1';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFile = (file: File) => {
    const allowed = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) return;
    setForm({ file });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const addQuestionType = () => {
    const used = form.questionConfigs.map((q) => q.type);
    const next = QUESTION_TYPE_OPTIONS.find((o) => !used.includes(o.value));
    if (!next) return;
    setForm({ questionConfigs: [...form.questionConfigs, { type: next.value, count: 4, marksEach: 2 }] });
  };

  const removeQuestionType = (i: number) => {
    setForm({ questionConfigs: form.questionConfigs.filter((_, idx) => idx !== i) });
  };

  const updateConfig = (i: number, patch: Partial<typeof form.questionConfigs[0]>) => {
    setForm({ questionConfigs: form.questionConfigs.map((qc, idx) => idx === i ? { ...qc, ...patch } : qc) });
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    const fd = new FormData();
    fd.append('data', JSON.stringify({
      title: form.title, subject: form.subject, gradeLevel: form.gradeLevel,
      dueDate: form.dueDate, questionConfigs: form.questionConfigs,
      additionalInstructions: form.additionalInstructions,
    }));
    if (form.file) fd.append('file', form.file);
    try {
      const { assignmentId } = await createAssignment(fd);
      setGenerating(assignmentId);
    } catch (err: any) {
      setErrors({ submit: err.message });
    }
  };

  const totalQuestions = form.questionConfigs.reduce((s, q) => s + q.count, 0);
  const totalMarks = form.questionConfigs.reduce((s, q) => s + q.count * q.marksEach, 0);
  const isGenerating = !!generatingId && generationStatus !== 'done' && generationStatus !== 'failed';

  const inputStyle = (hasError?: boolean) => ({
    width: '100%', padding: '9px 12px', border: `1px solid ${hasError ? '#EF4444' : '#E5E7EB'}`,
    borderRadius: 8, fontSize: 13, fontFamily: 'inherit', color: '#111827',
    background: 'white', outline: 'none',
  });

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .desktop-topbar-wrap { display: none !important; }
          .form-content { padding: 72px 16px 80px !important; }
          .field-row { grid-template-columns: 1fr !important; }
          .config-row { grid-template-columns: 1fr auto 110px 96px !important; }
          .section-header { grid-template-columns: 1fr auto 110px 96px !important; }
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#F2F2F2' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="desktop-topbar-wrap">
            <Topbar title="Assignment" showBack backHref="/assignments" />
          </div>

          <div className="form-content" style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 760 }}>

            {/* Page heading */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 9, height: 9, background: '#10B981', borderRadius: '50%', flexShrink: 0 }} />
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Create Assignment</h2>
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Set up a new assignment for your students</p>
              </div>
            </div>

            {/* Step indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {[1, 2].map((s) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                    background: step >= s ? '#E8541A' : '#E5E7EB',
                    color: step >= s ? 'white' : '#9CA3AF',
                  }}>{s}</div>
                  <span style={{ fontSize: 12, color: step === s ? '#111827' : '#9CA3AF', fontWeight: step === s ? 600 : 400 }}>
                    {s === 1 ? 'Basic Info' : 'Questions'}
                  </span>
                  {s < 2 && <div style={{ width: 32, height: 2, background: step > 1 ? '#E8541A' : '#E5E7EB', borderRadius: 99 }} />}
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div style={{ height: 3, background: '#E5E7EB', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#E8541A', borderRadius: 99, transition: 'width 0.4s', width: isGenerating ? `${generationProgress}%` : step === 2 ? '50%' : '0%' }} />
            </div>

            {/* ── STEP 1 — Basic Info ── */}
            {step === 1 && (
              <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>Assignment Details</h3>
                  <p style={{ fontSize: 12, color: '#9CA3AF', margin: '4px 0 0' }}>Basic information about your assignment</p>
                </div>

                <div className="field-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>Assignment Title *</label>
                    <input placeholder="e.g. CBSE Grade 8 Science – Chapter 14"
                      value={form.title} onChange={(e) => setForm({ title: e.target.value })}
                      style={inputStyle(!!errors.title)} />
                    {errors.title && <span style={{ fontSize: 11, color: '#EF4444' }}>{errors.title}</span>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>Subject *</label>
                    <input placeholder="e.g. Science"
                      value={form.subject} onChange={(e) => setForm({ subject: e.target.value })}
                      style={inputStyle(!!errors.subject)} />
                    {errors.subject && <span style={{ fontSize: 11, color: '#EF4444' }}>{errors.subject}</span>}
                  </div>
                </div>

                <div className="field-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>Grade Level *</label>
                    <div style={{ position: 'relative' }}>
                      <select value={form.gradeLevel} onChange={(e) => setForm({ gradeLevel: e.target.value })}
                        style={{ ...inputStyle(!!errors.gradeLevel), appearance: 'none', paddingRight: 32, cursor: 'pointer' }}>
                        <option value="">Select Grade</option>
                        {GRADE_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                    </div>
                    {errors.gradeLevel && <span style={{ fontSize: 11, color: '#EF4444' }}>{errors.gradeLevel}</span>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>Due Date *</label>
                    <div style={{ position: 'relative' }}>
                      <input type="date" value={form.dueDate}
                          onChange={(e) => setForm({ dueDate: e.target.value })}
                          min={new Date().toISOString().split('T')[0]}
                          style={{ ...inputStyle(!!errors.dueDate), paddingRight: 36 }}
                          onFocus={e => (e.target.style.outline = 'none')}
                        />
                      <CalendarIcon size={16} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                    </div>
                    {errors.dueDate && <span style={{ fontSize: 11, color: '#EF4444' }}>{errors.dueDate}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2 — Questions & Upload ── */}
            {step === 2 && (
              <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>Questions & Material</h3>
                  <p style={{ fontSize: 12, color: '#9CA3AF', margin: '4px 0 0' }}>Configure question types and upload reference material</p>
                </div>

                {/* File upload */}
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  style={{
                    border: `1.5px dashed ${dragOver ? '#E8541A' : '#E5E7EB'}`,
                    background: dragOver ? '#FEF0EA' : 'transparent',
                    borderRadius: 10, padding: '24px 20px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 8, cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <input ref={fileRef} type="file" accept=".pdf,.txt,.jpg,.jpeg,.png" hidden
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  {form.file ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{form.file.name}</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setForm({ file: null }); }}
                        style={{ border: 'none', background: '#F2F2F2', cursor: 'pointer', borderRadius: 6, padding: 4, display: 'flex', color: '#6B7280' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={22} color="#9CA3AF" />
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>Choose a file or drag & drop it here</span>
                      <span style={{ fontSize: 12, color: '#9CA3AF' }}>JPEG, PNG, PDF up to 10MB</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                        style={{ background: 'white', border: '1px solid #E5E7EB', padding: '7px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer', marginTop: 4 }}>
                        Browse Files
                      </button>
                    </>
                  )}
                </div>
                <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', margin: '-8px 0 0' }}>Upload images of your preferred document/image</p>

                {/* Question type headers */}
                <div className="section-header" style={{ display: 'grid', gridTemplateColumns: '1fr auto 110px 96px', gap: 8, fontSize: 12, fontWeight: 600, color: '#6B7280', padding: '0 4px' }}>
                  <span>Question Type</span>
                  <span />
                  <span style={{ textAlign: 'center' }}>No. of Questions</span>
                  <span style={{ textAlign: 'center' }}>Marks</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {form.questionConfigs.map((qc, i) => (
                    <div key={i} className="config-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto 110px 96px', alignItems: 'center', gap: 8 }}>
                      <div style={{ position: 'relative' }}>
                        <select value={qc.type} onChange={(e) => updateConfig(i, { type: e.target.value as QuestionType })}
                          style={{ ...inputStyle(), appearance: 'none', paddingRight: 32, cursor: 'pointer' }}>
                          {QUESTION_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                      </div>
                      <button type="button" onClick={() => removeQuestionType(i)} disabled={form.questionConfigs.length === 1}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#9CA3AF', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', opacity: form.questionConfigs.length === 1 ? 0.3 : 1 }}>
                        <X size={14} />
                      </button>
                      <Counter value={qc.count} onChange={(v) => updateConfig(i, { count: v })} />
                      <Counter value={qc.marksEach} onChange={(v) => updateConfig(i, { marksEach: v })} />
                    </div>
                  ))}
                </div>

                {form.questionConfigs.length < 4 && (
                  <button type="button" onClick={addQuestionType} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: '#FEF0EA', color: '#E8541A', border: '1px dashed #E8541A',
                    borderRadius: 8, padding: '9px 14px', fontSize: 13, fontWeight: 500,
                    cursor: 'pointer', width: 'fit-content',
                  }}>
                    <Plus size={16} /> Add Question Type
                  </button>
                )}

                {errors.configs && <span style={{ fontSize: 11, color: '#EF4444' }}>{errors.configs}</span>}

                <div style={{ display: 'flex', gap: 20, justifyContent: 'flex-end', fontSize: 13, color: '#6B7280' }}>
                  <span>Total Questions : <strong style={{ color: '#111827' }}>{totalQuestions}</strong></span>
                  <span>Total Marks : <strong style={{ color: '#111827' }}>{totalMarks}</strong></span>
                </div>

                {/* Additional instructions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>
                    Additional Information <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(For better output)</span>
                  </label>
                  <textarea placeholder="e.g. Generate a question paper for 3 hour exam duration..."
                    value={form.additionalInstructions}
                    onChange={(e) => setForm({ additionalInstructions: e.target.value })}
                    rows={3}
                    style={{ ...inputStyle(), resize: 'vertical', minHeight: 80 }} />
                </div>

                {errors.submit && (
                  <div style={{ fontSize: 13, color: '#EF4444', background: '#FEE2E2', padding: '10px 14px', borderRadius: 8 }}>
                    {errors.submit}
                  </div>
                )}

                {isGenerating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#E8541A', fontWeight: 500 }}>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    {generationStatus === 'queued' ? 'Queued...' : `Generating... ${generationProgress}%`}
                  </div>
                )}
              </div>
            )}

            {/* ── ACTIONS ── */}
            <div style={{ display: 'flex', justifyContent: step === 1 ? 'flex-end' : 'space-between', paddingBottom: 32 }}>
              {step === 2 && (
                <button type="button" onClick={() => { setErrors({}); setStep(1); }} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px',
                  borderRadius: 99, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  background: 'white', color: '#111827', border: '1px solid #E5E7EB',
                }}>
                  ← Previous
                </button>
              )}
              {step === 1 && (
                <button type="button" onClick={() => { if (validateStep1()) setStep(2); }} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px',
                  borderRadius: 99, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  background: '#111827', color: 'white', border: 'none',
                }}>
                  Next →
                </button>
              )}
              {step === 2 && (
                <button type="button" onClick={handleSubmit} disabled={isGenerating} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px',
                  borderRadius: 99, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  background: '#111827', color: 'white', border: 'none',
                  opacity: isGenerating ? 0.5 : 1,
                }}>
                  {isGenerating ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</> : 'Generate →'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  input[type="date"]::-webkit-calendar-picker-indicator {
    opacity: 0;
    position: absolute;
    right: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
`}</style>
    </>
  );
}