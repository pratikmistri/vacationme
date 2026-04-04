"use client";

import { useState } from "react";

export function ConsentCheckbox({
  onConsentChange,
}: {
  onConsentChange: (consented: boolean) => void;
}) {
  const [checked, setChecked] = useState(false);

  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          setChecked(e.target.checked);
          onConsentChange(e.target.checked);
        }}
        className="mt-1 h-4 w-4 rounded border-zinc-300 accent-zinc-900"
      />
      <span className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        I consent to my camera being used to capture a selfie. The image will
        only be used to generate your vacation reel and is not stored
        permanently.
      </span>
    </label>
  );
}
