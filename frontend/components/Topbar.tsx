'use client';
import { Bell, ChevronDown, LayoutGrid, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface TopbarProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  actions?: React.ReactNode;
}

export default function Topbar({ title = 'Assignment', showBack, backHref = '/assignments', actions }: TopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div style={{ padding: '12px 16px 0 16px' }}>
      <header style={{
        height: 48, background: '#ffffff', borderRadius: 12,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {showBack && (
            <Link href={backHref} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: 6,
              color: '#6B7280', textDecoration: 'none',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F2F2F2')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <ArrowLeft size={16} />
            </Link>
          )}
          <LayoutGrid size={16} color="#9CA3AF" />
          <span style={{ fontSize: 13, color: '#9CA3AF' }}>{title}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {actions}

          {/* Notification bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              style={{
                position: 'relative', width: 32, height: 32,
                border: 'none', background: 'transparent', cursor: 'pointer',
                borderRadius: 8, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#6B7280',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F2F2F2')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Bell size={18} />
              <span style={{
                position: 'absolute', top: 6, right: 6,
                width: 7, height: 7, background: '#E8541A',
                borderRadius: '50%', border: '1.5px solid white',
              }} />
            </button>

            {notifOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 40,
                background: 'white', border: '1px solid #E5E7EB',
                borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                width: 300, zIndex: 100, overflow: 'hidden',
              }}>
                <div style={{
                  padding: '12px 16px', borderBottom: '1px solid #F3F4F6',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Notifications</span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, background: '#E8541A',
                    color: 'white', padding: '1px 7px', borderRadius: 99,
                  }}>1 new</span>
                </div>
                <div style={{
                  padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start',
                  borderBottom: '1px solid #F3F4F6', background: '#FFFBF9',
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#E8541A', flexShrink: 0, marginTop: 4,
                  }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', margin: 0 }}>
                      Question paper generated
                    </p>
                    <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>
                      Your assignment is ready to view
                    </p>
                    <p style={{ fontSize: 11, color: '#9CA3AF', margin: '4px 0 0' }}>Just now</p>
                  </div>
                </div>
                <div style={{ padding: '10px 16px', textAlign: 'center' }}>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>No more notifications</span>
                </div>
              </div>
            )}
          </div>

          {/* User */}
          <button style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 13, color: '#111827', fontWeight: 500,
            padding: '4px 8px', borderRadius: 8, fontFamily: 'inherit',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = '#F2F2F2')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{
              width: 28, height: 28, background: '#E8541A', borderRadius: '50%',
              color: 'white', fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              J
            </div>
            <span>John Doe</span>
            <ChevronDown size={14} />
          </button>
        </div>
      </header>
    </div>
  );
}