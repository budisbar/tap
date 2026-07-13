import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { SmartphoneNfc, Star, Utensils, Wifi, Type, Trash2, MonitorSmartphone, Image as ImageIcon, Square, ArrowUp, ArrowDown } from 'lucide-react';

const COLORS = [
  { name: 'Obsidian', value: '#111111', textDark: false },
  { name: 'Pearl', value: '#f8f9fa', textDark: true },
  { name: 'Sapphire', value: '#0f172a', textDark: false },
  { name: 'Emerald', value: '#064e3b', textDark: false },
  { name: 'Ruby', value: '#7f1d1d', textDark: false },
  { name: 'Gold', value: '#b45309', textDark: true },
];

const ICONS = [
  { id: 'nfc', label: 'NFC', component: SmartphoneNfc },
  { id: 'review', label: 'Star', component: Star },
  { id: 'menu', label: 'Menu', component: Utensils },
  { id: 'wifi', label: 'Wi-Fi', component: Wifi },
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
}

interface CardState {
  bgColor: string;
  elements: ElementData[];
}

interface CardCustomizerProps {
  onBookMeeting?: () => void;
}

export default function CardCustomizer({ onBookMeeting }: CardCustomizerProps = {}) {
  const [orientation, setOrientation] = useState<Orientation>('horizontal');
  const [activeSide, setActiveSide] = useState<Side>('front');
  const [material, setMaterial] = useState('matte');
  
  const [cardData, setCardData] = useState<Record<Side, CardState>>({
    front: {
      bgColor: COLORS[0].value,
      elements: [
        { id: 'f1', type: 'icon', iconId: 'nfc', x: 20, y: 20, z: 1, color: '#ffffff', opacity: 1 },
        { id: 'f2', type: 'text', content: 'Your Business', x: 20, y: 120, z: 2, color: '#ffffff', fontSize: 24, opacity: 1 },
        { id: 'f3', type: 'text', content: 'Tap to connect', x: 20, y: 160, z: 3, color: '#aaaaaa', fontSize: 12, opacity: 1 }
      ]
    },
    back: {
      bgColor: COLORS[0].value,
      elements: [
        { id: 'b1', type: 'text', content: 'Scan or Tap', x: 100, y: 100, z: 1, color: '#ffffff', fontSize: 16, opacity: 1 }
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
      color: COLORS.find(c => c.value === currentSideState.bgColor)?.textDark ? '#111111' : '#ffffff',
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
      color: COLORS.find(c => c.value === currentSideState.bgColor)?.textDark ? '#111111' : '#ffffff',
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
      color: COLORS.find(c => c.value === currentSideState.bgColor)?.textDark ? '#111111' : '#ffffff',
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

  const handleDragEnd = (info: any, id: string) => {
    const el = currentSideState.elements.find(e => e.id === id);
    if (el) {
      updateElement(id, { x: el.x + info.offset.x, y: el.y + info.offset.y });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onBookMeeting) {
      onBookMeeting();
    } else {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
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
                 <button onClick={() => setOrientation('horizontal')} className={`p-2 rounded-lg transition-colors ${orientation === 'horizontal' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`} title="Horizontal">
                   <MonitorSmartphone className="w-5 h-5 rotate-90" />
                 </button>
                 <button onClick={() => setOrientation('vertical')} className={`p-2 rounded-lg transition-colors ${orientation === 'vertical' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`} title="Vertical">
                   <MonitorSmartphone className="w-5 h-5" />
                 </button>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="relative flex items-center justify-center p-8 md:p-12 bg-[#050505] rounded-3xl border border-white/5 overflow-hidden min-h-[500px]" onClick={() => setSelectedElementId(null)}>
               {/* Ambient Glow */}
               <div className="absolute inset-0 opacity-20 blur-[100px] transition-colors duration-700 pointer-events-none" style={{ backgroundColor: currentSideState.bgColor }}></div>
               
               {/* The Card */}
               <motion.div 
                 key={activeSide}
                 initial={{ scaleX: 0 }}
                 animate={{ scaleX: 1 }}
                 transition={{ duration: 0.4, ease: "easeInOut" }}
                 ref={containerRef}
                 className="relative rounded-2xl shadow-2xl transition-all duration-500 z-10 overflow-hidden shrink-0"
                 style={{
                   width: orientation === 'horizontal' ? '400px' : '252px',
                   height: orientation === 'horizontal' ? '252px' : '400px',
                   backgroundColor: currentSideState.bgColor,
                   boxShadow: material === 'glossy' ? 'inset 0 1px 1px rgba(255,255,255,0.4), 0 20px 40px rgba(0,0,0,0.5)' : 'inset 0 1px 1px rgba(255,255,255,0.1), 0 20px 40px rgba(0,0,0,0.5)',
                 }}
               >
                  {/* Glossy Overlay */}
                  {material === 'glossy' && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent pointer-events-none z-0"></div>
                  )}
                  
                  {/* Draggable Elements */}
                  {currentSideState.elements.map(el => {
                     const IconComp = el.type === 'icon' ? ICONS.find(i => i.id === el.iconId)?.component || SmartphoneNfc : null;
                     return (
                       <motion.div
                         key={el.id}
                         drag
                         dragMomentum={false}
                         dragConstraints={containerRef}
                         onDragEnd={(e, info) => handleDragEnd(info, el.id)}
                         onClick={(e) => { e.stopPropagation(); setSelectedElementId(el.id); }}
                         style={{ x: el.x, y: el.y, zIndex: el.z || 1, position: 'absolute', top: 0, left: 0, color: el.color, opacity: el.opacity ?? 1, rotate: el.rotation || 0 }}
                         className={`cursor-grab active:cursor-grabbing p-1 border ${selectedElementId === el.id ? 'border-indigo-400 border-dashed bg-white/5' : 'border-transparent'} hover:border-white/30 rounded transition-colors`}
                       >
                         {el.type === 'text' && (
                           <div style={{ fontSize: el.fontSize }} className="select-none leading-none font-serif whitespace-nowrap">
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
                  })}
               </motion.div>
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
                    <div className="flex flex-wrap gap-3">
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
                    </div>
                 </div>
                 
                 <div>
                   <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-4">Finish Material</h4>
                   <div className="flex space-x-2 bg-black/50 p-1 rounded-lg border border-white/10">
                      <button onClick={() => setMaterial('matte')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded transition-colors ${material === 'matte' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Matte</button>
                      <button onClick={() => setMaterial('glossy')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded transition-colors ${material === 'glossy' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Glossy</button>
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
                      <div className="grid grid-cols-4 gap-2">
                        {ICONS.map(i => (
                          <button 
                            key={i.id}
                            onClick={() => updateElement(selectedElement.id, { iconId: i.id })}
                            className={`p-3 rounded-xl flex items-center justify-center transition-all ${selectedElement.iconId === i.id ? 'bg-white/10 text-white border border-white/20' : 'bg-black/50 text-gray-500 border border-transparent hover:text-white hover:bg-white/5'}`}
                            title={i.label}
                          >
                            {i.component({ className: "w-6 h-6" })}
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
                      <div className="flex flex-wrap gap-2">
                         {['#ffffff', '#f8f9fa', '#d4d4d8', '#71717a', '#111111', '#0f172a', '#064e3b', '#7f1d1d', '#b45309'].map(c => (
                           <button
                              key={c}
                              onClick={() => updateElement(selectedElement.id, { color: c })}
                              className="w-8 h-8 rounded-full border border-white/20 transition-all"
                              style={{ backgroundColor: c, outline: selectedElement.color === c ? '2px solid white' : 'none', outlineOffset: '2px' }}
                           />
                         ))}
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
              <button onClick={handleSubmit} className="w-full px-8 py-5 bg-white text-black font-bold uppercase tracking-widest rounded-sm hover:bg-gray-200 transition-all">
                Submit Design
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
