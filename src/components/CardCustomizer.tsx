import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue } from 'motion/react';
import { toPng } from 'html-to-image';
import { 
  SmartphoneNfc, Star, Utensils, Wifi, Type, Trash2, RectangleHorizontal, RectangleVertical, Image as ImageIcon, Square, ArrowUp, ArrowDown,
  Waves, Coffee, ShoppingBag, Heart, User, MapPin, Phone, Mail, Globe, Instagram, Facebook, Twitter, Linkedin, Github, MessageCircle, Music, Video, Camera, Anchor, Zap, Shield, Sun, Moon, Cloud, Droplet, Hexagon, Triangle, Circle
} from 'lucide-react';

const ContactlessIcon = ({ className, ...props }: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <g transform="translate(-4.5, 0)">
      <path d="M13 8.32a7.43 7.43 0 0 1 0 7.36" />
      <path d="M16.46 6.21a11.76 11.76 0 0 1 0 11.58" />
      <path d="M19.91 4.1a15.91 15.91 0 0 1 .01 15.8" />
    </g>
  </svg>
);

const COLORS = [
  { name: 'Obsidian', value: '#111111', textDark: false },
  { name: 'Pearl', value: '#f8f9fa', textDark: true },
  { name: 'Sapphire', value: '#0f172a', textDark: false },
  { name: 'Emerald', value: '#064e3b', textDark: false },
  { name: 'Ruby', value: '#7f1d1d', textDark: false },
  { name: 'Gold', value: '#b45309', textDark: true },
];

const ICONS = [
  { id: 'contactless', label: 'Tap', component: ContactlessIcon },
  { id: 'nfc', label: 'NFC', component: SmartphoneNfc },
  { id: 'review', label: 'Star', component: Star },
  { id: 'menu', label: 'Menu', component: Utensils },
  { id: 'wifi', label: 'Wi-Fi', component: Wifi },
  { id: 'waves', label: 'Waves', component: Waves },
  { id: 'coffee', label: 'Coffee', component: Coffee },
  { id: 'shop', label: 'Shop', component: ShoppingBag },
  { id: 'heart', label: 'Heart', component: Heart },
  { id: 'user', label: 'User', component: User },
  { id: 'map', label: 'Map', component: MapPin },
  { id: 'phone', label: 'Phone', component: Phone },
  { id: 'mail', label: 'Mail', component: Mail },
  { id: 'globe', label: 'Globe', component: Globe },
  { id: 'insta', label: 'Instagram', component: Instagram },
  { id: 'fb', label: 'Facebook', component: Facebook },
  { id: 'twitter', label: 'Twitter', component: Twitter },
  { id: 'linkedin', label: 'LinkedIn', component: Linkedin },
  { id: 'github', label: 'GitHub', component: Github },
  { id: 'msg', label: 'Message', component: MessageCircle },
  { id: 'music', label: 'Music', component: Music },
  { id: 'video', label: 'Video', component: Video },
  { id: 'camera', label: 'Camera', component: Camera },
  { id: 'anchor', label: 'Anchor', component: Anchor },
  { id: 'zap', label: 'Zap', component: Zap },
  { id: 'shield', label: 'Shield', component: Shield },
  { id: 'sun', label: 'Sun', component: Sun },
  { id: 'moon', label: 'Moon', component: Moon },
  { id: 'cloud', label: 'Cloud', component: Cloud },
  { id: 'drop', label: 'Drop', component: Droplet },
  { id: 'hex', label: 'Hexagon', component: Hexagon },
  { id: 'tri', label: 'Triangle', component: Triangle },
  { id: 'circle', label: 'Circle', component: Circle },
];

type Orientation = 'horizontal' | 'vertical';
type Side = 'front' | 'back';

interface ElementData {
  id: string;
  type: 'text' | 'icon' | 'image' | 'shape';
  x: number;
  y: number;
  z: number;
  content?: string;
  iconId?: string;
  imageUrl?: string;
  width?: number;
  height?: number;
  borderRadius?: number;
  opacity?: number;
  rotation?: number;
  color: string;
  fontSize?: number;
  fontFamily?: string;
}

interface CardState {
  bgColor: string;
  elements: ElementData[];
}

