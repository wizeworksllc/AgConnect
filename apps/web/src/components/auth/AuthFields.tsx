'use client';

import type { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export function Field({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return (
    <fieldset className="fieldset p-0">
      <legend className="fieldset-legend text-base-content/80 pb-1.5 pt-0 text-[13px] font-semibold">
        {label}
      </legend>
      {children}
      {help && <p className="label text-base-content/55 mt-0.5 whitespace-normal text-xs">{help}</p>}
    </fieldset>
  );
}

export function IconInput({ icon, children }: { icon: IconDefinition; children: ReactNode }) {
  return (
    <label className="input input-bordered flex w-full items-center gap-2">
      <FontAwesomeIcon icon={icon} className="text-base-content/40 h-3.5 w-3.5" />
      {children}
    </label>
  );
}

export function CodeInput({
  value,
  onChange,
  length = 6,
  numeric = true,
}: {
  value: string;
  onChange: (next: string) => void;
  length?: number;
  numeric?: boolean;
}) {
  return (
    <input
      type="text"
      inputMode={numeric ? 'numeric' : 'text'}
      autoComplete="one-time-code"
      pattern={numeric ? '[0-9]*' : undefined}
      maxLength={length}
      value={value}
      onChange={(e) => {
        const raw = numeric ? e.target.value.replace(/\D+/g, '') : e.target.value.replace(/\s+/g, '');
        onChange(raw.slice(0, length));
      }}
      className="input input-bordered w-full text-center font-mono text-xl tracking-[0.4em]"
      required
      autoFocus
    />
  );
}

export function AuthAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="alert alert-error alert-soft text-sm">
      {message}
    </div>
  );
}

export function SubmitButton({ busy, label }: { busy: boolean; label: string }) {
  return (
    <button type="submit" disabled={busy} className="btn btn-primary mt-1 w-full rounded-full font-semibold">
      {label}
    </button>
  );
}

export function OrDivider({ label }: { label: string }) {
  return (
    <div className="text-base-content/40 mb-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em]">
      <span className="bg-base-300 h-px flex-1" />
      {label}
      <span className="bg-base-300 h-px flex-1" />
    </div>
  );
}

export function TextLinkButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-base-content/60 hover:text-base-content text-xs no-underline"
    >
      {children}
    </button>
  );
}
