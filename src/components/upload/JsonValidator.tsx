'use client';

import type { ValidationResult } from '@/lib/schemas';

interface JsonValidatorProps {
  result: ValidationResult | null;
  loading?: boolean;
}

export function JsonValidator({ result, loading }: JsonValidatorProps) {
  if (loading) {
    return (
      <div style={{
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
      }}>
        <div className="animate-spin" style={{ width: 18, height: 18, border: '2px solid var(--border)', borderTopColor: 'var(--brand-400)', borderRadius: '50%' }} />
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Validating JSON…</span>
      </div>
    );
  }

  if (!result) return null;

  if (result.valid) {
    return (
      <div style={{
        background: 'hsl(142 71% 45% / 0.1)',
        border: '1px solid hsl(142 71% 45% / 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
      }}>
        <span style={{ fontSize: '1.25rem' }}>✅</span>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--green-400)', fontSize: 'var(--text-sm)' }}>
            Valid JSON
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
            {result.itemCount} item{result.itemCount !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'hsl(0 84% 55% / 0.08)',
      border: '1px solid hsl(0 84% 55% / 0.3)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        marginBottom: result.errors.length > 0 ? 'var(--space-3)' : 0,
      }}>
        <span style={{ fontSize: '1.25rem' }}>❌</span>
        <div style={{ fontWeight: 600, color: 'var(--red-400)', fontSize: 'var(--text-sm)' }}>
          Invalid JSON — {result.errors.length} error{result.errors.length !== 1 ? 's' : ''}
        </div>
      </div>
      {result.errors.length > 0 && (
        <ul style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-1)',
          paddingLeft: 'var(--space-5)',
          margin: 0,
        }}>
          {result.errors.slice(0, 8).map((err, i) => (
            <li key={i} style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--red-400)',
              fontFamily: 'var(--font-mono)',
            }}>
              {err}
            </li>
          ))}
          {result.errors.length > 8 && (
            <li style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              …and {result.errors.length - 8} more errors
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
