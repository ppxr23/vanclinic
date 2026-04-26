import React from 'react';

const TEAL = '#1a9b8e'; const NAVY = '#1e3a5f';

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    actif:          { cls: 'green',  label: 'Actif' },
    confirme:       { cls: 'green',  label: 'Confirmé' },
    livre:          { cls: 'green',  label: 'Livré' },
    ok:             { cls: 'teal',   label: 'OK' },
    en_attente:     { cls: 'orange', label: 'En attente' },
    expedie:        { cls: 'teal',   label: 'Expédié' },
    en_preparation: { cls: 'navy',   label: 'En préparation' },
    inactif:        { cls: 'gray',   label: 'Inactif' },
    annule:         { cls: 'red',    label: 'Annulé' },
    low:            { cls: 'orange', label: 'Stock bas' },
    critical:       { cls: 'red',    label: 'Critique' },
  };
  const colors: Record<string, [string, string]> = {
    green:  ['#eaf5ea', '#27500a'], teal: ['#e8f5f3', '#0f6e65'],
    orange: ['#fff0e0', '#7a3800'], red:  ['#fff0f0', '#c53030'],
    gray:   ['#f0f0f0', '#555'],    navy: ['#e8eef5', '#1e3a5f'],
  };
  const cfg = map[status] || { cls: 'gray', label: status };
  const [bg, fg] = colors[cfg.cls] || ['#f0f0f0', '#555'];
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: bg, color: fg }}>{cfg.label}</span>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: 'white', border: '1px solid #d0e8e6', borderRadius: 14, padding: 20, ...style }}>{children}</div>;
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: NAVY }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: '#6b8a87', marginTop: 2 }}>{subtitle}</p>}
      </div>
      {children && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{children}</div>}
    </div>
  );
}

export function StatCard({ value, label, delta, deltaUp, accent }: { value: string; label: string; delta?: string; deltaUp?: boolean; accent?: string }) {
  return (
    <div style={{ background: 'white', border: '1px solid #d0e8e6', borderRadius: 14, padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: NAVY, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#6b8a87', marginTop: 4 }}>{label}</div>
      {delta && <div style={{ fontSize: 11, fontWeight: 600, marginTop: 8, color: deltaUp ? '#27ae60' : '#e53e3e' }}>{delta}</div>}
      <div style={{ position: 'absolute', top: -15, right: -15, width: 70, height: 70, borderRadius: '50%', background: accent || TEAL, opacity: 0.08 }} />
    </div>
  );
}

export function Btn({ children, onClick, variant = 'primary', size = 'md', style }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary'|'secondary'|'outline'|'danger'; size?: 'sm'|'md'; style?: React.CSSProperties }) {
  const variants = {
    primary:   { background: TEAL,    color: 'white',    border: 'none' },
    secondary: { background: '#e8f5f3', color: TEAL,    border: 'none' },
    outline:   { background: 'transparent', color: TEAL, border: `1.5px solid ${TEAL}` },
    danger:    { background: '#fff0f0', color: '#c53030', border: 'none' },
  };
  const sizes = {
    sm: { padding: '5px 12px', fontSize: 12, borderRadius: 8 },
    md: { padding: '8px 16px', fontSize: 13, borderRadius: 10 },
  };
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', ...variants[variant], ...sizes[size], ...style }}>
      {children}
    </button>
  );
}

export function Avatar({ name, color }: { name: string; color?: string }) {
  const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{ width: 32, height: 32, borderRadius: '50%', background: (color || TEAL) + '22', color: color || TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

export function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>{headers.map(h => <th key={h} style={{ fontSize: 11, fontWeight: 700, color: '#6b8a87', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '10px 14px', borderBottom: '1px solid #d0e8e6', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Tr({ children }: { children: React.ReactNode }) {
  const [hovered, setHovered] = React.useState(false);
  return <tr onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ background: hovered ? '#f0fffe' : 'transparent' }}>{children}</tr>;
}

export function Td({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return <td style={{ padding: '12px 14px', borderBottom: '1px solid #f0f7f6', fontSize: 13, color: NAVY, fontFamily: mono ? 'monospace' : 'inherit' }}>{children}</td>;
}

export function Tag({ children }: { children: React.ReactNode }) {
  return <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: '#e8f5f3', color: TEAL }}>{children}</span>;
}

export function BarChart({ data }: { data: { label: string; value: number; max: number; color?: string }[] }) {
  return (
    <div>
      {data.map(d => (
        <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: '#6b8a87', width: 100, flexShrink: 0 }}>{d.label}</span>
          <div style={{ flex: 1, height: 8, background: '#d0e8e6', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: 8, width: `${Math.min((d.value / d.max) * 100, 100)}%`, background: d.color || TEAL, borderRadius: 4 }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: NAVY, width: 40, textAlign: 'right' }}>{d.value}</span>
        </div>
      ))}
    </div>
  );
}

export function Grid({ cols = 4, children, style }: { cols?: number; children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16, ...style }}>{children}</div>;
}

export function Modal({ title, onClose, onConfirm, confirmLabel = 'Confirmer', children }: { title: string; onClose: () => void; onConfirm?: () => void; confirmLabel?: string; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #d0e8e6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b8a87', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid #d0e8e6', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Btn variant="secondary" onClick={onClose}>Annuler</Btn>
          {onConfirm && <Btn variant="primary" onClick={onConfirm}>{confirmLabel}</Btn>}
        </div>
      </div>
    </div>
  );
}

export function FormGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

export function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ width: '100%', height: 40, padding: '0 12px', border: '1.5px solid #d0e8e6', borderRadius: 10, fontFamily: 'inherit', fontSize: 13, color: NAVY, outline: 'none', background: 'white', ...props.style }} />;
}

export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={{ width: '100%', height: 40, padding: '0 12px', border: '1.5px solid #d0e8e6', borderRadius: 10, fontFamily: 'inherit', fontSize: 13, color: NAVY, outline: 'none', background: 'white', cursor: 'pointer', ...props.style }}>{children}</select>;
}