const DraggableElement = ({ el, isSelected, containerRef, onSelect, onUpdatePosition, IconComp }: any) => {
  const x = useMotionValue(el.x);
  const y = useMotionValue(el.y);

  useEffect(() => {
    x.set(el.x);
    y.set(el.y);
  }, [el.x, el.y, x, y]);

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={containerRef}
      onDragEnd={(e, info) => {
        onUpdatePosition(el.id, Math.round(x.get()), Math.round(y.get()));
      }}
      onClick={(e) => { e.stopPropagation(); onSelect(el.id); }}
      style={{
        x,
        y,
        zIndex: el.z || 1,
        position: 'absolute',
        top: 0,
        left: 0,
        color: el.color,
        opacity: el.opacity ?? 1,
        rotate: el.rotation || 0
      }}
      className={`cursor-grab active:cursor-grabbing p-1 border ${isSelected ? 'border-indigo-400 border-dashed bg-white/5' : 'border-transparent'} hover:border-white/30 rounded transition-colors`}
    >
      {el.type === 'text' && (
        <div style={{ fontSize: el.fontSize, fontFamily: el.fontFamily || 'var(--font-serif)' }} className="select-none leading-none whitespace-nowrap">
          {el.content}
        </div>
      )}
      {el.type === 'icon' && IconComp && (
        <div className="select-none">
          <IconComp className="w-10 h-10" />
        </div>
      )}
      {el.type === 'image' && el.imageUrl && (
        <img src={el.imageUrl} alt="Custom" style={{ width: el.width || 100, height: 'auto', pointerEvents: 'none' }} className="select-none" draggable={false} />
      )}
      {el.type === 'shape' && (
        <div style={{ width: el.width || 100, height: el.height || 100, backgroundColor: el.color, borderRadius: el.borderRadius || 0 }} className="select-none pointer-events-none" />
      )}
    </motion.div>
  );
};

interface CardCustomizerProps {
  onBookMeeting?: () => void;
}

