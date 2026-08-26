import React from 'react';

export function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      width="10" 
      height="10" 
      viewBox="0 0 16 16" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <line x1="8" y1="1" x2="8" y2="15"></line>
      <line x1="1" y1="8" x2="15" y2="8"></line>
    </svg>
  );
}
