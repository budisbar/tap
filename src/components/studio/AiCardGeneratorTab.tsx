import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, Upload, X, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { User, dataService, DAILY_AI_LIMIT } from '../../lib/dataService';
import { AiCardPromptInput, analyzeLogo } from '../../lib/aiCardService';

interface AiCardGeneratorTabProps {
  user: User | null;
  onAuthClick: () => void;
  onGenerate: (input: AiCardPromptInput) => Promise<void>;
  isGenerating: boolean;
  hasGeneratedOnce: boolean;
  aiError?: { friendly: string; debug?: string } | null;
  onClearAiError?: () => void;
  isReplaceConfirmOpen?: boolean;
}

const PRESET_COLORS = [
  { name: 'White', hex: '#ffffff' },
  { name: 'Black', hex: '#18181b' },
  { name: 'Navy', hex: '#154360' },
  { name: 'Gold', hex: '#d4af37' },
  { name: 'Crimson', hex: '#8b0000' },
  { name: 'Emerald', hex: '#0b5345' },
  { name: 'Charcoal', hex: '#2c3e50' },
  { name: 'Cream', hex: '#f5f5f5' },
];

export default function AiCardGeneratorTab({
  user,
  onAuthClick,
  onGenerate,
  isGenerating,
  hasGeneratedOnce,
  aiError,
  onClearAiError,
  isReplaceConfirmOpen,
}: AiCardGeneratorTabProps) {
  // Form State
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [cardPurpose, setCardPurpose] = useState<'reviews' | 'business' | 'menu' | 'social'>('reviews');

  // Business Card Specific Fields
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactWebsite, setContactWebsite] = useState('');

  // Logo State
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoAspectRatio, setLogoAspectRatio] = useState<number>(1);
  const [logoColors, setLogoColors] = useState<string[]>([]);
  const [isAnalyzingLogo, setIsAnalyzingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Style, Material, Colors, Text & Language
  const [style, setStyle] = useState<'simple' | 'balanced' | 'creative'>('simple');
  const [material, setMaterial] = useState<'plastic' | 'metal' | 'wood'>('plastic');
  const [selectedColors, setSelectedColors] = useState<string[]>(['#ffffff', '#18181b']);
  const [customText, setCustomText] = useState('');
  const [language, setLanguage] = useState<'pt' | 'en'>('en');

  // Quota & UI State
  const [dailyUsage, setDailyUsage] = useState<number>(0);
  const [isLoadingQuota, setIsLoadingQuota] = useState(false);
  const [localError, setLocalError] = useState<{ friendly: string; debug?: string } | null>(null);

  // Active error displayed to user
  const currentError = aiError || localError;

  // Load Daily AI Quota
  const refreshQuota = async () => {
    if (!user) return;
    try {
      setIsLoadingQuota(true);
      const usage = await dataService.getDailyAiUsage(user.id);
      setDailyUsage(usage);
    } catch (err: any) {
      console.error('[Daily AI Quota Fetch Error]:', err);
      const errCode = err?.code || 'firestore/fetch-quota-error';
      setLocalError({
        friendly: 'Could not load your daily AI quota.',
        debug: `${errCode}: ${err?.message || String(err)}`,
      });
    } finally {
      setIsLoadingQuota(false);
    }
  };

  useEffect(() => {
    refreshQuota();
  }, [user]);

  const remainingToday = Math.max(0, DAILY_AI_LIMIT - dailyUsage);
  const isLimitReached = remainingToday <= 0;

  // Handle Logo Upload and Canvas Color Analysis
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingLogo(true);
    setLocalError(null);
    if (onClearAiError) onClearAiError();

    try {
      const analyzed = await analyzeLogo(file);
      setLogoFile(file);
      setLogoDataUrl(analyzed.dataUrl);
      setLogoAspectRatio(analyzed.aspectRatio);
      setLogoColors(analyzed.dominantColors);
    } catch (err: any) {
      console.error('Failed to read logo image:', err);
      setLocalError({
        friendly: 'Failed to read logo image.',
        debug: err?.message || String(err),
      });
    } finally {
      setIsAnalyzingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoDataUrl(null);
    setLogoColors([]);
    setLogoAspectRatio(1);
  };

  const toggleColor = (hex: string) => {
    if (selectedColors.includes(hex)) {
      setSelectedColors(selectedColors.filter((c) => c !== hex));
    } else {
      if (selectedColors.length >= 3) {
        setSelectedColors([...selectedColors.slice(1), hex]);
      } else {
        setSelectedColors([...selectedColors, hex]);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLocalError(null);
    if (onClearAiError) onClearAiError();

    // Check 1: User authentication
    if (!user) {
      const err = {
        friendly: 'Please sign in to generate a card with AI.',
        debug: 'AUTH_REQUIRED: You must be signed in to create an AI card.',
      };
      setLocalError(err);
      console.error('[AI Generator Early Return]:', err.debug);
      onAuthClick();
      return;
    }

    // Check 2: Quota loading
    if (isLoadingQuota) {
      const err = {
        friendly: 'Checking your daily generation limit. Please wait a moment...',
        debug: 'QUOTA_LOADING: Daily counter is currently being fetched from Firestore.',
      };
      setLocalError(err);
      console.error('[AI Generator Early Return]:', err.debug);
      return;
    }

    // Check 3: Daily limit
    if (isLimitReached) {
      const err = {
        friendly: "You've reached today's limit. Come back tomorrow.",
        debug: `LIMIT_REACHED: Daily usage is ${dailyUsage} of ${DAILY_AI_LIMIT} generations.`,
      };
      setLocalError(err);
      console.error('[AI Generator Early Return]:', err.debug);
      return;
    }

    // Check 4: Already generating
    if (isGenerating) {
      const err = {
        friendly: 'Card design is already generating. Please wait a moment...',
        debug: 'IN_PROGRESS: A generation request is already actively running.',
      };
      setLocalError(err);
      console.error('[AI Generator Early Return]:', err.debug);
      return;
    }

    // Check 5: Form validation - business name
    if (!businessName.trim()) {
      const err = {
        friendly: 'Please enter your business name.',
        debug: 'FORM_INVALID: Missing required field "Business Name".',
      };
      setLocalError(err);
      console.error('[AI Generator Early Return]:', err.debug);
      return;
    }

    // Check 6: Form validation - business type
    if (!businessType.trim()) {
      const err = {
        friendly: 'Please enter your type of business (e.g. Restaurant, Barbershop).',
        debug: 'FORM_INVALID: Missing required field "Type of Business".',
      };
      setLocalError(err);
      console.error('[AI Generator Early Return]:', err.debug);
      return;
    }

    // Check 7: Logo still analyzing
    if (isAnalyzingLogo) {
      const err = {
        friendly: 'Your logo is currently being analyzed. Please wait a moment...',
        debug: 'LOGO_ANALYZING: Logo color and aspect ratio extraction in progress.',
      };
      setLocalError(err);
      console.error('[AI Generator Early Return]:', err.debug);
      return;
    }

    const input: AiCardPromptInput = {
      businessName: businessName.trim(),
      businessType: businessType.trim(),
      cardPurpose,
      contactInfo:
        cardPurpose === 'business'
          ? {
              name: contactName.trim() || undefined,
              role: contactRole.trim() || undefined,
              phone: contactPhone.trim() || undefined,
              email: contactEmail.trim() || undefined,
              website: contactWebsite.trim() || undefined,
            }
          : undefined,
      logo: logoDataUrl
        ? {
            aspectRatio: logoAspectRatio,
            dominantColors: logoColors,
            dataUrl: logoDataUrl,
          }
        : undefined,
      style,
      material,
      preferredColors: material === 'plastic' ? selectedColors : undefined,
      customText: customText.trim() || undefined,
      language,
    };

    try {
      await onGenerate(input);
      await refreshQuota();
    } catch (err: any) {
      console.error('[AI Generator Submit Error]:', err);
      const rawMsg = err?.message || String(err || '');
      const errCode = err?.code || err?.name || 'AI/submit-error';
      let friendly = "We couldn't create your card. Please try again.";
      if (rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('quota') || rawMsg.includes('busy')) {
        friendly = 'The AI is busy right now. Please try again later.';
      } else if (rawMsg.includes('LIMIT_REACHED') || rawMsg.includes("today's limit")) {
        friendly = "You've reached today's limit. Come back tomorrow.";
      }
      const debug = rawMsg.includes(':') ? rawMsg : `${errCode}: ${rawMsg}`;
      setLocalError({ friendly, debug });
    }
  };

  if (!user) {
    return (
      <div className="py-12 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Sign in to use AI
        </h3>
        <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
          Sign in or create a free account to generate personalized, production-ready NFC card designs with Gemini.
        </p>
        <button
          type="button"
          onClick={onAuthClick}
          className="px-6 py-2.5 bg-white text-black font-bold text-xs rounded-full hover:bg-gray-200 transition-colors uppercase tracking-widest cursor-pointer shadow-lg"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Daily Limit Badge */}
      <div className="bg-[#111] border border-white/10 rounded-xl p-3 flex items-center justify-between text-xs">
        <span className="text-gray-400 font-medium">Daily AI generations</span>
        <span
          className={`font-mono font-bold ${
            isLimitReached ? 'text-red-400' : 'text-white'
          }`}
        >
          {remainingToday} of {DAILY_AI_LIMIT} left today
        </span>
      </div>

      {/* Replacement confirmation alert */}
      {isReplaceConfirmOpen && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start space-x-2 text-xs text-blue-400 leading-relaxed">
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Please confirm in the modal to replace your current card design.</span>
        </div>
      )}

      {/* Error Message with Real Debug Details */}
      {currentError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1.5">
          <div className="flex items-start space-x-2 text-xs text-red-400 leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-semibold">{currentError.friendly}</span>
          </div>
          {currentError.debug && (
            <div className="text-[10px] text-gray-500 font-mono break-all pl-6">
              {currentError.debug}
            </div>
          )}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Business Name */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest font-bold mb-1.5 text-gray-400">
            Business Name <span className="text-white">*</span>
          </label>
          <input
            type="text"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Lumina Osteria"
            className="w-full bg-[#111] border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-white transition-colors"
          />
        </div>

        {/* 2. Type of Business */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest font-bold mb-1.5 text-gray-400">
            Type of Business <span className="text-white">*</span>
          </label>
          <input
            type="text"
            required
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            placeholder="e.g. Restaurant, Barbershop, Hotel, Insurance"
            className="w-full bg-[#111] border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-white transition-colors"
          />
        </div>

        {/* 3. What is the card for? */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest font-bold mb-1.5 text-gray-400">
            What is the card for? <span className="text-white">*</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'reviews', label: 'Google reviews' },
              { id: 'business', label: 'Business card' },
              { id: 'menu', label: 'Digital menu' },
              { id: 'social', label: 'Social media' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setCardPurpose(opt.id as any)}
                className={`px-2.5 py-2 rounded-lg text-[11px] font-medium border text-left transition-colors cursor-pointer ${
                  cardPurpose === opt.id
                    ? 'bg-white text-black border-white font-semibold'
                    : 'bg-[#111] text-gray-300 border-white/10 hover:border-white/30'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. If Business Card: optional sub-fields */}
        {cardPurpose === 'business' && (
          <div className="bg-[#111] border border-white/10 rounded-xl p-3 space-y-2.5">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block">
              Contact Details (Optional)
            </span>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Your Name (e.g. Alex Rivera)"
              className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-white/40"
            />
            <input
              type="text"
              value={contactRole}
              onChange={(e) => setContactRole(e.target.value)}
              placeholder="Your Role / Title (e.g. Managing Director)"
              className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-white/40"
            />
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="Phone Number (e.g. +351 912 345 678)"
              className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-white/40"
            />
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Email Address (e.g. alex@company.com)"
              className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-white/40"
            />
            <input
              type="text"
              value={contactWebsite}
              onChange={(e) => setContactWebsite(e.target.value)}
              placeholder="Website (e.g. www.company.com)"
              className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-white/40"
            />
          </div>
        )}

        {/* 5. Logo Upload (Optional) */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest font-bold mb-1.5 text-gray-400">
            Logo Upload <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <input
            type="file"
            ref={logoInputRef}
            onChange={handleLogoUpload}
            accept="image/*"
            className="hidden"
          />

          {logoDataUrl ? (
            <div className="flex items-center justify-between p-2.5 bg-[#111] border border-white/15 rounded-lg">
              <div className="flex items-center space-x-3">
                <img
                  src={logoDataUrl}
                  alt="Logo preview"
                  className="w-8 h-8 object-contain rounded bg-black/40 border border-white/10 p-0.5"
                />
                <div className="text-[11px] text-gray-300">
                  <span className="block truncate max-w-[140px] font-medium">
                    {logoFile?.name || 'Uploaded logo'}
                  </span>
                  {logoColors.length > 0 && (
                    <div className="flex items-center space-x-1 mt-0.5">
                      {logoColors.map((c) => (
                        <div
                          key={c}
                          className="w-2.5 h-2.5 rounded-full border border-white/20"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="text-gray-400 hover:text-white p-1 cursor-pointer"
                title="Remove logo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={isAnalyzingLogo}
              onClick={() => logoInputRef.current?.click()}
              className="w-full py-2.5 px-3 bg-[#111] hover:bg-[#161616] border border-dashed border-white/20 rounded-lg text-xs text-gray-300 hover:text-white flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              {isAnalyzingLogo ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>Upload brand logo</span>
            </button>
          )}
        </div>

        {/* 6. Style */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest font-bold mb-1.5 text-gray-400">
            Style
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'simple', label: 'Simple' },
              { id: 'balanced', label: 'Balanced' },
              { id: 'creative', label: 'Creative' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStyle(s.id as any)}
                className={`py-2 px-1 rounded-lg text-[11px] font-medium text-center border transition-colors cursor-pointer ${
                  style === s.id
                    ? 'bg-white text-black border-white font-semibold'
                    : 'bg-[#111] text-gray-300 border-white/10 hover:border-white/30'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* 7. Material */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest font-bold mb-1.5 text-gray-400">
            Material
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'plastic', label: 'Plastic' },
              { id: 'metal', label: 'Metal' },
              { id: 'wood', label: 'Wood' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMaterial(m.id as any)}
                className={`py-2 px-1 rounded-lg text-[11px] font-medium text-center border transition-colors cursor-pointer ${
                  material === m.id
                    ? 'bg-white text-black border-white font-semibold'
                    : 'bg-[#111] text-gray-300 border-white/10 hover:border-white/30'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          {material !== 'plastic' && (
            <p className="text-[10px] text-gray-500 mt-1.5">
              Metal and wood designs are laser-engraved without colors.
            </p>
          )}
        </div>

        {/* 8. If Plastic: Up to 3 preferred colors */}
        {material === 'plastic' && (
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold mb-1.5 text-gray-400">
              Preferred Colours <span className="text-gray-500 font-normal">(up to 3)</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {PRESET_COLORS.map((color) => {
                const isSelected = selectedColors.includes(color.hex);
                return (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => toggleColor(color.hex)}
                    className={`h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer relative ${
                      isSelected ? 'border-white scale-105 shadow-md' : 'border-white/20 hover:border-white/50'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {isSelected && (
                      <Check
                        className={`w-3.5 h-3.5 ${
                          color.hex === '#ffffff' || color.hex === '#f5f5f5' ? 'text-black' : 'text-white'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 9. A line of text to include */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest font-bold mb-1.5 text-gray-400">
            Line of Text to Include <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="e.g. Crafted with passion since 2018"
            className="w-full bg-[#111] border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-white transition-colors"
          />
        </div>

        {/* 10. Language */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest font-bold mb-1.5 text-gray-400">
            Language of Card Text
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'en', label: 'English' },
              { id: 'pt', label: 'Portuguese' },
            ].map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setLanguage(lang.id as any)}
                className={`py-2 px-1 rounded-lg text-[11px] font-medium text-center border transition-colors cursor-pointer ${
                  language === lang.id
                    ? 'bg-white text-black border-white font-semibold'
                    : 'bg-[#111] text-gray-300 border-white/10 hover:border-white/30'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isGenerating}
            className={`w-full py-3.5 bg-white text-black rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center space-x-2 cursor-pointer ${
              isGenerating
                ? 'opacity-60 cursor-not-allowed bg-gray-300'
                : isLimitReached
                ? 'opacity-80 hover:bg-gray-200'
                : 'hover:bg-gray-200'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Designing your card...</span>
              </>
            ) : isLimitReached ? (
              <span>Limit reached for today</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Create my card</span>
              </>
            )}
          </button>
          <p className="text-[11px] text-gray-500 text-center mt-2">
            You can edit everything afterwards.
          </p>

          {/* Try another version button */}
          {hasGeneratedOnce && !isGenerating && !isLimitReached && (
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="w-full mt-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try another version</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
