'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MoreVertical, Search, SlidersHorizontal, Plus, Trash2, Eye } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { listAssignments, deleteAssignment } from '@/lib/api';
import type { AssignmentListItem } from '@/store';


function EmptyState() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', flex: 1, gap: 12,
      textAlign: 'center', padding: '60px 24px',
    }}>
      <div style={{ marginBottom: 8 }}>
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
          <circle cx="70" cy="70" r="60" fill="#EEEEF5" />
          <rect x="46" y="32" width="48" height="62" rx="4" fill="white" stroke="#E5E7EB" strokeWidth="1.5" />
          <path d="M54 48h32M54 56h24M54 64h18" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
          <circle cx="80" cy="82" r="14" fill="white" stroke="#E5E7EB" strokeWidth="1.5" />
          <circle cx="80" cy="82" r="6" fill="#EF4444" />
          <path d="M48 34L38 24" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M36 98l-5 5M41 103l-5-5" stroke="#E8541A" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="106" cy="42" r="3" fill="#6366F1" opacity="0.5" />
        </svg>
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>No assignments yet</h3>
      <p style={{ fontSize: 14, color: '#6B7280', maxWidth: 380, lineHeight: 1.6, margin: 0 }}>
        Create your first assignment to start collecting and grading student submissions.
        You can set up rubrics, define marking criteria, and let AI assist with grading.
      </p>
      <Link href="/assignments/new" style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: '#111827', color: 'white', borderRadius: 99,
        padding: '11px 24px', fontSize: 14, fontWeight: 600,
        textDecoration: 'none', marginTop: 8,
      }}
        onMouseEnter={e => (e.currentTarget.style.background = '#374151')}
        onMouseLeave={e => (e.currentTarget.style.background = '#111827')}
      >
        + Create Your First Assignment
      </Link>
    </div>
  );
}

function AssignmentCard({ item, onDelete }: { item: AssignmentListItem; onDelete: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const due = item.input?.dueDate ? new Date(item.input.dueDate).toLocaleDateString('en-GB').replace(/\//g, '-') : '—';
  const assigned = new Date(item.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-');
  const statusColor: Record<string, string> = {
    done: '#10B981', queued: '#F59E0B', processing: '#3B82F6', failed: '#EF4444',
  };

  return (
    <div style={{
      background: 'white', border: '1px solid #E5E7EB', borderRadius: 12,
      padding: 18, display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer',
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: '#111827', lineHeight: 1.4, margin: 0 }}>
          {item.input?.title || 'Untitled'}
        </h4>
        <div style={{ position: 'relative' }}>
          <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#9CA3AF', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}
            onClick={() => setMenuOpen(!menuOpen)}
            onMouseEnter={e => (e.currentTarget.style.background = '#F2F2F2')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div style={{ position: 'absolute', right: 0, top: 28, background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 10, minWidth: 150, overflow: 'hidden' }}>
              <Link href={`/assignments/${item._id}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', fontSize: 13, color: '#111827', textDecoration: 'none' }}
                onClick={() => setMenuOpen(false)}
                onMouseEnter={e => (e.currentTarget.style.background = '#F2F2F2')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Eye size={14} /> View Assignment
              </Link>
              <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', fontSize: 13, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'inherit' }}
                onClick={() => { onDelete(item._id); setMenuOpen(false); }}
                onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: statusColor[item.status] || '#9CA3AF' }} />
        <span style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'capitalize' }}>{item.status}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7280', borderTop: '1px solid #E5E7EB', paddingTop: 10, marginTop: 4 }}>
        <span><strong style={{ color: '#111827' }}>Assigned on</strong> : {assigned}</span>
        {item.status === 'done' && <span><strong style={{ color: '#111827' }}>Due</strong> : {due}</span>}
      </div>
    </div>
  );
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentListItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const data = await listAssignments(); setAssignments(data); } catch {}
      setLoading(false);
    })();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteAssignment(id);
    setAssignments((a) => a.filter((x) => x._id !== id));
  };

  const filtered = assignments.filter((a) =>
    a.input?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .desktop-topbar-wrap { display: none !important; }
          .assignments-content { padding: 72px 16px 80px !important; }
          .assignments-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#F2F2F2' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="desktop-topbar-wrap">
            <Topbar title="Assignment" />
          </div>

          <div className="assignments-content" style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>

            {!loading && assignments.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 13, color: '#E8541A', cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit' }}>
                  <SlidersHorizontal size={14} /> Filter By
                </button>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, padding: '7px 12px', color: '#9CA3AF' }}>
                  <Search size={14} />
                  <input placeholder="Search Assignment" value={search} onChange={(e) => setSearch(e.target.value)}
                    style={{ border: 'none', outline: 'none', flex: 1, fontSize: 13, background: 'transparent', color: '#111827', fontFamily: 'inherit' }}
                  />
                </div>
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#9CA3AF' }}>Loading...</div>
            ) : filtered.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="assignments-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {filtered.map((a) => <AssignmentCard key={a._id} item={a} onDelete={handleDelete} />)}
              </div>
            )}
          </div>

          {/* FAB — desktop center, mobile bottom-right */}
          {assignments.length > 0 && (
            <>
              <div className="fab-desktop" style={{ position: 'sticky', bottom: 24, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
                <Link href="/assignments/new" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#111827', color: 'white', borderRadius: 99, padding: '10px 20px', fontSize: 13, fontWeight: 600, textDecoration: 'none', pointerEvents: 'all', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
                  <Plus size={16} /> Create Assignment
                </Link>
              </div>
              <style>{`
                @media (max-width: 768px) {
                  .fab-desktop { display: none !important; }
                }
              `}</style>
            </>
          )}
        </div>
      </div>
    </>
  );
}