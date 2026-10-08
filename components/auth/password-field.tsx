"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  placeholder?: string;
  minLength?: number;
  required?: boolean;
};

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
  minLength,
  required = true,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return <div>
    <label className="block text-sm font-semibold text-kaolin" htmlFor={id}>{label}</label>
    <div className="relative mt-2">
      <input
        autoComplete={autoComplete}
        className="min-h-12 w-full rounded-xl border border-gold/30 bg-earth px-4 pr-12 text-white outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
        id={id}
        minLength={minLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={visible ? "text" : "password"}
        value={value}
      />
      <button
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 grid min-w-12 place-items-center rounded-r-xl text-kaolin/65 transition hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        onClick={() => setVisible((current) => !current)}
        type="button"
      >
        {visible ? <EyeOff aria-hidden="true" size={19} /> : <Eye aria-hidden="true" size={19} />}
      </button>
    </div>
  </div>;
}
