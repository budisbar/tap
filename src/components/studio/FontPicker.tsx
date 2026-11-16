import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { FONTS, loadAllGoogleFonts } from './customizerData';

interface FontPickerProps {
  value: string;
  onChange: (val: string) => void;
}

export default function FontPicker({ value, onChange }: FontPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentFontName = FONTS.find(f => f.value === value)?.name || 'Default Sans';

  // Trigger font loading when the picker is first opened
  useEffect(() => {
    if (isOpen) {
      loadAllGoogleFonts();
    }
  }, [isOpen]);

  return (
    <div className="relative border-r border-white/20 pr-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-white text-xs bg-transparent hover:bg-white/10 px-2 py-1 rounded transition-colors"
      >
        <span style={{ fontFamily: value }} className="truncate max-w-[100px]">{currentFontName}</span>
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-0 mt-2 w-56 bg-[#1a1a1a] border border-white/20 rounded-xl shadow-2xl z-50 max-h-[400px] overflow-y-auto custom-scrollbar flex flex-col py-2">
            <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest sticky top-0 bg-[#1a1a1a]/90 backdrop-blur-sm">
              90+ Fonts Available
            </div>
            {FONTS.map(font => (
              <button
                key={font.value}
                onClick={() => { onChange(font.value); setIsOpen(false); }}
                className={`text-left px-4 py-2.5 text-[16px] hover:bg-white/10 transition-colors ${value === font.value ? 'bg-white/5 text-white' : 'text-gray-300'}`}
                style={{ fontFamily: font.value }}
              >
                {font.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
