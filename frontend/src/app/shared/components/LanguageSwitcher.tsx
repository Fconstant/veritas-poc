"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/I18nContext";
import type { Locale } from "@/lib/i18n/types";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "default" | "compact";
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className,
  variant = "default",
}) => {
  const { locale, setLocale } = useI18n();

  const languages: { code: Locale; label: string }[] = [
    { code: "pt-BR", label: "Português" },
    { code: "en-US", label: "English" },
  ];

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <Globe className="w-4 h-4 text-gray-500" />
        <select
          value={locale}
          onChange={(e) => handleLanguageChange(e.target.value as Locale)}
          className="text-sm bg-transparent border-none outline-none cursor-pointer text-gray-700 hover:text-gray-900 transition-colors"
          aria-label="Select language"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg bg-white border border-gray-200",
        className
      )}
    >
      <Globe className="w-5 h-5 text-gray-500" />
      <div className="flex gap-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
              locale === lang.code
                ? "bg-[var(--purple-button)] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
            aria-label={`Switch to ${lang.label}`}
            aria-pressed={locale === lang.code}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
