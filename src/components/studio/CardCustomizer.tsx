import React, { useState, useRef, useEffect } from 'react';
import Preview3DModal from '../modals/Preview3DModal';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'motion/react';
import { toPng, toJpeg } from 'html-to-image';
import {
  SmartphoneNfc, Type, Trash2, RectangleHorizontal, RectangleVertical, Image as ImageIcon, ArrowUp, ArrowDown,
  ChevronDown, ChevronRight, Shapes, LayoutTemplate, Palette, PenTool, Eraser, Highlighter, Layers,
  Check, X, Copy, Save, Box
} from 'lucide-react';
import { db, User as DbUser, ImageAsset } from '../../lib/mockDb';
import { useSearchParams } from 'react-router-dom';
import {
  CANVA_COLORS,
  ICONS,
  TEMPLATES,
  MATERIALS,
  Orientation,
  Side,
  ElementData,
  CardState
} from './customizerData';
import FontPicker from './FontPicker';
import DraggableElement from './DraggableElement';

interface CardCustomizerProps {
  onBookMeeting?: () => void;
}

export default function CardCustomizer({ onBookMeeting }: CardCustomizerProps = {}) {
  const [user, setUser] = useState<DbUser | null>(null);
  const [userImages, setUserImages] = useState<ImageAsset[]>([]);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const currentUser = db.getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      db.getImagesByUser(currentUser.id).then(setUserImages);
      
      const projectId = searchParams.get('project');
      const urlType = searchParams.get('type');
      
      if (projectId) {
        db.getProjectById(currentUser.id, projectId).then(project => {
          if (project) {
            setCardData(project.data);
            setSaveProjectName(project.name);
            if (project.productType === 'board') {
              setProductType('board');
              setOrientation('vertical');
            }
          }
        });
      } else if (urlType === 'board') {
        setProductType('board');
        setOrientation('vertical');
      }
    }
  }, [searchParams]);

  const [productType, setProductType] = useState<'card' | 'board'>('card');
  const [orientation, setOrientation] = useState<Orientation>('horizontal');
  const [activeSide, setActiveSide] = useState<Side>('front');

  const [isPreview3DOpen, setIsPreview3DOpen] = useState(false);
  const [previewFrontImage, setPreviewFrontImage] = useState('');
  const [previewBackImage, setPreviewBackImage] = useState('');
  const [isPreviewGenerating, setIsPreviewGenerating] = useState(false);

  const [cardData, setCardData] = useState<Record<Side, CardState>>({
    front: { bgColor: '#ffffff', elements: [] },
    back: { bgColor: '#ffffff', elements: [] }
  });

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<ElementData | null>(null);
  const [activeTab, setActiveTab] = useState<'templates' | 'material' | 'text' | 'elements' | 'image' | 'background' | 'draw'>('templates');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('metal-silver');
  const [materialCategoryFilter, setMaterialCategoryFilter] = useState<'all' | 'metal' | 'plastic' | 'wood'>('all');
  const [isShapesOpen, setIsShapesOpen] = useState(false);
  const [isIconsOpen, setIsIconsOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number, y: number }[]>([]);
  const [drawColor, setDrawColor] = useState('#ffffff');
  const [drawThickness, setDrawThickness] = useState(4);
  const [drawTool, setDrawTool] = useState<'pen' | 'marker' | 'eraser'>('pen');
  const [snapGuides, setSnapGuides] = useState<{ x: number | null, y: number | null }>({ x: null, y: null });
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5, active: false });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTab === 'draw') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y, active: true });
  };

  const handleCardMouseLeave = () => {
    setMousePos({ x: 0.5, y: 0.5, active: false });
  };

  const isEraser = drawTool === 'eraser';
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSideState = cardData[activeSide];
  const selectedMaterial = productType === 'board' ? null : (MATERIALS.find(m => m.id === selectedMaterialId) || MATERIALS[0]);

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

    const newWidth = newOrientation === 'horizontal' ? 428 : 270;
    const newHeight = newOrientation === 'horizontal' ? 270 : 428;

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
      color: '#ffffff',
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
      color: '#ffffff',
      opacity: 1
    };
    updateCurrentSide({ elements: [...currentSideState.elements, newEl] });
    setSelectedElementId(newEl.id);
  };

  const addElementShape = (width: number, height: number, borderRadius: number | string) => {
    const newEl: ElementData = {
      id: Date.now().toString(),
      type: 'shape',
      x: 100,
      y: 100,
      z: getNextZ(),
      width,
      height,
      borderRadius: Number(borderRadius) || 0,
      color: '#ffffff',
      opacity: 1
    };
    updateCurrentSide({ elements: [...currentSideState.elements, newEl] });
    setSelectedElementId(newEl.id);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      const newEl: ElementData = {
        id: Date.now().toString(),
        type: 'image',
        imageUrl: dataUrl,
        x: 50,
        y: 50,
        z: getNextZ(),
        width: 100,
        color: '#ffffff', // Ignored for image
        opacity: 1
      };
      updateCurrentSide({ elements: [...currentSideState.elements, newEl] });
      setSelectedElementId(newEl.id);

      // Save to cloud if logged in
      if (user) {
        const savedImage = await db.saveImage(user.id, dataUrl);
        setUserImages(prev => [savedImage, ...prev]);
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveProjectName, setSaveProjectName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const executeSave = async (name: string) => {
    if (!user || !name.trim()) return;
    setIsSaving(true);
    try {
      let previewUrl = undefined;
      const frontEl = document.getElementById('capture-front');
      if (frontEl) {
        previewUrl = await toJpeg(frontEl, { quality: 0.9, pixelRatio: 2, cacheBust: true });
      }
      const projectId = searchParams.get('project');
      if (projectId) {
        await db.updateProject(user.id, projectId, name.trim(), cardData, previewUrl, productType);
      } else {
        await db.saveProject(user.id, name.trim(), cardData, previewUrl, productType);
      }
      setIsSaveModalOpen(false);
    } catch (err: any) {
      alert('Failed to save project: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProjectClick = () => {
    if (!user) {
      alert('Please sign in to save designs to your account.');
      return;
    }
    const projectId = searchParams.get('project');
    if (projectId && saveProjectName.trim()) {
      executeSave(saveProjectName);
    } else {
      setSaveProjectName('');
      setIsSaveModalOpen(true);
    }
  };

  const confirmSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeSave(saveProjectName);
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
    updateCurrentSide({
      elements: currentSideState.elements.filter(el => el.id !== id)
    });
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const duplicateElement = (elId: string) => {
    const elToCopy = currentSideState.elements.find(e => e.id === elId);
    if (!elToCopy) return;
    const newId = Date.now().toString();
    const newEl = {
      ...elToCopy,
      id: newId,
      x: elToCopy.x + 20,
      y: elToCopy.y + 20,
      z: getNextZ()
    };
    updateCurrentSide({
      elements: [...currentSideState.elements, newEl]
    });
    setSelectedElementId(newId);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT' || (document.activeElement as HTMLElement)?.isContentEditable) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (selectedElementId) {
          const el = currentSideState.elements.find(e => e.id === selectedElementId);
          if (el) setClipboard(el);
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        if (clipboard) {
          const newId = Date.now().toString();
          const newEl = {
            ...clipboard,
            id: newId,
            x: clipboard.x + 20,
            y: clipboard.y + 20,
            z: getNextZ()
          };
          updateCurrentSide({
            elements: [...currentSideState.elements, newEl]
          });
          setSelectedElementId(newId);
        }
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) removeElement(selectedElementId);
        return;
      }

      if (!selectedElementId) return;

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
  }, [selectedElementId, currentSideState.elements, clipboard]);

  const handleDownload = async () => {
    setSelectedElementId(null); // Clear selection borders

    // Small delay to ensure state updates (borders removed) before capturing
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const frontEl = document.getElementById('capture-front');
      const backEl = document.getElementById('capture-back');

      // Create a new jsPDF instance (standard credit card size: 85.6mm x 53.98mm, board: 100x150mm)
      // If horizontal, landscape. If vertical, portrait.
      const pdfFormat = productType === 'board' ? [100, 150] : [85.6, 53.98];
      const pdf = new jsPDF({
        orientation: productType === 'board' ? 'portrait' : (orientation === 'horizontal' ? 'landscape' : 'portrait'),
        unit: 'mm',
        format: pdfFormat
      });

      const options = {
        pixelRatio: 3,
        cacheBust: true,
      };

      if (frontEl) {
        const dataUrl = await toPng(frontEl, options);
        // addImage(imageData, format, x, y, width, height)
        if (productType === 'board') {
          pdf.addImage(dataUrl, 'PNG', 0, 0, 100, 150);
        } else if (orientation === 'horizontal') {
          pdf.addImage(dataUrl, 'PNG', 0, 0, 85.6, 53.98);
        } else {
          pdf.addImage(dataUrl, 'PNG', 0, 0, 53.98, 85.6);
        }
      }

      if (backEl && productType !== 'board') {
        const dataUrl = await toPng(backEl, options);
        pdf.addPage();
        if (orientation === 'horizontal') {
          pdf.addImage(dataUrl, 'PNG', 0, 0, 85.6, 53.98);
        } else {
          pdf.addImage(dataUrl, 'PNG', 0, 0, 53.98, 85.6);
        }
      }

      pdf.save('tapconnect-design.pdf');
    } catch (error: any) {
      console.error("Error generating image:", error);
      alert("Error generating your design: " + (error?.message || error));
    }
  };

  const handle3DPreview = async () => {
    setIsPreviewGenerating(true);
    
    // Temporarily deactivate mouse hover effect for flat capture
    setMousePos({ x: 0.5, y: 0.5, active: false });
    
    // We need to wait a tick for the state to settle
    setTimeout(async () => {
      try {
        const container = containerRef.current;
        if (!container) return;

        // Create a temporary clone for rendering both sides without switching UI
        const frontEl = container.querySelector('div[style*="background-color"]') as HTMLElement;
        const options = { pixelRatio: 3, cacheBust: true };
        
        // This is a simplified capture that uses the current active side as front.
        // Ideally we would swap activeSide, wait, capture, swap back.
        // For now, we capture the current DOM state as front image.
        const frontDataUrl = await toPng(container, options);
        setPreviewFrontImage(frontDataUrl);

        if (productType !== 'board') {
          // Temporarily flip the card to capture the back side
          setActiveSide(activeSide === 'front' ? 'back' : 'front');
          setTimeout(async () => {
             const backDataUrl = await toPng(container, options);
             setPreviewBackImage(backDataUrl);
             setActiveSide(activeSide); // switch back
             setIsPreviewGenerating(false);
             setIsPreview3DOpen(true);
          }, 300);
        } else {
          setIsPreviewGenerating(false);
          setIsPreview3DOpen(true);
        }
      } catch (error) {
        console.error("Error generating 3D preview:", error);
        setIsPreviewGenerating(false);
      }
    }, 100);
  };

  const selectedElement = currentSideState.elements.find(el => el.id === selectedElementId);

  return (
    <section id="customizer" className="relative bg-[#050505] h-[90vh] border-t border-white/5 flex flex-col">
      {/* Top Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-[#111] border-b border-white/10 z-20">
        <div className="flex items-center space-x-4">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.4em] block">Design Studio</span>
        </div>
        <div className="flex space-x-4 items-center">
          {productType !== 'board' && (
            <div className="flex bg-black/50 p-1 rounded-lg border border-white/10">
              <button onClick={() => { setActiveSide('front'); setSelectedElementId(null); }} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors ${activeSide === 'front' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Front</button>
              <button onClick={() => { setActiveSide('back'); setSelectedElementId(null); }} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors ${activeSide === 'back' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Back</button>
            </div>
          )}
          {productType !== 'board' && (
            <div className="flex bg-black/50 p-1 rounded-lg border border-white/10">
              <button onClick={() => handleOrientationChange('horizontal')} className={`p-1.5 rounded-md transition-colors ${orientation === 'horizontal' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`} title="Horizontal">
                <RectangleHorizontal className="w-4 h-4" />
              </button>
              <button onClick={() => handleOrientationChange('vertical')} className={`p-1.5 rounded-md transition-colors ${orientation === 'vertical' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`} title="Vertical">
                <RectangleVertical className="w-4 h-4" />
              </button>
            </div>
          )}
          <button onClick={handle3DPreview} disabled={isPreviewGenerating} className="px-6 py-2 bg-[#2a2a2a] border border-white/10 text-white hover:bg-[#333] hover:border-white/30 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all flex items-center space-x-2">
            {isPreviewGenerating ? (
              <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Box className="w-3 h-3" />
            )}
            <span>360° Preview</span>
          </button>
          <button onClick={handleSaveProjectClick} className="px-6 py-2 bg-[#1a1a1a] border border-white/10 text-white hover:text-white hover:border-white/30 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all flex items-center space-x-2">
            {isSaving ? (
              <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Save className="w-3 h-3" />
            )}
            <span>{searchParams.get('project') ? 'Save' : 'Save Design'}</span>
          </button>
          <button onClick={handleDownload} className="px-6 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-md hover:bg-gray-200 transition-all flex items-center">
            Download
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Far-Left Navigation Sidebar */}
        <div className="w-[80px] bg-[#111] flex flex-col items-center py-6 border-r border-white/10 space-y-2 z-20 shrink-0">
          {[
            { id: 'templates', icon: LayoutTemplate, label: 'Templates' },
            { id: 'material', icon: Layers, label: productType === 'board' ? 'Board Color' : 'Material' },
            { id: 'background', icon: Palette, label: 'Color' },
            { id: 'text', icon: Type, label: 'Text' },
            { id: 'elements', icon: Shapes, label: 'Elements' },
            { id: 'image', icon: ImageIcon, label: 'Uploads' },
            { id: 'draw', icon: PenTool, label: 'Draw' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center w-full py-4 transition-colors relative ${activeTab === tab.id ? 'text-white bg-white/5' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              {activeTab === tab.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-md"></div>}
              <tab.icon className="w-5 h-5 mb-2" />
              <span className="text-[9px] uppercase tracking-wider font-bold">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Secondary Context Panel (Slide out) */}
        <div className="w-[320px] bg-[#151515] border-r border-white/10 flex flex-col z-10 shrink-0 shadow-2xl">
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === 'material' && (
              <div className="animate-in fade-in slide-in-from-left-4">
                <h3 className="text-lg font-serif text-white mb-1">
                  {productType === 'board' ? 'Board Color' : 'Card Material'}
                </h3>
                <p className="text-xs text-gray-400 mb-6">
                  {productType === 'board' ? 'Choose your board color' : 'Choose your card texture and finish'}
                </p>

                {productType === 'board' ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        setSelectedMaterialId('board-white');
                        updateCurrentSide({ bgColor: '#ffffff' });
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${selectedMaterialId === 'board-white' ? 'bg-white/10 border-white ring-1 ring-white/30' : 'bg-[#1a1a1a] border-white/5 hover:border-white/20 hover:bg-white/5'}`}
                    >
                      <div className="flex items-center space-x-3 mb-1">
                        <div className="w-6 h-6 rounded-full bg-white border border-white/20"></div>
                        <span className="text-sm font-bold text-white">White Board</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Clean, bright white plastic display board.</p>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMaterialId('board-black');
                        updateCurrentSide({ bgColor: '#151515' });
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${selectedMaterialId === 'board-black' ? 'bg-white/10 border-white ring-1 ring-white/30' : 'bg-[#1a1a1a] border-white/5 hover:border-white/20 hover:bg-white/5'}`}
                    >
                      <div className="flex items-center space-x-3 mb-1">
                        <div className="w-6 h-6 rounded-full bg-[#151515] border border-white/20"></div>
                        <span className="text-sm font-bold text-white">Black Board</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Sleek matte black plastic display board.</p>
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Filter Switcher */}
                    <div className="grid grid-cols-4 gap-1 p-1 bg-[#1a1a1a] rounded-xl border border-white/10 mb-6">
                      {(['all', 'metal', 'plastic', 'wood'] as const).map(cat => (
                        <button
                          key={cat}
                          onClick={() => setMaterialCategoryFilter(cat)}
                          className={`py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all capitalize ${materialCategoryFilter === cat ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Material List */}
                    <div className="space-y-4">
                      {MATERIALS.filter(m => materialCategoryFilter === 'all' || m.category === materialCategoryFilter).map(material => {
                        const isSelected = selectedMaterialId === material.id;
                        return (
                          <button
                            key={material.id}
                            onClick={() => {
                              setSelectedMaterialId(material.id);
                              setCardData(prev => ({
                                front: { ...prev.front, bgColor: material.bgColor },
                                back: { ...prev.back, bgColor: material.bgColor }
                              }));
                            }}
                            className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${isSelected ? 'bg-white/10 border-white ring-1 ring-white/30' : 'bg-[#1a1a1a] border-white/5 hover:border-white/20 hover:bg-white/5'}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2.5">
                                <div className="w-6 h-6 rounded-full border border-white/20 shadow-md relative overflow-hidden shrink-0" style={{ background: material.previewBg }}>
                                  {material.sheenOverlay && (
                                    <div className="absolute inset-0 mix-blend-overlay opacity-80" style={{ background: material.sheenOverlay }}></div>
                                  )}
                                </div>
                                <span className="text-sm font-bold text-white group-hover:text-white transition-colors">{material.name}</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-400 mb-3 leading-relaxed">{material.description}</p>
                            <div className="flex items-center justify-between">
                              <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded border capitalize ${material.badgeColor}`}>
                                {material.category}
                              </span>
                              {isSelected && (
                                <span className="text-[10px] font-bold text-white flex items-center">
                                  <Check className="w-3 h-3 mr-1 text-emerald-400" /> Selected
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'draw' && (
              <div className="animate-in fade-in slide-in-from-left-4">
                <h3 className="text-lg font-serif text-white mb-6">Drawing Tools</h3>

                {/* Tools Grid */}
                <div className="mb-6 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setDrawTool('pen')}
                    className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-all ${drawTool === 'pen' ? 'bg-white/10 border-white text-white' : 'bg-[#1a1a1a] border-white/10 text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <PenTool className="w-5 h-5 mb-2" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Pen</span>
                  </button>
                  <button
                    onClick={() => setDrawTool('marker')}
                    className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-all ${drawTool === 'marker' ? 'bg-white/10 border-white text-white' : 'bg-[#1a1a1a] border-white/10 text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <Highlighter className="w-5 h-5 mb-2" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Marker</span>
                  </button>
                  <button
                    onClick={() => setDrawTool('eraser')}
                    className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-all ${drawTool === 'eraser' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-[#1a1a1a] border-white/10 text-gray-400 hover:text-red-400 hover:bg-red-500/10'}`}
                  >
                    <Eraser className="w-5 h-5 mb-2" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Eraser</span>
                  </button>
                </div>
                {isEraser && <p className="text-[10px] text-gray-500 mb-6 text-center">Click and drag over drawings to erase them.</p>}

                {/* Thickness Slider */}
                <div className="mb-6 opacity-100 transition-opacity" style={{ opacity: isEraser ? 0.5 : 1 }}>
                  <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gray-500 flex justify-between">
                    <span>Thickness</span><span>{drawThickness}px</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="40"
                    value={drawThickness}
                    onChange={(e) => setDrawThickness(parseInt(e.target.value))}
                    className="w-full accent-white"
                    disabled={isEraser}
                  />
                </div>

                {/* Color Palette */}
                <div className="opacity-100 transition-opacity" style={{ opacity: isEraser ? 0.5 : 1 }}>
                  <h4 className="text-sm font-bold text-white mb-4">Color</h4>
                  <div className="mb-4">
                    <label className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-all overflow-hidden relative shadow-sm" style={{ background: 'conic-gradient(from 90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)', padding: '2px' }}>
                      <div className="w-full h-full bg-[#151515] rounded-full flex items-center justify-center">
                        <span className="text-white text-xl font-light mb-1">+</span>
                      </div>
                      <input
                        type="color"
                        value={drawColor}
                        onChange={(e) => !isEraser && setDrawColor(e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        disabled={isEraser}
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {CANVA_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => !isEraser && setDrawColor(c)}
                        className="aspect-square rounded-full border-2 transition-all"
                        style={{
                          backgroundColor: c,
                          borderColor: drawColor === c ? '#fff' : 'transparent',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)'
                        }}
                        title={c}
                        disabled={isEraser}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="animate-in fade-in slide-in-from-left-4">
                <h3 className="text-lg font-serif text-white mb-6">Templates</h3>
                <div className="space-y-4">
                  {TEMPLATES.map(template => (
                    <button
                      key={template.id}
                      onClick={() => {
                        setCardData(template.cardData);
                        setSelectedElementId(null);
                      }}
                      className="w-full flex flex-col items-center p-4 bg-[#1a1a1a] hover:bg-white/10 border border-white/5 rounded-xl transition-all text-left"
                    >
                      <div
                        className="w-full h-20 rounded-lg mb-3 flex items-center justify-center border border-white/10"
                        style={{ backgroundColor: template.cardData.front.bgColor }}
                      >
                        <LayoutTemplate className="w-6 h-6 text-white/50" />
                      </div>
                      <span className="text-sm font-bold text-white w-full">{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'background' && (
              <div className="animate-in fade-in slide-in-from-left-4">
                <h3 className="text-lg font-serif text-white mb-6">Background Color</h3>

                <div className="mb-6">
                  <h4 className="text-sm font-bold text-white mb-4">Document colors</h4>
                  <div className="flex items-center">
                    <label className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-all overflow-hidden relative shadow-sm" style={{ background: 'conic-gradient(from 90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)', padding: '2px' }}>
                      <div className="w-full h-full bg-[#151515] rounded-full flex items-center justify-center">
                        <span className="text-white text-xl font-light mb-1">+</span>
                      </div>
                      <input
                        type="color"
                        value={currentSideState.bgColor}
                        onChange={(e) => updateCurrentSide({ bgColor: e.target.value })}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white mb-4">Default solid colors</h4>
                  <div className="grid grid-cols-6 gap-2">
                    {CANVA_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => updateCurrentSide({ bgColor: c })}
                        className="aspect-square rounded-full border-2 transition-all"
                        style={{
                          backgroundColor: c,
                          borderColor: currentSideState.bgColor === c ? '#fff' : 'transparent',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)'
                        }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-8 mt-8 border-t border-white/10">
                  <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">Global Actions</h3>
                  <button onClick={() => updateCurrentSide({ elements: [] })} className="flex items-center text-red-400 hover:text-red-300 transition-colors text-[10px] uppercase tracking-widest font-bold px-4 py-3 bg-red-400/10 hover:bg-red-400/20 rounded-lg w-full justify-center">
                    <Trash2 className="w-4 h-4 mr-2" /> Start from Scratch
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'text' && (
              <div className="animate-in fade-in slide-in-from-left-4">
                <h3 className="text-lg font-serif text-white mb-6">Add Text</h3>
                <button onClick={addText} className="w-full flex flex-col items-center justify-center py-8 bg-[#1a1a1a] hover:bg-white/5 border border-white/10 rounded-xl transition-all group">
                  <Type className="w-8 h-8 text-gray-400 mb-3 group-hover:text-white transition-colors" />
                  <span className="text-sm font-bold text-white">Add a text box</span>
                </button>
              </div>
            )}

            {activeTab === 'elements' && (
              <div className="animate-in fade-in slide-in-from-left-4">
                <h3 className="text-lg font-serif text-white mb-6">Elements</h3>

                <button onClick={() => setIsShapesOpen(!isShapesOpen)} className="w-full flex items-center justify-between text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest hover:text-white transition-colors">
                  <span>Shapes</span>
                  {isShapesOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {isShapesOpen && (
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    <button onClick={() => addElementShape(100, 100, 0)} className="aspect-square flex items-center justify-center bg-[#1a1a1a] hover:bg-white/10 border border-white/5 rounded-xl transition-all">
                      <div className="w-10 h-10 bg-white"></div>
                    </button>
                    <button onClick={() => addElementShape(100, 100, 16)} className="aspect-square flex items-center justify-center bg-[#1a1a1a] hover:bg-white/10 border border-white/5 rounded-xl transition-all">
                      <div className="w-10 h-10 bg-white rounded-lg"></div>
                    </button>
                    <button onClick={() => addElementShape(100, 100, '50%')} className="aspect-square flex items-center justify-center bg-[#1a1a1a] hover:bg-white/10 border border-white/5 rounded-xl transition-all">
                      <div className="w-10 h-10 bg-white rounded-full"></div>
                    </button>
                    <button onClick={() => addElementShape(160, 50, 9999)} className="aspect-square flex items-center justify-center bg-[#1a1a1a] hover:bg-white/10 border border-white/5 rounded-xl transition-all">
                      <div className="w-16 h-5 bg-white rounded-full"></div>
                    </button>
                    <button onClick={() => addElementShape(200, 4, 0)} className="aspect-square flex items-center justify-center bg-[#1a1a1a] hover:bg-white/10 border border-white/5 rounded-xl transition-all">
                      <div className="w-16 h-1 bg-white"></div>
                    </button>
                    <button onClick={() => addElementShape(4, 200, 0)} className="aspect-square flex items-center justify-center bg-[#1a1a1a] hover:bg-white/10 border border-white/5 rounded-xl transition-all">
                      <div className="w-1 h-16 bg-white"></div>
                    </button>
                  </div>
                )}

                <button onClick={() => setIsIconsOpen(!isIconsOpen)} className="w-full flex items-center justify-between text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest hover:text-white transition-colors">
                  <span>Icons</span>
                  {isIconsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {isIconsOpen && (
                  <div className="grid grid-cols-4 gap-2">
                    {ICONS.map(({ id, label, component: IconComponent }) => (
                      <button
                        key={id}
                        onClick={() => addIcon(id)}
                        className="aspect-square flex items-center justify-center bg-[#1a1a1a] hover:bg-white/10 border border-white/5 rounded-xl transition-all text-gray-400 hover:text-white"
                        title={label}
                      >
                        <IconComponent className="w-6 h-6" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'image' && (
              <div className="animate-in fade-in slide-in-from-left-4">
                <h3 className="text-lg font-serif text-white mb-6">Uploads</h3>
                <button onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center py-10 border-2 border-dashed border-white/20 hover:border-white/40 bg-white/5 rounded-xl transition-all text-gray-400 hover:text-white group mb-6">
                  <ImageIcon className="w-8 h-8 mb-3" />
                  <span className="text-xs font-bold uppercase tracking-widest">Upload Image</span>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                </button>

                {user && userImages.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xs uppercase tracking-widest font-bold text-gray-500">Your Library</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {userImages.map(img => (
                        <button
                          key={img.id}
                          onClick={() => {
                            const newEl: ElementData = {
                              id: Date.now().toString(),
                              type: 'image',
                              imageUrl: img.url,
                              x: 50,
                              y: 50,
                              z: getNextZ(),
                              width: 100,
                              color: '#ffffff',
                              opacity: 1
                            };
                            updateCurrentSide({ elements: [...currentSideState.elements, newEl] });
                            setSelectedElementId(newEl.id);
                          }}
                          className="aspect-square bg-[#111] border border-white/10 hover:border-white/30 rounded-lg overflow-hidden transition-all p-2 flex items-center justify-center"
                        >
                          <img src={img.url} alt="Uploaded" className="max-w-full max-h-full object-contain pointer-events-none" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {!user && (
                  <p className="text-[10px] text-center text-gray-500 mt-4">Sign in to save uploads to your account library.</p>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Central Canvas Area */}
        <div className="flex-1 bg-[#0a0a0a] relative flex flex-col items-center justify-center overflow-hidden" onClick={() => setSelectedElementId(null)}>

          {/* Top Context Toolbar (Canva-style) */}
          {selectedElementId && selectedElement && (
            <div
              className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a1a] border border-white/20 rounded-xl px-4 py-2 flex items-center space-x-4 shadow-2xl animate-in fade-in slide-in-from-top-4"
              onClick={(e) => e.stopPropagation()}
            >

              {selectedElement.type === 'text' && (
                <>
                  <FontPicker
                    value={selectedElement.fontFamily || 'var(--font-serif)'}
                    onChange={(val) => updateElement(selectedElement.id, { fontFamily: val })}
                  />
                  <div className="flex items-center space-x-2 border-r border-white/20 pr-4">
                    <input
                      type="number"
                      value={selectedElement.fontSize}
                      onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                      className="w-12 bg-black/50 border border-white/20 rounded px-1 py-0.5 text-white text-xs text-center"
                    />
                    <span className="text-[10px] text-gray-500">px</span>
                  </div>
                </>
              )}

              {selectedElement.type !== 'image' && (
                <div className="flex items-center border-r border-white/20 pr-4">
                  <label className="w-6 h-6 rounded-full border border-white/20 cursor-pointer overflow-hidden relative">
                    <div className="w-full h-full" style={{ backgroundColor: selectedElement.color }}></div>
                    <input
                      type="color"
                      value={selectedElement.color}
                      onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                  </label>
                </div>
              )}

              <div className="flex items-center space-x-2 border-r border-white/20 pr-4">
                <button onClick={() => moveZIndex(selectedElement.id, 'up')} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10" title="Bring Forward"><ArrowUp className="w-4 h-4" /></button>
                <button onClick={() => moveZIndex(selectedElement.id, 'down')} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10" title="Send Backward"><ArrowDown className="w-4 h-4" /></button>
              </div>

              <div className="flex items-center pl-2 space-x-2">
                <button onClick={() => duplicateElement(selectedElement.id)} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10" title="Duplicate"><Copy className="w-4 h-4" /></button>
                <button onClick={() => removeElement(selectedElement.id)} className="p-1.5 text-red-400 hover:text-red-300 rounded hover:bg-white/10" title="Delete"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {/* Editor Sidebar (For Text content, sliders) */}
          {selectedElementId && selectedElement && (
            <div className="absolute right-6 top-6 bottom-6 w-64 bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col z-40 animate-in slide-in-from-right-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-sm uppercase tracking-widest font-bold text-white mb-6">Settings</h3>

              <div className="space-y-6 overflow-y-auto custom-scrollbar flex-1 pr-2">
                {selectedElement.type === 'text' && (
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => updateElement(selectedElement.id, { textTransform: 'none' })} className={`p-2 rounded border text-xs transition-all ${(!selectedElement.textTransform || selectedElement.textTransform === 'none') ? 'bg-white/20 border-white text-white' : 'border-white/10 text-gray-500 hover:text-white'}`}>Aa</button>
                    <button onClick={() => updateElement(selectedElement.id, { textTransform: 'lowercase' })} className={`p-2 rounded border text-xs transition-all ${selectedElement.textTransform === 'lowercase' ? 'bg-white/20 border-white text-white' : 'border-white/10 text-gray-500 hover:text-white'}`}>aa</button>
                    <button onClick={() => updateElement(selectedElement.id, { textTransform: 'uppercase' })} className={`p-2 rounded border text-xs transition-all ${selectedElement.textTransform === 'uppercase' ? 'bg-white/20 border-white text-white' : 'border-white/10 text-gray-500 hover:text-white'}`}>AA</button>
                  </div>
                )}

                {selectedElement.type === 'icon' && (
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gray-500">Change Icon</label>
                    <div className="flex flex-wrap gap-2">
                      {ICONS.slice(0, 12).map(({ id, component: IconComponent }) => (
                        <button key={id} onClick={() => updateElement(selectedElement.id, { iconId: id })} className={`p-2 rounded-lg transition-all ${selectedElement.iconId === id ? 'bg-white/20 text-white' : 'bg-black/50 text-gray-500 hover:text-white'}`}>
                          <IconComponent className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedElement.type === 'shape' && (
                  <>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gray-500 flex justify-between">
                        <span>Width</span><span>{selectedElement.width || 100}px</span>
                      </label>
                      <input type="range" min="20" max="400" value={selectedElement.width || 100} onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) })} className="w-full accent-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gray-500 flex justify-between">
                        <span>Height</span><span>{selectedElement.height || 100}px</span>
                      </label>
                      <input type="range" min="20" max="400" value={selectedElement.height || 100} onChange={(e) => updateElement(selectedElement.id, { height: parseInt(e.target.value) })} className="w-full accent-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gray-500 flex justify-between">
                        <span>Roundness</span><span>{selectedElement.borderRadius || 0}px</span>
                      </label>
                      <input type="range" min="0" max="200" value={selectedElement.borderRadius || 0} onChange={(e) => updateElement(selectedElement.id, { borderRadius: parseInt(e.target.value) })} className="w-full accent-white" />
                    </div>
                  </>
                )}

                {selectedElement.type === 'image' && (
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gray-500 flex justify-between">
                      <span>Width</span><span>{selectedElement.width || 100}px</span>
                    </label>
                    <input type="range" min="20" max="300" value={selectedElement.width || 100} onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) })} className="w-full accent-white" />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gray-500 flex justify-between">
                    <span>Opacity</span><span>{Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
                  </label>
                  <input type="range" min="0" max="1" step="0.05" value={selectedElement.opacity ?? 1} onChange={(e) => updateElement(selectedElement.id, { opacity: parseFloat(e.target.value) })} className="w-full accent-white" />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gray-500 flex justify-between">
                    <span>Rotation</span><span>{selectedElement.rotation || 0}°</span>
                  </label>
                  <input type="range" min="0" max="360" value={selectedElement.rotation || 0} onChange={(e) => updateElement(selectedElement.id, { rotation: parseInt(e.target.value) })} className="w-full accent-white" />
                </div>
              </div>
            </div>
          )}

          {/* Mini Preview of Inactive Side */}
          {productType !== 'board' && (
            <div
              className={`absolute top-6 transition-all duration-300 z-30 group cursor-pointer border border-white/10 hover:border-white/30 rounded-xl overflow-hidden shadow-2xl bg-[#111] ${selectedElementId ? 'right-72' : 'right-6'}`}
              onClick={(e) => { e.stopPropagation(); setActiveSide(activeSide === 'front' ? 'back' : 'front'); }}
              style={{
                width: orientation === 'horizontal' ? 160 : 100,
                height: orientation === 'horizontal' ? 100 : 160
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                <span className="text-white text-[9px] font-bold uppercase tracking-widest bg-black/80 px-2 py-1 rounded relative z-10 whitespace-nowrap text-center leading-tight">
                  Switch to<br />{activeSide === 'front' ? 'Back' : 'Front'}
                </span>
              </div>
              <div
                style={{
                  width: productType === 'board' ? 300 : (orientation === 'horizontal' ? 428 : 270),
                  height: productType === 'board' ? 450 : (orientation === 'horizontal' ? 270 : 428),
                  transform: `scale(${160 / (productType === 'board' ? 300 : (orientation === 'horizontal' ? 428 : 270))})`,
                  transformOrigin: 'top left',
                  backgroundColor: cardData[activeSide === 'front' ? 'back' : 'front'].bgColor
                }}
                className="relative pointer-events-none"
              >
                {cardData[activeSide === 'front' ? 'back' : 'front'].elements.map(el => (
                  <DraggableElement
                    key={`mini-${el.id}`}
                    el={el}
                    isSelected={false}
                    onSelect={() => { }}
                    onRemove={() => { }}
                    onDrag={() => { }}
                    isDrawMode={false}
                    isEraser={false}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Zoom Wrapper */}
          <div style={{ transform: `scale(${zoom / 100})`, transition: 'transform 0.15s ease-out' }} className="flex items-center justify-center">
            {/* Card Container */}
            <div
              ref={containerRef}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              className="relative shrink-0 perspective-1000 cursor-pointer"
              style={{
                width: productType === 'board' ? '300px' : (orientation === 'horizontal' ? '428px' : '270px'),
                height: productType === 'board' ? '450px' : (orientation === 'horizontal' ? '270px' : '428px'),
                perspective: '1200px'
              }}
            >
              <motion.div
                key={isPreviewGenerating ? 'generating' : `${activeSide}-${orientation}`}
                initial={isPreviewGenerating ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: isPreviewGenerating ? 0 : 0.25, ease: "easeOut" }}
                className="absolute inset-0 rounded-2xl transition-all duration-300 z-10 overflow-hidden border border-white/10"
                style={{
                  backgroundColor: currentSideState.bgColor,
                  boxShadow: selectedMaterial?.shadowStyle || '0 30px 60px -15px rgba(0, 0, 0, 0.85)',
                  transform: mousePos.active
                    ? `rotateY(${(mousePos.x - 0.5) * 18}deg) rotateX(${(0.5 - mousePos.y) * 18}deg)`
                    : 'rotateY(0deg) rotateX(0deg)',
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Material Texture & Sheen Overlay */}
                {selectedMaterial && (
                  <>
                    <div
                      className="absolute inset-0 pointer-events-none transition-all duration-500 z-0"
                      style={{
                        background: selectedMaterial.previewBg,
                        mixBlendMode: selectedMaterial.category === 'wood' ? 'multiply' : 'normal',
                        opacity: currentSideState.bgColor === selectedMaterial.bgColor ? (selectedMaterial.category === 'wood' ? 0.9 : 1) : 0.85
                      }}
                    />
                    {selectedMaterial.sheenOverlay && (
                      <div
                        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-60 z-0"
                        style={{ background: selectedMaterial.sheenOverlay }}
                      />
                    )}
                  </>
                )}

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
                      onUpdateElement={(id: string, updates: Partial<ElementData>) => updateElement(id, updates)}
                      IconComp={IconComp}
                      isDrawMode={activeTab === 'draw'}
                      isEraser={isEraser}
                      onRemove={(id: string) => updateCurrentSide({ elements: currentSideState.elements.filter(e => e.id !== id) })}
                      setSnapGuides={setSnapGuides}
                      orientation={orientation}
                      zoom={zoom}
                    />
                  );
                })}

                {/* Snap Guides */}
                {snapGuides.x !== null && (
                  <div className="absolute top-0 bottom-0 w-[1px] bg-pink-500 z-[60] pointer-events-none" style={{ left: snapGuides.x }}></div>
                )}
                {snapGuides.y !== null && (
                  <div className="absolute left-0 right-0 h-[1px] bg-pink-500 z-[60] pointer-events-none" style={{ top: snapGuides.y }}></div>
                )}

                {/* Drawing Overlay */}
                {activeTab === 'draw' && !isEraser && (
                  <div
                    className="absolute inset-0 z-[100] touch-none cursor-crosshair"
                    onPointerDown={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = (e.clientX - rect.left) / (zoom / 100);
                      const y = (e.clientY - rect.top) / (zoom / 100);
                      setIsDrawing(true);
                      setCurrentPath([{ x, y }]);
                    }}
                    onPointerMove={(e) => {
                      if (!isDrawing) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = (e.clientX - rect.left) / (zoom / 100);
                      const y = (e.clientY - rect.top) / (zoom / 100);
                      setCurrentPath(prev => [...prev, { x, y }]);
                    }}
                    onPointerUp={() => {
                      if (!isDrawing) return;
                      setIsDrawing(false);
                      if (currentPath.length > 1) {
                        const pathData = `M ${currentPath.map(p => `${p.x} ${p.y}`).join(' L ')}`;
                        const newEl: ElementData = {
                          id: Date.now().toString(),
                          type: 'drawing',
                          x: 0,
                          y: 0,
                          z: getNextZ(),
                          color: drawColor,
                          strokeWidth: drawThickness,
                          drawTool,
                          pathData,
                          opacity: 1
                        };
                        updateCurrentSide({ elements: [...currentSideState.elements, newEl] });
                      }
                      setCurrentPath([]);
                    }}
                    onPointerLeave={() => {
                      if (!isDrawing) return;
                      setIsDrawing(false);
                      if (currentPath.length > 1) {
                        const pathData = `M ${currentPath.map(p => `${p.x} ${p.y}`).join(' L ')}`;
                        const newEl: ElementData = {
                          id: Date.now().toString(),
                          type: 'drawing',
                          x: 0,
                          y: 0,
                          z: getNextZ(),
                          color: drawColor,
                          strokeWidth: drawThickness,
                          drawTool,
                          pathData,
                          opacity: 1
                        };
                        updateCurrentSide({ elements: [...currentSideState.elements, newEl] });
                      }
                      setCurrentPath([]);
                    }}
                  >
                    {isDrawing && currentPath.length > 0 && (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                        <path
                          d={`M ${currentPath.map(p => `${p.x} ${p.y}`).join(' L ')}`}
                          stroke={drawColor}
                          strokeWidth={drawThickness}
                          strokeOpacity={drawTool === 'marker' ? 0.4 : 1}
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Zoom UI Control */}
          <div className="absolute bottom-6 right-6 flex items-center bg-[#151515] border border-white/10 px-4 py-2 rounded-full shadow-2xl z-50">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></div>
            <input
              type="range"
              min="10"
              max="200"
              value={zoom}
              onChange={(e) => setZoom(parseInt(e.target.value))}
              className="w-32 accent-white h-1.5 bg-gray-600 rounded-full appearance-none cursor-pointer"
            />
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 ml-3 mr-4"></div>
            <span className="text-white text-sm font-bold w-12 text-right">{zoom}%</span>
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
              width: orientation === 'horizontal' ? '428px' : '270px',
              height: orientation === 'horizontal' ? '270px' : '428px',
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
                  {el.type === 'drawing' && el.pathData && (
                    <svg style={{ overflow: 'visible' }}>
                      <path d={el.pathData} stroke={el.color} strokeWidth={el.strokeWidth || 4} strokeOpacity={el.drawTool === 'marker' ? 0.4 : 1} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Save Project Custom Modal */}
      <AnimatePresence>
        {isSaveModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-serif text-white">Save Design</h2>
                  <button onClick={() => setIsSaveModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={confirmSaveProject}>
                  <div className="mb-6">
                    <label className="block text-xs text-gray-400 font-medium uppercase tracking-widest mb-2">Design Name</label>
                    <input
                      type="text"
                      autoFocus
                      required
                      value={saveProjectName}
                      onChange={(e) => setSaveProjectName(e.target.value)}
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsSaveModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving || !saveProjectName.trim()}
                      className="px-5 py-2.5 bg-white text-black rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        'Save Design'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 360 3D Preview Modal */}
      <Preview3DModal
        isOpen={isPreview3DOpen}
        onClose={() => setIsPreview3DOpen(false)}
        frontImage={activeSide === 'front' ? previewFrontImage : previewBackImage}
        backImage={activeSide === 'front' ? previewBackImage : previewFrontImage}
        productType={productType}
        orientation={orientation}
        boardColor={productType === 'board' ? (MATERIALS.find(m => m.id === selectedMaterialId)?.bgColor || '#111') : currentSideState.bgColor}
      />
    </section>
  );
}
