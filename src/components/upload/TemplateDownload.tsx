'use client';

import type { ReadingMode } from '@/types';
import { downloadTemplate } from '@/lib/templates';
import styles from './TemplateDownload.module.css';

interface TemplateDownloadProps {
  mode: ReadingMode | null;
}

export function TemplateDownload({ mode }: TemplateDownloadProps) {
  if (!mode) return null;

  return (
    <button
      id="download-template"
      className={`btn btn-ghost btn-sm ${styles.button}`}
      onClick={() => downloadTemplate(mode)}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      Download {mode} template
    </button>
  );
}
