"use client";

import { useState } from "react";
import { Link2, X } from "lucide-react";
import { Button } from "./Button";

interface LinkListInputProps {
  label: string;
  hint?: string;
  value: string[];
  onChange: (urls: string[]) => void;
  max: number;
  placeholder?: string;
  error?: string;
}

export function LinkListInput({
  label,
  hint,
  value,
  onChange,
  max,
  placeholder = "https://…",
  error,
}: LinkListInputProps) {
  const [draft, setDraft] = useState("");

  function addLink() {
    const trimmed = draft.trim();
    if (!trimmed || value.length >= max) return;
    onChange([...value, trimmed]);
    setDraft("");
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-zinc-700">
        {label} {hint && <span className="text-zinc-400 font-normal">{hint}</span>}
      </label>

      {value.length < max && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Link2 className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLink();
                }
              }}
              placeholder={placeholder}
              className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pr-3 pl-9 text-sm text-zinc-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={!draft.trim()}
            onClick={addLink}
            className="w-full min-h-[44px] sm:w-auto"
          >
            + Agregar
          </Button>
        </div>
      )}

      {value.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {value.map((url, i) => (
            <li
              key={`${url}-${i}`}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700"
            >
              <Link2 className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              <span className="flex-1 truncate">{url}</span>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                className="shrink-0 text-zinc-400 hover:text-rose-500"
                aria-label="Quitar link"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
