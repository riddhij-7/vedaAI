'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, FileText, Wrench, BookOpen, Settings, LayoutGrid, Sparkles } from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { label: 'Home', icon: Home, href: '/' },
  { label: 'My Groups', icon: Users, href: '/groups' },
  { label: 'Assignments', icon: FileText, href: '/assignments' },
  { label: "AI Teacher's Toolkit", icon: Wrench, href: '/toolkit' },
  { label: 'My Library', icon: BookOpen, href: '/library', badge: 32 },
];

const BOTTOM_NAV = [
  { label: 'Home', icon: Home, href: '/' },
  { label: 'Assignments', icon: FileText, href: '/assignments' },
  { label: 'Library', icon: BookOpen, href: '/library' },
  { label: 'AI Toolkit', icon: Sparkles, href: '/toolkit' },
];

export default function Sidebar() {
  const path = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeHref =
    NAV.find((n) => n.href !== '/' && path.startsWith(n.href))?.href ??
    (path === '/' ? '/' : null);

  const isActive = (href: string) =>
    href !== '/' ? path.startsWith(href) : path === '/';

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside style={{
        width: 220, minHeight: '100vh', background: '#ffffff',
        display: 'flex', flexDirection: 'column', padding: '20px 12px',
        borderRight: '1px solid #E5E7EB', flexShrink: 0,
      }} className="desktop-sidebar">

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px', marginBottom: 20 }}>
        <img
          src="/logo.png"
          alt="VedaAI Logo"
          style={{
            width: 120,
            height: 'auto',
            objectFit: 'contain',
          }}
        />
      </div>

        {/* CTA */}
        <Link href="/assignments/new" style={{
  display: 'flex', alignItems: 'center', gap: 6,
  background: '#282929', color: '#fbfcfe', borderRadius: 99,
  padding: '10px 16px', fontSize: 13, fontWeight: 600,
  textDecoration: 'none', marginBottom: 24,
  border: '1.5px solid #E8541A',
}}
  onMouseEnter={e => (e.currentTarget.style.background = '#373737')}
  onMouseLeave={e => (e.currentTarget.style.background = '#282929')}
>
  ✦ Create Assignment
</Link>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {NAV.map(({ label, icon: Icon, href, badge }) => {
            const active = activeHref === href;
            return (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 8, fontSize: 13,
                color: active ? '#111827' : '#6B7280',
                background: active ? '#F2F2F2' : 'transparent',
                fontWeight: active ? 500 : 400, textDecoration: 'none',
              }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#F2F2F2'; e.currentTarget.style.color = '#111827'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7280'; } }}
              >
                <Icon size={16} />
                <span>{label}</span>
                {badge && (
                  <span style={{
                    marginLeft: 'auto', background: '#E8541A', color: 'white',
                    fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 99,
                  }}>{badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Link href="/settings" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 10px', borderRadius: 8, fontSize: 13,
            color: '#6B7280', textDecoration: 'none',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F2F2F2'; e.currentTarget.style.color = '#111827'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7280'; }}
          >
            <Settings size={16} />
            <span>Settings</span>
          </Link>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: 10, background: '#F2F2F2', borderRadius: 10, marginTop: 8,
          }}>
            <div style={{
              width: 34, height: 34, background: '#E8541A', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0,
            }}>D</div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>Delhi Public School</p>
              <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>Bokaro Steel City</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MOBILE TOPBAR ── */}
      <div className="mobile-topbar" style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0,
        height: 56, background: 'white', zIndex: 50,
        borderBottom: '1px solid #E5E7EB',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px',
      }}>
        {/* Logo */}
       <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px', marginBottom: 20 }}>
      <img
        src="/logo.png"
        alt="VedaAI Logo"
        style={{
          width: 120,
          height: 'auto',
          objectFit: 'contain',
        }}
      />
      </div>

        {/* Right icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={{
            position: 'relative', width: 32, height: 32, border: 'none',
            background: 'transparent', cursor: 'pointer', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span style={{
              position: 'absolute', top: 5, right: 5, width: 7, height: 7,
              background: '#E8541A', borderRadius: '50%', border: '1.5px solid white',
            }} />
          </button>

          <div style={{
            width: 30, height: 30, background: '#E8541A', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: 13,
          }}>J</div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              width: 32, height: 32, border: 'none', background: 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#111827', borderRadius: 8,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── MOBILE SLIDE-OUT MENU ── */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
        }}>
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }}
          />
          {/* Drawer */}
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0, width: 260,
            background: 'white', padding: '20px 12px',
            display: 'flex', flexDirection: 'column', gap: 2,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px', marginBottom: 20 }}>
              <div style={{ width: 28, height: 28, background: '#FEF0EA', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#E8541A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>VedaAI</span>
            </div>
            {NAV.map(({ label, icon: Icon, href, badge }) => (
              <Link key={href} href={href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8, fontSize: 14,
                  color: isActive(href) ? '#111827' : '#6B7280',
                  background: isActive(href) ? '#F2F2F2' : 'transparent',
                  fontWeight: isActive(href) ? 500 : 400, textDecoration: 'none',
                }}>
                <Icon size={17} />
                <span>{label}</span>
                {badge && <span style={{ marginLeft: 'auto', background: '#E8541A', color: 'white', fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 99 }}>{badge}</span>}
              </Link>
            ))}
            <div style={{ marginTop: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: '#F2F2F2', borderRadius: 10 }}>
                <div style={{ width: 32, height: 32, background: '#E8541A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13 }}>D</div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>Delhi Public School</p>
                  <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>Bokaro Steel City</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="mobile-bottom-nav" style={{
            display: 'none', position: 'fixed', bottom: 16, left: 16, right: 16,
            height: 60, background: '#111827', zIndex: 50,
            alignItems: 'center', justifyContent: 'space-around', padding: '0 8px',
            borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          }}>
        {BOTTOM_NAV.map(({ label, icon: Icon, href }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, padding: '6px 16px', borderRadius: 8, textDecoration: 'none',
              color: active ? 'white' : '#9CA3AF',
            }}>
              <Icon size={18} />
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── RESPONSIVE CSS ── */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-topbar { display: flex !important; }
          .mobile-bottom-nav { display: flex !important; }
        }
      `}</style>
    </>
  );
}