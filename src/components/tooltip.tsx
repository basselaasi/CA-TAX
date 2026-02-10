import { ReactNode } from 'react';

export function Tip({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs text-slate-500">💡 {children}</p>;
}
