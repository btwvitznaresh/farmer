import { useEffect, useState } from "react";
import { Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (code: string) => void;
}

export function LanguageSelector({
  selectedLanguage,
  onLanguageChange,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const currentLang = languages.find((l) => l.code === selectedLanguage) || languages[0];
  const handleLanguageChange = (rawCode: string) => {
    const next = (rawCode || "").trim().toLowerCase();
    const valid = languages.some((l) => l.code === next) ? next : "en";
    onLanguageChange(valid);
  };

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 250);
    return () => clearTimeout(timer);
  }, [selectedLanguage]);

  return (
    <div className={cn("relative transition-opacity duration-300", isAnimating && "opacity-70")}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-center p-2 rounded-full",
          "bg-card border border-border/50 shadow-apple-sm",
          "hover:bg-muted transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary/30",
          "w-10 h-10"
        )}
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <Globe size={20} className="text-muted-foreground" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-50 w-56 bg-card rounded-xl border border-border shadow-apple-lg animate-scale-in">
            <div className="p-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    handleLanguageChange(lang.code);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left",
                    "hover:bg-muted transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-primary/30",
                    selectedLanguage === lang.code && "bg-primary/10"
                  )}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="flex-1">
                    <p className="font-medium">{lang.nativeName}</p>
                    <p className="text-sm text-muted-foreground">{lang.name}</p>
                  </div>
                  {selectedLanguage === lang.code && (
                    <Check size={20} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
