import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Check, Globe, MapPin, Leaf, ArrowRight } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  language: string;
  setLanguage: (lang: string) => void;
}

const LANGUAGES = [
  { code: 'en', native: 'English', flag: '🇬🇧' },
  { code: 'hi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', native: 'मराठी', flag: '🇮🇳' }
];

export function OnboardingModal({ isOpen, onComplete, language, setLanguage }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);

  const crops = ['Tomato', 'Potato', 'Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Mango', 'Banana'];

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('agro_onboarded', 'true');
    localStorage.setItem('agro_farmer_name', name);
    localStorage.setItem('agro_farmer_location', location);
    localStorage.setItem('agro_farmer_crops', JSON.stringify(selectedCrops));
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500 border border-border/50">
        
        {/* Header */}
        <div className="bg-primary px-6 py-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <img src="/logo.svg" alt="AgroTalk" className="w-10 h-10 object-contain" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome to AgroTalk</h2>
          <p className="text-primary-foreground/80 mt-1">Let's set up your farming profile</p>
        </div>

        {/* Steps */}
        <div className="p-6">
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className={cn("h-1.5 rounded-full transition-all duration-300", step === i ? "w-8 bg-primary" : step > i ? "w-4 bg-primary/40" : "w-4 bg-muted")} />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold flex items-center gap-2 text-foreground"><Globe className="text-primary" size={20} /> Select Language</h3>
              <div className="grid gap-2">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
                      language === lang.code ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-border hover:bg-muted"
                    )}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="flex-1 font-semibold text-lg">{lang.native}</span>
                    {language === lang.code && <Check className="text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold flex items-center gap-2 text-foreground"><MapPin className="text-primary" size={20} /> About You</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">Your Name (Optional)</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">Village / Location</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Coimbatore, Tamil Nadu"
                    className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all text-foreground"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold flex items-center gap-2 text-foreground"><Leaf className="text-primary" size={20} /> Your Crops</h3>
              <p className="text-sm text-muted-foreground">Select the crops you grow to get personalized advice.</p>
              <div className="flex flex-wrap gap-2">
                {crops.map(crop => {
                  const isSelected = selectedCrops.includes(crop);
                  return (
                    <button
                      key={crop}
                      onClick={() => {
                        if (isSelected) setSelectedCrops(selectedCrops.filter(c => c !== crop));
                        else setSelectedCrops([...selectedCrops, crop]);
                      }}
                      className={cn(
                        "px-4 py-2 rounded-full border text-sm font-semibold transition-all",
                        isSelected ? "bg-primary text-white border-primary" : "bg-background text-foreground border-border hover:border-primary/50"
                      )}
                    >
                      {crop}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-border flex justify-end">
            <button 
              onClick={handleNext}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-bold transition-all active:scale-95"
            >
              {step === 3 ? "Start AgroTalk" : "Continue"} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