export default function CardCustomizer({ onBookMeeting }: CardCustomizerProps = {}) {
  const [orientation, setOrientation] = useState<Orientation>('horizontal');
  const [activeSide, setActiveSide] = useState<Side>('front');
  
  const [cardData, setCardData] = useState<Record<Side, CardState>>({
    front: {
      bgColor: COLORS[0].value,
      elements: [
        { id: 'f1', type: 'text', content: 'Enjoyed your visit?', x: 90, y: 100, z: 1, color: '#ffffff', fontSize: 26, fontFamily: '"Caveat", cursive', opacity: 1 },
        { id: 'f2', type: 'text', content: 'Review by tapping', x: 125, y: 145, z: 2, color: '#ffffff', fontSize: 22, fontFamily: '"Caveat", cursive', opacity: 1 },
        { id: 'f3', type: 'icon', iconId: 'contactless', x: 330, y: 106, z: 3, color: '#ffffff', opacity: 1 },
        { id: 'f4', type: 'text', content: 'tap&con', x: 335, y: 220, z: 4, color: '#ffffff', fontSize: 16, fontFamily: '"Caveat", cursive', opacity: 1 }
      ]
    },
    back: {
      bgColor: COLORS[0].value,
      elements: [
        { id: 'b1', type: 'text', content: 'Your business name', x: 130, y: 110, z: 1, color: '#ffffff', fontSize: 26, fontFamily: '"Caveat", cursive', opacity: 1 }
      ]
    }
  });

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSideState = cardData[activeSide];

  const getNextZ = () => {
    return Math.max(0, ...currentSideState.elements.map(e => e.z || 0)) + 1;
  };

  const updateCurrentSide = (updates: Partial<CardState>) => {
    setCardData(prev => ({
      ...prev,
      [activeSide]: { ...prev[activeSide], ...updates }
    }));
  };

  const handleOrientationChange = (newOrientation: Orientation) => {
    if (newOrientation === orientation) return;
    
    const newWidth = newOrientation === 'horizontal' ? 400 : 252;
    const newHeight = newOrientation === 'horizontal' ? 252 : 400;
    
    setCardData(prev => {
      const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
      
      const updateElements = (elements: ElementData[]) => elements.map(el => ({
        ...el,
        x: clamp(el.x, 0, newWidth - 40),
        y: clamp(el.y, 0, newHeight - 40)
      }));

      return {
        front: { ...prev.front, elements: updateElements(prev.front.elements) },
        back: { ...prev.back, elements: updateElements(prev.back.elements) }
      };
    });
    setOrientation(newOrientation);
  };

  const updateElement = (id: string, updates: Partial<ElementData>) => {
    updateCurrentSide({
      elements: currentSideState.elements.map(el => el.id === id ? { ...el, ...updates } : el)
    });
  };

  const addText = () => {
    const newEl: ElementData = {
      id: Date.now().toString(),
      type: 'text',
      content: 'New Text',
      x: 100,
      y: 100,
      z: getNextZ(),
      color: (COLORS.find(c => c.value === currentSideState.bgColor)?.textDark ?? false) ? '#111111' : '#ffffff',
      fontSize: 20,
      opacity: 1
    };
    updateCurrentSide({ elements: [...currentSideState.elements, newEl] });
    setSelectedElementId(newEl.id);
  };

  const addIcon = (iconId: string) => {
    const newEl: ElementData = {
      id: Date.now().toString(),
      type: 'icon',
      iconId,
      x: 100,
      y: 100,
      z: getNextZ(),
      color: (COLORS.find(c => c.value === currentSideState.bgColor)?.textDark ?? false) ? '#111111' : '#ffffff',
      opacity: 1
    };
    updateCurrentSide({ elements: [...currentSideState.elements, newEl] });
    setSelectedElementId(newEl.id);
  };

  const addShape = () => {
    const newEl: ElementData = {
      id: Date.now().toString(),
      type: 'shape',
      x: 100,
      y: 100,
      z: getNextZ(),
      width: 100,
      height: 100,
      borderRadius: 0,
      color: (COLORS.find(c => c.value === currentSideState.bgColor)?.textDark ?? false) ? '#111111' : '#ffffff',
      opacity: 1
    };
    updateCurrentSide({ elements: [...currentSideState.elements, newEl] });
    setSelectedElementId(newEl.id);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const newEl: ElementData = {
        id: Date.now().toString(),
        type: 'image',
        imageUrl: event.target?.result as string,
        x: 50,
        y: 50,
        z: getNextZ(),
        width: 100,
        color: '#ffffff', // Ignored for image
        opacity: 1
      };
      updateCurrentSide({ elements: [...currentSideState.elements, newEl] });
      setSelectedElementId(newEl.id);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const moveZIndex = (id: string, direction: 'up' | 'down') => {
    const currentElements = [...currentSideState.elements].sort((a, b) => (a.z || 0) - (b.z || 0));
    const index = currentElements.findIndex(e => e.id === id);
    if (index === -1) return;

    if (direction === 'up' && index < currentElements.length - 1) {
      const temp = currentElements[index].z;
      currentElements[index].z = currentElements[index + 1].z;
      currentElements[index + 1].z = temp;
    } else if (direction === 'down' && index > 0) {
      const temp = currentElements[index].z;
      currentElements[index].z = currentElements[index - 1].z;
      currentElements[index - 1].z = temp;
    }
    
    updateCurrentSide({ elements: currentElements });
  };

  const removeElement = (id: string) => {
    updateCurrentSide({ elements: currentSideState.elements.filter(el => el.id !== id) });
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const clearCanvas = () => {
    updateCurrentSide({ elements: [] });
    setSelectedElementId(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedElementId) return;
      
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') {
        return;
      }

      const step = e.shiftKey ? 10 : 1;
      let dx = 0;
      let dy = 0;

      switch (e.key) {
        case 'ArrowUp': dy = -step; break;
        case 'ArrowDown': dy = step; break;
        case 'ArrowLeft': dx = -step; break;
        case 'ArrowRight': dx = step; break;
        default: return;
      }

      e.preventDefault();
      
      const el = currentSideState.elements.find(e => e.id === selectedElementId);
      if (el) {
        updateElement(selectedElementId, { x: el.x + dx, y: el.y + dy });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, currentSideState.elements]);

  const handleDownload = async () => {
    setSelectedElementId(null); // Clear selection borders

    // Small delay to ensure state updates (borders removed) before capturing
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const frontEl = document.getElementById('capture-front');
      const backEl = document.getElementById('capture-back');
      
      const options = {
        pixelRatio: 2,
        cacheBust: true,
      };
      
      if (frontEl) {
        const dataUrl = await toPng(frontEl, options);
        const link = document.createElement('a');
        link.download = 'tap-and-con-front.png';
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      if (backEl) {
        const dataUrl = await toPng(backEl, options);
        const link = document.createElement('a');
        link.download = 'tap-and-con-back.png';
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error: any) {
      console.error("Error generating image:", error);
      alert("Error generating your design: " + (error?.message || error));
    }
  };

  const selectedElement = currentSideState.elements.find(el => el.id === selectedElementId);

  return (
    <section id="customizer" className="relative bg-transparent border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.4em] mb-4 block">Design Studio</span>
          <h2 className="text-4xl md:text-5xl font-serif font-light text-white mb-6">Craft Your Connection</h2>
          <p className="text-lg text-gray-400 font-light">
            Fully customize your NFC card. Move elements, add text, design both sides, and choose your orientation.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Canvas Area */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            
            {/* Toolbar */}
            <div className="flex justify-between items-center bg-[#111] p-2 rounded-xl border border-white/10">
              <div className="flex space-x-1">
                 <button onClick={() => { setActiveSide('front'); setSelectedElementId(null); }} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${activeSide === 'front' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Front Side</button>
                 <button onClick={() => { setActiveSide('back'); setSelectedElementId(null); }} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${activeSide === 'back' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Back Side</button>
              </div>
              <div className="flex space-x-1">
                 <button onClick={() => handleOrientationChange('horizontal')} className={`p-2 rounded-lg transition-colors ${orientation === 'horizontal' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`} title="Horizontal">
                   <RectangleHorizontal className="w-5 h-5" />
                 </button>
                 <button onClick={() => handleOrientationChange('vertical')} className={`p-2 rounded-lg transition-colors ${orientation === 'vertical' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`} title="Vertical">
                   <RectangleVertical className="w-5 h-5" />
                 </button>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="relative flex items-center justify-center p-8 md:p-12 bg-[#050505] rounded-3xl border border-white/5 overflow-hidden min-h-[500px]" onClick={() => setSelectedElementId(null)}>
               {/* Ambient Glow */}
               <div className="absolute inset-0 opacity-20 blur-[100px] transition-colors duration-700 pointer-events-none" style={{ backgroundColor: currentSideState.bgColor }}></div>
               
               {/* The Card Wrapper for Stable Drag Constraints */}
               <div 
                 ref={containerRef}
                 className="relative shrink-0 perspective-1000"
                 style={{
                   width: orientation === 'horizontal' ? '400px' : '252px',
                   height: orientation === 'horizontal' ? '252px' : '400px',
                 }}
               >
                 {/* The Card */}
                 <motion.div 
                   key={`${activeSide}-${orientation}`}
                   initial={{ opacity: 0, rotateY: 90 }}
                   animate={{ opacity: 1, rotateY: 0 }}
                   transition={{ duration: 0.4, ease: "easeInOut" }}
                   className="absolute inset-0 rounded-2xl shadow-2xl transition-all duration-500 z-10 overflow-hidden"
                   style={{
                     backgroundColor: currentSideState.bgColor,
                     boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 20px 40px rgba(0,0,0,0.5)',
                   }}
                 >
                  
                  {/* Draggable Elements */}
                  {currentSideState.elements.map(el => {
                     const IconComp = el.type === 'icon' ? ICONS.find(i => i.id === el.iconId)?.component || SmartphoneNfc : null;
                     return (
                       <DraggableElement
                         key={el.id}
                         el={el}
                         isSelected={selectedElementId === el.id}
                         containerRef={containerRef}
                         onSelect={setSelectedElementId}
                         onUpdatePosition={(id: string, x: number, y: number) => updateElement(id, { x, y })}
                         IconComp={IconComp}
                       />
                     );
                  })}
               </motion.div>
               </div>
            </div>
            
            <p className="text-center text-xs text-gray-500 mt-4">
              Drag elements to position them. Click an element to edit its properties.
            </p>
          </div>

          {/* Properties Panel */}
          <div className="lg:col-span-5 flex flex-col bg-[#111] p-8 rounded-3xl border border-white/10 min-h-[500px]">
            
            {!selectedElementId ? (
              /* Global Settings */
              <div className="space-y-8 animate-in fade-in flex-1">
                 <div>
                    <h3 className="text-xl font-serif text-white mb-6">Card Settings</h3>
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-4">Background Color</h4>
                    <div className="flex flex-wrap gap-3 items-center">
                       {COLORS.map((c) => (
                          <button
                            key={c.name}
                            onClick={() => updateCurrentSide({ bgColor: c.value })}
                            className="w-10 h-10 rounded-full border-2 transition-all group relative"
                            style={{ backgroundColor: c.value, borderColor: currentSideState.bgColor === c.value ? '#fff' : 'transparent', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)' }}
                          >
                             <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#111] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none z-50">
                               {c.name}
                             </span>
                          </button>
                       ))}
                       <label className="w-10 h-10 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center cursor-pointer hover:border-white/60 transition-all overflow-hidden relative">
                         <div className="w-full h-full" style={{ backgroundColor: currentSideState.bgColor }}></div>
                         <input 
                           type="color" 
                           value={currentSideState.bgColor}
                           onChange={(e) => updateCurrentSide({ bgColor: e.target.value })}
                           className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                         />
                       </label>
                    </div>
                 </div>
                 
                 <div className="pt-6 border-t border-white/10">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-4">Add Elements</h4>
                    <div className="grid grid-cols-4 gap-2">
                       <button onClick={addText} className="flex flex-col items-center justify-center p-4 bg-black/50 hover:bg-white/5 border border-white/10 rounded-xl transition-all group">
                          <Type className="w-5 h-5 text-gray-400 mb-2 group-hover:text-white" />
                          <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400 group-hover:text-white">Text</span>
                       </button>
                       <button onClick={() => addIcon('nfc')} className="flex flex-col items-center justify-center p-4 bg-black/50 hover:bg-white/5 border border-white/10 rounded-xl transition-all group">
                          <SmartphoneNfc className="w-5 h-5 text-gray-400 mb-2 group-hover:text-white" />
                          <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400 group-hover:text-white">Icon</span>
                       </button>
                       <button onClick={addShape} className="flex flex-col items-center justify-center p-4 bg-black/50 hover:bg-white/5 border border-white/10 rounded-xl transition-all group">
                          <Square className="w-5 h-5 text-gray-400 mb-2 group-hover:text-white" />
                          <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400 group-hover:text-white">Shape</span>
                       </button>
                       <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-4 bg-black/50 hover:bg-white/5 border border-white/10 rounded-xl transition-all group relative overflow-hidden">
                          <ImageIcon className="w-5 h-5 text-gray-400 mb-2 group-hover:text-white" />
                          <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400 group-hover:text-white">Image</span>
                          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                       </button>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-white/10 mt-8">
                    <button onClick={clearCanvas} className="flex items-center text-red-400 hover:text-red-300 transition-colors text-[10px] uppercase tracking-widest font-bold px-4 py-2 bg-red-400/10 hover:bg-red-400/20 rounded-lg w-full justify-center">
                       <Trash2 className="w-4 h-4 mr-2" /> Start from Scratch
                    </button>
                 </div>
              </div>
            ) : (
              /* Element Editor */
              <div className="space-y-8 animate-in fade-in flex-1">
                 <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xl font-serif text-white">Edit Element</h3>
                   <div className="flex items-center space-x-2">
                     <button onClick={() => moveZIndex(selectedElement!.id, 'up')} className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors" title="Bring Forward"><ArrowUp className="w-4 h-4" /></button>
                     <button onClick={() => moveZIndex(selectedElement!.id, 'down')} className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors" title="Send Backward"><ArrowDown className="w-4 h-4" /></button>
                     <div className="w-px h-4 bg-white/20 mx-1"></div>
                     <button onClick={() => setSelectedElementId(null)} className="text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:text-white px-3 py-1 bg-white/5 rounded">Done</button>
                   </div>
                 </div>
                 
                 {selectedElement?.type === 'text' && (
                   <>
                     <div>
                       <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gray-500">Text Content</label>
                       <input 
                         type="text" 
                         value={selectedElement.content}
                         onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                         className="block w-full border-b border-white/20 pb-2 text-lg font-light focus:outline-none focus:border-white bg-transparent text-white" 
                       />
                     </div>
                     <div>
                       <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gray-500 mt-6 flex justify-between">
                         <span>Font Family</span>
                       </label>
                       <select 
                         value={selectedElement.fontFamily || 'var(--font-serif)'} 
                         onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                         className="w-full bg-black/50 border border-white/20 rounded p-2 text-white text-sm focus:outline-none focus:border-white"
                       >
                         <option value="var(--font-serif)">Default Serif</option>
                         <option value="var(--font-sans)">Default Sans</option>
                         <option value="'Playfair Display', serif">Playfair Display</option>
                         <option value="'Montserrat', sans-serif">Montserrat</option>
                         <option value="'Roboto', sans-serif">Roboto</option>
                         <option value="'Oswald', sans-serif">Oswald</option>
                         <option value="'Lora', serif">Lora</option>
                         <option value="'Anton', sans-serif">Anton</option>
                         <option value="'Caveat', cursive">Caveat</option>
                         <option value="'Cinzel', serif">Cinzel</option>
                         <option value="'Dancing Script', cursive">Dancing Script</option>
                         <option value="'Fira Sans', sans-serif">Fira Sans</option>
                         <option value="'Josefin Sans', sans-serif">Josefin Sans</option>
                         <option value="'Merriweather', serif">Merriweather</option>
                         <option value="'Nunito', sans-serif">Nunito</option>
                         <option value="'Pacifico', cursive">Pacifico</option>
                         <option value="'Ubuntu', sans-serif">Ubuntu</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gray-500 mt-6 flex justify-between">
                         <span>Font Size</span>
                         <span>{selectedElement.fontSize}px</span>
                       </label>
                       <input 
                         type="range" 
                         min="10" max="80" 
                         value={selectedElement.fontSize}
                         onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                         className="w-full accent-white"
                       />
                     </div>
                   </>
                 )}
                 
                  {selectedElement?.type === 'icon' && (
                   <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold mb-4 text-gray-500">Select Icon</label>
                      <div className="flex flex-wrap gap-2 h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {ICONS.map(({ id, label, component: IconComponent }) => (
                          <button 
                            key={id}
                            onClick={() => updateElement(selectedElement.id, { iconId: id })}
                            className={`p-3 rounded-xl flex items-center justify-center transition-all ${selectedElement.iconId === id ? 'bg-white/10 text-white border border-white/20' : 'bg-black/50 text-gray-500 border border-transparent hover:text-white hover:bg-white/5'}`}
                            title={label}
                          >
                            <IconComponent className="w-5 h-5" />
                          </button>
                        ))}
                      </div>
                   </div>
                 )}

                 {selectedElement?.type === 'image' && (
                    <div>
                       <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gray-500 mt-6 flex justify-between">
                         <span>Image Width</span>
                         <span>{selectedElement.width || 100}px</span>
                       </label>
                       <input 
                         type="range" 
                         min="20" max="300" 
                         value={selectedElement.width || 100}
                         onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) })}
                         className="w-full accent-white"
                       />
                    </div>
                 )}

                 {selectedElement?.type === 'shape' && (
                    <>
                       <div>
                         <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gray-500 mt-6 flex justify-between">
                           <span>Width</span>
                           <span>{selectedElement.width || 100}px</span>
                         </label>
                         <input 
                           type="range" 
                           min="20" max="400" 
                           value={selectedElement.width || 100}
                           onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) })}
                           className="w-full accent-white"
                         />
                       </div>
                       <div>
                         <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gray-500 mt-6 flex justify-between">
                           <span>Height</span>
                           <span>{selectedElement.height || 100}px</span>
                         </label>
                         <input 
                           type="range" 
                           min="20" max="400" 
                           value={selectedElement.height || 100}
                           onChange={(e) => updateElement(selectedElement.id, { height: parseInt(e.target.value) })}
                           className="w-full accent-white"
                         />
                       </div>
                       <div>
                         <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gray-500 mt-6 flex justify-between">
                           <span>Border Radius</span>
                           <span>{selectedElement.borderRadius || 0}px</span>
                         </label>
                         <input 
                           type="range" 
                           min="0" max="200" 
                           value={selectedElement.borderRadius || 0}
                           onChange={(e) => updateElement(selectedElement.id, { borderRadius: parseInt(e.target.value) })}
                           className="w-full accent-white"
                         />
                       </div>
                    </>
                 )}

                 {selectedElement?.type !== 'image' && (
                   <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold mb-4 text-gray-500 mt-6">Color</label>
                      <div className="flex flex-wrap gap-2 items-center">
                         {['#ffffff', '#f8f9fa', '#d4d4d8', '#71717a', '#111111', '#0f172a', '#064e3b', '#7f1d1d', '#b45309'].map(c => (
                           <button
                              key={c}
                              onClick={() => updateElement(selectedElement.id, { color: c })}
                              className="w-8 h-8 rounded-full border border-white/20 transition-all"
                              style={{ backgroundColor: c, outline: selectedElement.color === c ? '2px solid white' : 'none', outlineOffset: '2px' }}
                           />
                         ))}
                         <label className="w-8 h-8 rounded-full border border-dashed border-white/30 flex items-center justify-center cursor-pointer hover:border-white/60 transition-all overflow-hidden relative" style={{ outline: !['#ffffff', '#f8f9fa', '#d4d4d8', '#71717a', '#111111', '#0f172a', '#064e3b', '#7f1d1d', '#b45309'].includes(selectedElement.color) ? '2px solid white' : 'none', outlineOffset: '2px' }}>
                           <div className="w-full h-full" style={{ backgroundColor: selectedElement.color }}></div>
                           <input 
                             type="color" 
                             value={selectedElement.color}
                             onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                             className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                           />
                         </label>
                      </div>
                   </div>
                 )}

                 <div>
                   <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gray-500 mt-6 flex justify-between">
                     <span>Opacity</span>
                     <span>{Math.round((selectedElement?.opacity ?? 1) * 100)}%</span>
                   </label>
                   <input 
                     type="range" 
                     min="0" max="1" step="0.05"
                     value={selectedElement?.opacity ?? 1}
                     onChange={(e) => updateElement(selectedElement.id, { opacity: parseFloat(e.target.value) })}
                     className="w-full accent-white"
                   />
                 </div>

                 <div>
                   <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gray-500 mt-6 flex justify-between">
                     <span>Rotation</span>
                     <span>{selectedElement?.rotation || 0}°</span>
                   </label>
                   <input 
                     type="range" 
                     min="0" max="360" 
                     value={selectedElement?.rotation || 0}
                     onChange={(e) => updateElement(selectedElement.id, { rotation: parseInt(e.target.value) })}
                     className="w-full accent-white"
                   />
                 </div>

                 <div className="pt-6 border-t border-white/10 mt-8">
                    <button onClick={() => removeElement(selectedElement.id)} className="flex items-center text-red-400 hover:text-red-300 transition-colors text-[10px] uppercase tracking-widest font-bold px-4 py-2 bg-red-400/10 hover:bg-red-400/20 rounded-lg">
                       <Trash2 className="w-4 h-4 mr-2" /> Delete Element
                    </button>
                 </div>
              </div>
            )}

            <div className="pt-8 mt-auto border-t border-white/10">
              <button onClick={handleDownload} className="w-full px-8 py-5 bg-white text-black font-bold uppercase tracking-widest rounded-sm hover:bg-gray-200 transition-all flex items-center justify-center">
                Download Design
              </button>
            </div>
            
          </div>
        </div>
      </div>

      {/* Hidden Capture Area for Downloads */}
      <div className="fixed top-[-9999px] left-[-9999px] z-[-10] pointer-events-none opacity-100">
        {(['front', 'back'] as Side[]).map(side => (
          <div 
            key={side}
            id={`capture-${side}`} 
            className="relative rounded-2xl overflow-hidden" 
            style={{
                width: orientation === 'horizontal' ? '400px' : '252px',
                height: orientation === 'horizontal' ? '252px' : '400px',
                backgroundColor: cardData[side].bgColor,
            }}
          >
            {cardData[side].elements.map(el => {
                const IconComp = el.type === 'icon' ? ICONS.find(i => i.id === el.iconId)?.component || SmartphoneNfc : null;
                return (
                  <div key={el.id} style={{ transform: `translate(${el.x}px, ${el.y}px) rotate(${el.rotation || 0}deg)`, zIndex: el.z || 1, position: 'absolute', top: 0, left: 0, color: el.color, opacity: el.opacity ?? 1 }}>
                    {el.type === 'text' && <div style={{ fontSize: el.fontSize, fontFamily: el.fontFamily || 'var(--font-serif)' }} className="leading-none whitespace-nowrap">{el.content}</div>}
                    {el.type === 'icon' && IconComp && <div><IconComp className="w-10 h-10" /></div>}
                    {el.type === 'image' && el.imageUrl && <img src={el.imageUrl} alt="img" style={{ width: el.width || 100, height: 'auto' }} />}
                    {el.type === 'shape' && <div style={{ width: el.width || 100, height: el.height || 100, backgroundColor: el.color, borderRadius: el.borderRadius || 0 }} />}
                  </div>
                );
            })}
          </div>
        ))}
      </div>

    </section>
  );
}
