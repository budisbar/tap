import React, { useState, useRef, useEffect } from 'react';
import Preview3DModal from '../modals/Preview3DModal';
import AuthModal from '../modals/AuthModal';
import { motion, AnimatePresence } from 'motion/react';
import {
  SmartphoneNfc, Type, Trash2, RectangleHorizontal, RectangleVertical, Image as ImageIcon, ArrowUp, ArrowDown,
  ChevronDown, ChevronRight, ChevronUp, Shapes, LayoutTemplate, Palette, PenTool, Eraser, Highlighter, Layers,
  Check, X, Copy, Save, Box, Download, Undo2, Redo2, Sparkles, RefreshCw
} from 'lucide-react';
import { dataService as db, User as DbUser, ImageAsset, DAILY_AI_LIMIT } from '../../lib/dataService';
import { generateCardWithAi, AiCardPromptInput } from '../../lib/aiCardService';
import AiCardGeneratorTab from './AiCardGeneratorTab';
import { useSearchParams } from 'react-router-dom';
import {
  CANVA_COLORS,
  ICONS,
  TEMPLATES,
  MATERIALS,
  loadAllGoogleFonts,
  getEffectiveElementColor,
  isEngravedMaterial,
  CardMaterial,
  Orientation,
  Side,
  ElementData,
  CardState
} from './customizerData';
import FontPicker from './FontPicker';
import DraggableElement from './DraggableElement';
import CardPreview from './CardPreview';
import OrderCardModal from './OrderCardModal';

interface CardCustomizerProps {
  onBookMeeting?: () => void;
}

interface StudioSnapshot {
  cardData: Record<Side, CardState>;
  selectedMaterialId: string;
  plasticBgColors: Record<Side, string>;
  activeSide: Side;
  orientation: Orientation;
  productType: 'card' | 'board';
}

const MAX_HISTORY = 60;
const STUDIO_AUTOSAVE_KEY = 'tapconnect_studio_autosave_v1';
const DEFAULT_PLASTIC_MATERIAL_ID = 'plastic-white';
const DEFAULT_PLASTIC_BG = '#ffffff';

function StartFromScratchAction({ onClick }: { onClick: () => void }) {
  return (
    <div className="pt-8 mt-8 border-t border-white/10">
      <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">Global Actions</h3>
      <button
        type="button"
        onClick={onClick}
        className="flex items-center text-red-400 hover:text-red-300 transition-colors text-[10px] uppercase tracking-widest font-bold px-4 py-3 bg-red-400/10 hover:bg-red-400/20 rounded-lg w-full justify-center cursor-pointer"
      >
        <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" /> Start from Scratch
      </button>
    </div>
  );
}

export default function CardCustomizer({ onBookMeeting }: CardCustomizerProps = {}) {
  const [user, setUser] = useState<DbUser | null>(null);
  const [userImages, setUserImages] = useState<ImageAsset[]>([]);

  const [searchParams] = useSearchParams();

  const [showSaveAccountOffer, setShowSaveAccountOffer] = useState(false);

  useEffect(() => {
    loadAllGoogleFonts();
  }, []);

  useEffect(() => {
    const unsub = db.onAuthChange((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        db.getImagesByUser(currentUser.id).then(setUserImages);

        const projectId = searchParams.get('project');
        const urlType = searchParams.get('type');

        if (projectId) {
          db.getDesignById(currentUser.id, projectId).then(project => {
            if (project) {
              setCardData(project.data);
              setSaveProjectName(project.name);
              if (project.productType === 'board') {
                setProductType('board');
                setOrientation('vertical');
              } else {
                const matchingMaterial = MATERIALS.find(
                  (m) => m.bgColor.toLowerCase() === project.data.front.bgColor.toLowerCase()
                );
                if (matchingMaterial) {
                  setSelectedMaterialId(matchingMaterial.id);
                } else {
                  setSelectedMaterialId('plastic-black');
                  setPlasticBgColors({
                    front: project.data.front.bgColor,
                    back: project.data.back.bgColor,
                  });
                }
              }
            }
          });
        } else if (urlType === 'board') {
          setProductType('board');
          setOrientation('vertical');
          setCardData({
            front: { bgColor: '#ffffff', elements: [] },
            back: { bgColor: '#ffffff', elements: [] },
          });
        } else {
          // If signed in and has autosaved local draft with elements, offer saving
          const raw = localStorage.getItem(STUDIO_AUTOSAVE_KEY);
          if (raw) {
            try {
              const saved = JSON.parse(raw);
              if (saved?.cardData?.front?.elements?.length > 0 || saved?.cardData?.back?.elements?.length > 0) {
                setShowSaveAccountOffer(true);
              }
            } catch {
              // ignore
            }
          }
        }
      }
    });

    return () => unsub();
  }, [searchParams]);

  const [productType, setProductType] = useState<'card' | 'board'>('card');
  const [orientation, setOrientation] = useState<Orientation>('horizontal');
  const [activeSide, setActiveSide] = useState<Side>('front');

  const [isPreview3DOpen, setIsPreview3DOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(true);
  const [previewFrontImage, setPreviewFrontImage] = useState('');
  const [previewBackImage, setPreviewBackImage] = useState('');
  const [isPreviewGenerating, setIsPreviewGenerating] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const [cardData, setCardData] = useState<Record<Side, CardState>>({
    front: { bgColor: DEFAULT_PLASTIC_BG, elements: [] },
    back: { bgColor: DEFAULT_PLASTIC_BG, elements: [] }
  });
  const [plasticBgColors, setPlasticBgColors] = useState<Record<Side, string>>({
    front: DEFAULT_PLASTIC_BG,
    back: DEFAULT_PLASTIC_BG,
  });
  const [historyPast, setHistoryPast] = useState<StudioSnapshot[]>([]);
  const [historyFuture, setHistoryFuture] = useState<StudioSnapshot[]>([]);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
  const [isAutoSaveReady, setIsAutoSaveReady] = useState(false);

  const lastCoalesceRef = useRef<{ key: string | null; time: number }>({ key: null, time: 0 });

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<ElementData | null>(null);
  const [activeTab, setActiveTab] = useState<'ai' | 'templates' | 'material' | 'elements' | 'image' | 'background' | 'draw'>('ai');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
  const [aiError, setAiError] = useState<{ friendly: string } | null>(null);
  const [isReplaceConfirmOpen, setIsReplaceConfirmOpen] = useState(false);
  const [pendingAiInput, setPendingAiInput] = useState<AiCardPromptInput | null>(null);
  const aiAbortControllerRef = useRef<AbortController | null>(null);

  // Warn user if leaving page while AI generation is in progress
  useEffect(() => {
    if (!isGeneratingAI) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isGeneratingAI]);

  const handleCancelAi = () => {
    if (aiAbortControllerRef.current) {
      aiAbortControllerRef.current.abort('CANCELLED');
      aiAbortControllerRef.current = null;
    }
    setIsGeneratingAI(false);
    setPendingAiInput(null);
    setAiError(null);
  };
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(DEFAULT_PLASTIC_MATERIAL_ID);
  const [materialCategoryFilter, setMaterialCategoryFilter] = useState<'all' | 'metal' | 'plastic' | 'wood'>('all');
  const [isShapesOpen, setIsShapesOpen] = useState(false);
  const [isTextOpen, setIsTextOpen] = useState(true);
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
  const canvasAreaRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const el = canvasAreaRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setCanvasSize({ width: rect.width, height: rect.height });
    };

    updateSize();
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setCanvasSize({ width, height });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const projectId = searchParams.get('project');
    const urlType = searchParams.get('type');
    if (!projectId && !urlType) {
      try {
        const raw = localStorage.getItem(STUDIO_AUTOSAVE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved?.cardData?.front && saved?.cardData?.back) {
            setCardData(saved.cardData);
            if (saved.selectedMaterialId) setSelectedMaterialId(saved.selectedMaterialId);
            if (saved.plasticBgColors) setPlasticBgColors(saved.plasticBgColors);
            if (saved.activeSide === 'front' || saved.activeSide === 'back') setActiveSide(saved.activeSide);
            if (saved.orientation === 'horizontal' || saved.orientation === 'vertical') setOrientation(saved.orientation);
            if (saved.productType === 'card' || saved.productType === 'board') setProductType(saved.productType);
          }
        }
      } catch {
        // Ignore malformed localStorage drafts
      }
    }
    setIsAutoSaveReady(true);
  }, [searchParams]);

  useEffect(() => {
    if (!isAutoSaveReady || searchParams.get('project')) return;
    try {
      localStorage.setItem(
        STUDIO_AUTOSAVE_KEY,
        JSON.stringify({
          cardData,
          selectedMaterialId,
          plasticBgColors,
          activeSide,
          orientation,
          productType,
        })
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [isAutoSaveReady, cardData, selectedMaterialId, plasticBgColors, activeSide, orientation, productType, searchParams]);

  const currentSideState = cardData[activeSide];
  const selectedMaterial = productType === 'board' ? null : (MATERIALS.find(m => m.id === selectedMaterialId) || MATERIALS[0]);
  const isPlastic = productType === 'board' || selectedMaterial?.category === 'plastic';
  const isEngraved = isEngravedMaterial(selectedMaterial);
  const isWoodEngraved = selectedMaterial?.category === 'wood';
  const effectiveDrawColor = getEffectiveElementColor(drawColor, selectedMaterial);

  const cloneSnapshot = (): StudioSnapshot => ({
    cardData: {
      front: {
        bgColor: cardData.front.bgColor,
        elements: cardData.front.elements.map(el => ({ ...el })),
      },
      back: {
        bgColor: cardData.back.bgColor,
        elements: cardData.back.elements.map(el => ({ ...el })),
      },
    },
    selectedMaterialId,
    plasticBgColors: { ...plasticBgColors },
    activeSide,
    orientation,
    productType,
  });

  const recordHistory = (coalesceKey?: string) => {
    const now = Date.now();
    if (
      coalesceKey &&
      lastCoalesceRef.current.key === coalesceKey &&
      now - lastCoalesceRef.current.time < 500
    ) {
      lastCoalesceRef.current.time = now;
      return;
    }

    lastCoalesceRef.current = { key: coalesceKey || null, time: now };
    const snap = cloneSnapshot();
    setHistoryPast(prev => [...prev, snap].slice(-MAX_HISTORY));
    setHistoryFuture([]);
  };

  const applySnapshot = (snapshot: StudioSnapshot) => {
    if (document.activeElement instanceof HTMLElement && document.activeElement.isContentEditable) {
      document.activeElement.blur();
    }
    setCardData(snapshot.cardData);
    setSelectedMaterialId(snapshot.selectedMaterialId);
    setPlasticBgColors(snapshot.plasticBgColors);
    setActiveSide(snapshot.activeSide);
    setOrientation(snapshot.orientation);
    setProductType(snapshot.productType);
    setSelectedElementId(prev => {
      if (!prev) return null;
      const stillExists = snapshot.cardData[snapshot.activeSide].elements.some(el => el.id === prev);
      return stillExists ? prev : null;
    });
  };

  const handleUndo = () => {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    const currentSnap = cloneSnapshot();
    lastCoalesceRef.current = { key: null, time: 0 };
    setHistoryPast(prev => prev.slice(0, -1));
    setHistoryFuture(prev => [...prev, currentSnap].slice(-MAX_HISTORY));
    applySnapshot(previous);
  };

  const handleRedo = () => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[historyFuture.length - 1];
    const currentSnap = cloneSnapshot();
    lastCoalesceRef.current = { key: null, time: 0 };
    setHistoryFuture(prev => prev.slice(0, -1));
    setHistoryPast(prev => [...prev, currentSnap].slice(-MAX_HISTORY));
    applySnapshot(next);
  };

  const recordHistoryRef = useRef(recordHistory);
  recordHistoryRef.current = recordHistory;
  const undoRedoRef = useRef({ handleUndo, handleRedo });
  undoRedoRef.current = { handleUndo, handleRedo };

  const handleSwitchSide = (side: Side) => {
    if (activeSide === side) return;
    recordHistory();
    setActiveSide(side);
    setSelectedElementId(null);
  };

  const resetCardToDefaultPlastic = () => {
    const targetMatId = productType === 'board' ? 'board-white' : DEFAULT_PLASTIC_MATERIAL_ID;
    recordHistory();
    setSelectedMaterialId(targetMatId);
    setPlasticBgColors({ front: DEFAULT_PLASTIC_BG, back: DEFAULT_PLASTIC_BG });
    setCardData({
      front: { bgColor: DEFAULT_PLASTIC_BG, elements: [] },
      back: { bgColor: DEFAULT_PLASTIC_BG, elements: [] },
    });
    setSelectedElementId(null);
  };

  const handleStartFromScratchClick = () => {
    const isCardEmpty = cardData.front.elements.length === 0 && cardData.back.elements.length === 0;
    if (isCardEmpty) {
      const targetMatId = productType === 'board' ? 'board-white' : DEFAULT_PLASTIC_MATERIAL_ID;
      if (
        selectedMaterialId !== targetMatId ||
        cardData.front.bgColor !== DEFAULT_PLASTIC_BG ||
        cardData.back.bgColor !== DEFAULT_PLASTIC_BG
      ) {
        resetCardToDefaultPlastic();
      }
      return;
    }
    setIsConfirmResetOpen(true);
  };

  const confirmStartFromScratch = () => {
    resetCardToDefaultPlastic();
    setIsConfirmResetOpen(false);
  };

  const handleSelectMaterial = (material: CardMaterial) => {
    if (material.id === selectedMaterialId) return;
    recordHistory();
    const wasPlastic = isPlastic;
    const willBePlastic = material.category === 'plastic';

    if (wasPlastic && !willBePlastic) {
      setPlasticBgColors({
        front: cardData.front.bgColor,
        back: cardData.back.bgColor,
      });
      setCardData(prev => ({
        front: { ...prev.front, bgColor: material.bgColor },
        back: { ...prev.back, bgColor: material.bgColor },
      }));
    } else if (!wasPlastic && willBePlastic) {
      setCardData(prev => ({
        front: { ...prev.front, bgColor: plasticBgColors.front || material.bgColor },
        back: { ...prev.back, bgColor: plasticBgColors.back || material.bgColor },
      }));
    } else {
      setCardData(prev => ({
        front: { ...prev.front, bgColor: material.bgColor },
        back: { ...prev.back, bgColor: material.bgColor },
      }));
      if (willBePlastic) {
        setPlasticBgColors({
          front: material.bgColor,
          back: material.bgColor,
        });
      }
    }

    setSelectedMaterialId(material.id);
  };

  const defaultElementColor =
    isPlastic &&
    (currentSideState.bgColor.toLowerCase() === '#ffffff' ||
      currentSideState.bgColor.toLowerCase() === '#f5f5f5')
      ? '#111111'
      : '#ffffff';

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
    recordHistory();

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

  const updateElement = (id: string, updates: Partial<ElementData>, skipHistory = false) => {
    if (!skipHistory) {
      recordHistory(`el-${id}-${Object.keys(updates).join(',')}`);
    }
    updateCurrentSide({
      elements: currentSideState.elements.map(el => el.id === id ? { ...el, ...updates } : el)
    });
  };

  const addText = () => {
    recordHistory();
    const newEl: ElementData = {
      id: Date.now().toString(),
      type: 'text',
      content: 'New Text',
      x: 100,
      y: 100,
      z: getNextZ(),
      color: defaultElementColor,
      fontSize: 20,
      opacity: 1
    };
    updateCurrentSide({ elements: [...currentSideState.elements, newEl] });
    setSelectedElementId(newEl.id);
  };

  const addIcon = (iconId: string) => {
    recordHistory();
    const newEl: ElementData = {
      id: Date.now().toString(),
      type: 'icon',
      iconId,
      x: 100,
      y: 100,
      z: getNextZ(),
      color: defaultElementColor,
      opacity: 1
    };
    updateCurrentSide({ elements: [...currentSideState.elements, newEl] });
    setSelectedElementId(newEl.id);
  };

  const addElementShape = (width: number, height: number, borderRadius: number | string) => {
    recordHistory();
    const newEl: ElementData = {
      id: Date.now().toString(),
      type: 'shape',
      x: 100,
      y: 100,
      z: getNextZ(),
      width,
      height,
      borderRadius: Number(borderRadius) || 0,
      color: defaultElementColor,
      opacity: 1
    };
    updateCurrentSide({ elements: [...currentSideState.elements, newEl] });
    setSelectedElementId(newEl.id);
  };

  const compressUploadedImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawData = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const MAX_DIM = 900;
          let { width, height } = img;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawData);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const isPng = file.type === 'image/png';
          let output = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.8);
          if (output.length > 500 * 1024) {
            output = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.65);
          }
          resolve(output);
        };
        img.onerror = () => resolve(rawData);
        img.src = rawData;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const targetSide = activeSide;
      const dataUrl = await compressUploadedImage(file);

      const prospectiveEl: ElementData = {
        id: Date.now().toString(),
        type: 'image',
        imageUrl: dataUrl,
        x: 50,
        y: 50,
        z: 1,
        width: 100,
        color: '#ffffff',
        opacity: 1
      };

      const prospectiveState = {
        ...cardData,
        [targetSide]: {
          ...cardData[targetSide],
          elements: [...cardData[targetSide].elements, prospectiveEl]
        }
      };

      // Check if whole design stays under 900 KB
      const totalDesignBytes = new Blob([JSON.stringify(prospectiveState)]).size;
      if (totalDesignBytes > 900 * 1024) {
        alert("This image is too large. Please upload a smaller one.");
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      recordHistoryRef.current();
      setCardData(prev => {
        const sideElements = prev[targetSide].elements;
        const nextZ = Math.max(0, ...sideElements.map(el => el.z || 0)) + 1;
        return {
          ...prev,
          [targetSide]: {
            ...prev[targetSide],
            elements: [...sideElements, { ...prospectiveEl, z: nextZ }],
          },
        };
      });
      setSelectedElementId(prospectiveEl.id);

      if (user) {
        const savedImage = await db.saveImage(user.id, dataUrl);
        setUserImages(prev => [savedImage, ...prev]);
      }
    } catch {
      alert("This image is too large. Please upload a smaller one.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveProjectName, setSaveProjectName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const executeSave = async (name: string) => {
    if (!user || !name.trim()) return;
    setIsSaving(true);
    try {
      const { toJpeg } = await import('html-to-image');
      let previewFront = '';
      let previewBack = '';
      const frontEl = document.getElementById('capture-front');
      const backEl = document.getElementById('capture-back');
      if (frontEl) {
        previewFront = await toJpeg(frontEl, { quality: 0.7, pixelRatio: 1, cacheBust: true });
      }
      if (backEl && productType !== 'board') {
        previewBack = await toJpeg(backEl, { quality: 0.7, pixelRatio: 1, cacheBust: true });
      }

      const projectId = searchParams.get('project');
      const materialName = selectedMaterial?.name || selectedMaterialId;

      if (projectId) {
        await db.updateDesign(user.id, projectId, {
          name: name.trim(),
          material: materialName,
          data: cardData,
          previewFront,
          previewBack,
          productType,
          orientation
        });
      } else {
        const saved = await db.saveDesign(user.id, {
          name: name.trim(),
          material: materialName,
          data: cardData,
          previewFront,
          previewBack,
          productType,
          orientation
        });
        searchParams.set('project', saved.id);
      }
      setShowSaveAccountOffer(false);
      setIsSaveModalOpen(false);
    } catch (err: any) {
      alert('Failed to save design: ' + (err?.message || 'Unknown error'));
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

  const executeAiCardGeneration = async (input: AiCardPromptInput) => {
    if (!user) {
      const friendly = 'Please sign in to generate a card with AI.';
      setAiError({ friendly });
      console.error('[AI Card Generation] User must be signed in to create an AI card.');
      return;
    }

    const controller = new AbortController();
    aiAbortControllerRef.current = controller;

    // 30-second timeout per requirement
    const timeoutId = setTimeout(() => {
      controller.abort('TIMEOUT');
    }, 30000);

    setIsGeneratingAI(true);
    setAiError(null);

    try {
      // Step 1: Read daily counter from Firestore
      let dailyUsage = 0;
      try {
        dailyUsage = await db.getDailyAiUsage(user.id);
      } catch (readErr: any) {
        console.error('[Firestore Counter Read Error]:', readErr);
        throw new Error("We couldn't check your daily quota. Please try again.");
      }

      if (dailyUsage >= DAILY_AI_LIMIT) {
        throw new Error("You've reached today's limit. Come back tomorrow.");
      }

      // Step 2: The Gemini call with 30s timeout and cancel signal
      const result = await generateCardWithAi(input, controller.signal);

      // Step 3: Apply the generated layout to the canvas
      try {
        recordHistoryRef.current('ai-generation');
        setCardData(result.cardData);
        setSelectedMaterialId(result.selectedMaterialId);
        setPlasticBgColors({
          front: result.cardData.front.bgColor,
          back: result.cardData.back.bgColor,
        });
        setHasGeneratedOnce(true);
      } catch (applyErr: any) {
        console.error('[Canvas Apply Error]:', applyErr);
        throw new Error("We couldn't create your card. Please try again.");
      }

      // Step 4: Increment daily usage in Firestore ONLY after successful generation & apply
      try {
        await db.incrementDailyAiUsage(user.id);
      } catch (incErr: any) {
        console.error('[Firestore Counter Increment Error]:', incErr);
      }
    } catch (err: any) {
      if (controller.signal.aborted) {
        if (controller.signal.reason === 'TIMEOUT' || String(err?.message || err).includes('taking too long')) {
          setAiError({
            friendly: 'This is taking too long. Please try again.',
          });
          return;
        }
        // User clicked cancel
        setAiError(null);
        return;
      }

      const rawMsg = err?.message || String(err || '');
      if (rawMsg.includes('taking too long') || rawMsg.includes('DEADLINE_EXCEEDED')) {
        setAiError({
          friendly: 'This is taking too long. Please try again.',
        });
        return;
      }

      if (rawMsg === 'USER_CANCELLED') {
        setAiError(null);
        return;
      }

      console.error('[AI Card Generation Full Error]:', err);

      let friendly = "We couldn't create your card. Please try again.";

      if (
        rawMsg.includes('busy right now') ||
        rawMsg.includes('500') ||
        rawMsg.includes('503') ||
        rawMsg.includes('429') ||
        rawMsg.includes('RESOURCE_EXHAUSTED') ||
        rawMsg.includes('high demand') ||
        rawMsg.includes('overloaded') ||
        rawMsg.includes('UNAVAILABLE')
      ) {
        friendly = 'Our AI is very busy right now. Please try again in a minute.';
      } else if (rawMsg.includes("today's limit")) {
        friendly = "You've reached today's limit. Come back tomorrow.";
      }

      setAiError({ friendly });
    } finally {
      clearTimeout(timeoutId);
      aiAbortControllerRef.current = null;
      setIsGeneratingAI(false);
      setPendingAiInput(null);
    }
  };

  const handleAiGenerate = async (input: AiCardPromptInput) => {
    setAiError(null);
    if (!user) {
      const friendly = 'Please sign in to generate a card with AI.';
      setAiError({ friendly });
      setIsAuthModalOpen(true);
      return;
    }

    const hasExistingDesign =
      cardData.front.elements.length > 0 || cardData.back.elements.length > 0;

    if (hasExistingDesign) {
      setPendingAiInput(input);
      setIsReplaceConfirmOpen(true);
      return;
    }

    await executeAiCardGeneration(input);
  };

  const moveZIndex = (id: string, direction: 'up' | 'down') => {
    const currentElements = [...currentSideState.elements].sort((a, b) => (a.z || 0) - (b.z || 0));
    const index = currentElements.findIndex(e => e.id === id);
    if (index === -1) return;

    if (direction === 'up' && index < currentElements.length - 1) {
      recordHistory();
      const temp = currentElements[index].z;
      currentElements[index].z = currentElements[index + 1].z;
      currentElements[index + 1].z = temp;
      updateCurrentSide({ elements: currentElements });
    } else if (direction === 'down' && index > 0) {
      recordHistory();
      const temp = currentElements[index].z;
      currentElements[index].z = currentElements[index - 1].z;
      currentElements[index - 1].z = temp;
      updateCurrentSide({ elements: currentElements });
    }
  };

  const removeElement = (id: string) => {
    recordHistory();
    updateCurrentSide({
      elements: currentSideState.elements.filter(el => el.id !== id)
    });
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const duplicateElement = (elId: string) => {
    const elToCopy = currentSideState.elements.find(e => e.id === elId);
    if (!elToCopy) return;
    recordHistory();
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
      if (isConfirmResetOpen && e.key === 'Escape') {
        setIsConfirmResetOpen(false);
        return;
      }

      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          undoRedoRef.current.handleRedo();
        } else {
          undoRedoRef.current.handleUndo();
        }
        return;
      }

      if ((document.activeElement as HTMLElement)?.isContentEditable) {
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
          recordHistoryRef.current();
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
        recordHistoryRef.current(`nudge-${selectedElementId}`);
        updateElement(selectedElementId, { x: el.x + dx, y: el.y + dy }, true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, currentSideState.elements, clipboard, isConfirmResetOpen]);

  const handleDownload = async () => {
    setSelectedElementId(null); // Clear selection borders

    // Small delay to ensure state updates (borders removed) before capturing
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const [{ jsPDF }, { toPng }] = await Promise.all([
        import('jspdf'),
        import('html-to-image')
      ]);
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

  const finishDrawingStroke = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPath.length > 1) {
      recordHistory();
      const pathData = `M ${currentPath.map(p => `${p.x} ${p.y}`).join(' L ')}`;
      const newEl: ElementData = {
        id: Date.now().toString(),
        type: 'drawing',
        x: 0,
        y: 0,
        z: getNextZ(),
        color: isPlastic ? drawColor : defaultElementColor,
        strokeWidth: drawThickness,
        drawTool,
        pathData,
        opacity: 1
      };
      updateCurrentSide({ elements: [...currentSideState.elements, newEl] });
    }
    setCurrentPath([]);
  };

  const handle3DPreview = async () => {
    setIsPreviewGenerating(true);
    setMousePos({ x: 0.5, y: 0.5, active: false });

    setTimeout(async () => {
      try {
        const { toPng } = await import('html-to-image');
        const options = { pixelRatio: 3, cacheBust: true };
        const frontCaptureEl = document.getElementById('capture-front');
        const backCaptureEl = document.getElementById('capture-back');

        if (!frontCaptureEl) {
          setIsPreviewGenerating(false);
          return;
        }

        const frontDataUrl = await toPng(frontCaptureEl, options);
        setPreviewFrontImage(frontDataUrl);

        if (productType !== 'board' && backCaptureEl) {
          const backDataUrl = await toPng(backCaptureEl, options);
          setPreviewBackImage(backDataUrl);
        } else {
          setPreviewBackImage(frontDataUrl);
        }

        setIsPreviewGenerating(false);
        setIsPreview3DOpen(true);
      } catch (error) {
        console.error("Error generating 3D preview:", error);
        setIsPreviewGenerating(false);
      }
    }, 100);
  };

  const selectedElement = currentSideState.elements.find(el => el.id === selectedElementId);

  const cardW = productType === 'board' ? 300 : orientation === 'horizontal' ? 428 : 270;
  const cardH = productType === 'board' ? 450 : orientation === 'horizontal' ? 270 : 428;

  const padX = canvasSize.width > 0 && canvasSize.width < 640 ? 40 : 96;
  const padY = canvasSize.height > 0 && canvasSize.height < 500 ? 88 : 128;
  const availW = canvasSize.width > 0 ? Math.max(120, canvasSize.width - padX) : cardW;
  const availH = canvasSize.height > 0 ? Math.max(120, canvasSize.height - padY) : cardH;
  const fitScale =
    canvasSize.width > 0 && canvasSize.height > 0
      ? Math.min(1.15, availW / cardW, availH / cardH)
      : 1;
  const effectiveScale = Math.max(0.2, fitScale * (zoom / 100));
  const effectiveZoom = effectiveScale * 100;

  const studioTabs = [
    { id: 'ai', icon: Sparkles, label: 'AI' },
    { id: 'templates', icon: LayoutTemplate, label: 'Templates' },
    { id: 'material', icon: Layers, label: productType === 'board' ? 'Board Color' : 'Material' },
    { id: 'background', icon: Palette, label: 'Color' },
    { id: 'elements', icon: Shapes, label: 'Elements' },
    { id: 'image', icon: ImageIcon, label: 'Uploads' },
    { id: 'draw', icon: PenTool, label: 'Draw' },
  ] as const;

  const activeTabLabel =
    activeTab === 'ai'
      ? 'Create your card with AI'
      : studioTabs.find((tab) => tab.id === activeTab)?.label || 'Tools';

  return (
    <section id="customizer" className="relative bg-[#050505] flex-1 h-full w-full overflow-hidden border-t border-white/10 flex flex-col select-none">
      {/* Top Toolbar */}
      <header className="flex items-center justify-between gap-1.5 sm:gap-2 px-2 sm:px-6 py-2.5 bg-[#111] border-b border-white/10 z-20 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <h1 className="hidden lg:block text-xs font-bold text-gray-500 uppercase tracking-[0.35em] shrink-0">
            Design Studio
          </h1>
          <div className="flex items-center bg-black/50 p-0.5 rounded-lg border border-white/10 shrink-0">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyPast.length === 0}
              title="Undo"
              aria-label="Undo"
              className={`p-1.5 rounded-md transition-colors ${
                historyPast.length > 0
                  ? 'text-white hover:bg-white/15 cursor-pointer'
                  : 'text-gray-600 opacity-40 cursor-not-allowed'
              }`}
            >
              <Undo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyFuture.length === 0}
              title="Redo"
              aria-label="Redo"
              className={`p-1.5 rounded-md transition-colors ${
                historyFuture.length > 0
                  ? 'text-white hover:bg-white/15 cursor-pointer'
                  : 'text-gray-600 opacity-40 cursor-not-allowed'
              }`}
            >
              <Redo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-1 sm:gap-2.5 flex-nowrap min-w-0">
          {productType !== 'board' && (
            <div className="flex bg-black/50 p-0.5 rounded-lg border border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => handleSwitchSide('front')}
                title="Front Side"
                aria-label="Front Side"
                className={`px-1.5 sm:px-3.5 py-1.5 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest transition-colors cursor-pointer ${
                  activeSide === 'front' ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Front
              </button>
              <button
                type="button"
                onClick={() => handleSwitchSide('back')}
                title="Back Side"
                aria-label="Back Side"
                className={`px-1.5 sm:px-3.5 py-1.5 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest transition-colors cursor-pointer ${
                  activeSide === 'back' ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Back
              </button>
            </div>
          )}

          {productType !== 'board' && (
            <div className="flex bg-black/50 p-0.5 rounded-lg border border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => handleOrientationChange('horizontal')}
                title="Horizontal Orientation"
                aria-label="Horizontal Orientation"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  orientation === 'horizontal' ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <RectangleHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => handleOrientationChange('vertical')}
                title="Vertical Orientation"
                aria-label="Vertical Orientation"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  orientation === 'vertical' ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <RectangleVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handle3DPreview}
            disabled={isPreviewGenerating}
            title="360° Preview"
            aria-label="360° Preview"
            className="p-2 min-[900px]:px-3.5 min-[900px]:py-2 bg-[#1a1a1a] border border-white/10 text-white hover:bg-white/10 hover:border-white/30 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            {isPreviewGenerating ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Box className="w-4 h-4 shrink-0" aria-hidden="true" />
            )}
            <span className="hidden min-[900px]:inline whitespace-nowrap">360° Preview</span>
          </button>

          <button
            type="button"
            onClick={handleSaveProjectClick}
            title={searchParams.get('project') ? 'Save' : 'Save Design'}
            aria-label="Save Design"
            className="p-2 min-[900px]:px-3.5 min-[900px]:py-2 bg-[#1a1a1a] border border-white/10 text-white hover:bg-white/10 hover:border-white/30 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4 shrink-0" aria-hidden="true" />
            )}
            <span className="hidden min-[900px]:inline whitespace-nowrap">
              {searchParams.get('project') ? 'Save' : 'Save Design'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            title="Download PDF"
            aria-label="Download PDF"
            className="p-2 min-[900px]:px-3.5 min-[900px]:py-2 bg-[#1a1a1a] border border-white/10 text-white hover:bg-white/10 hover:border-white/30 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="hidden min-[900px]:inline whitespace-nowrap">Download</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOrderModalOpen(true)}
            title="Order this card"
            aria-label="Order this card"
            className="px-2.5 sm:px-5 py-1.5 sm:py-2 bg-white text-black hover:bg-gray-200 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest rounded-md transition-colors flex items-center shrink-0 whitespace-nowrap cursor-pointer"
          >
            Order this card
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-[900px]:flex-row overflow-hidden relative">

        {/* Tool Navigation Rail (Left sidebar >= 900px, bottom bar < 900px) */}
        <div className="order-3 min-[900px]:order-1 w-full min-[900px]:w-[76px] min-[900px]:h-full bg-[#111] flex flex-row min-[900px]:flex-col items-center justify-around min-[900px]:justify-start py-1.5 min-[900px]:py-4 px-1 min-[900px]:px-0 border-t min-[900px]:border-t-0 min-[900px]:border-r border-white/10 min-[900px]:space-y-1 z-30 shrink-0 overflow-x-auto">
          {studioTabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setIsBottomSheetOpen(true);
              }}
              title={tab.label}
              className={`flex flex-col items-center justify-center px-2.5 min-[900px]:px-0 min-[900px]:w-full py-2 min-[900px]:py-3.5 transition-colors relative shrink-0 cursor-pointer ${
                activeTab === tab.id ? 'text-white bg-white/5' : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {activeTab === tab.id && (
                <div className="hidden min-[900px]:block absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-md" />
              )}
              <tab.icon className="w-4 h-4 min-[900px]:w-5 min-[900px]:h-5 mb-1 min-[900px]:mb-1.5" aria-hidden="true" />
              <span className="text-[9px] uppercase tracking-wider font-bold">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Context Drawer: Left Side Panel (>= 900px) / Bottom Sheet (< 900px) */}
        <div className="order-2 min-[900px]:order-2 w-full min-[900px]:w-[300px] min-[900px]:h-full bg-[#151515] border-t min-[900px]:border-t-0 min-[900px]:border-r border-white/10 flex flex-col shrink-0 z-20">
          {/* Bottom Sheet Handle & Toggle Header (< 900px) */}
          <div className="flex min-[900px]:hidden items-center justify-between px-4 py-2 border-b border-white/10 bg-[#151515] shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-widest text-white">
              {activeTabLabel}
            </span>
            <button
              type="button"
              onClick={() => setIsBottomSheetOpen(prev => !prev)}
              aria-label={isBottomSheetOpen ? 'Collapse tools panel' : 'Expand tools panel'}
              aria-expanded={isBottomSheetOpen}
              className="text-gray-400 hover:text-white p-1 transition-colors cursor-pointer"
            >
              {isBottomSheetOpen ? (
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
              ) : (
                <ChevronUp className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>

          <div
            className={`overflow-hidden transition-[height] duration-300 ease-out min-[900px]:flex-1 min-[900px]:h-full ${
              isBottomSheetOpen ? 'max-[899px]:h-[36vh] max-[899px]:max-h-[320px]' : 'max-[899px]:h-0'
            }`}
          >
            <div className="h-full p-5 overflow-y-auto custom-scrollbar">
              {/* Selected Element Settings */}
              {selectedElementId && selectedElement && (
                <div className="pb-5 mb-6 border-b border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs uppercase tracking-widest font-bold text-white">Element Settings</h2>
                    <button
                      type="button"
                      onClick={() => setSelectedElementId(null)}
                      className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-white cursor-pointer"
                    >
                      Done
                    </button>
                  </div>

                  <div className="space-y-4">
                    {selectedElement.type === 'text' && (
                      <div className="grid grid-cols-3 gap-2">
                        <button type="button" onClick={() => updateElement(selectedElement.id, { textTransform: 'none' })} className={`p-2 rounded border text-xs transition-all cursor-pointer ${(!selectedElement.textTransform || selectedElement.textTransform === 'none') ? 'bg-white/20 border-white text-white' : 'border-white/10 text-gray-500 hover:text-white'}`}>Aa</button>
                        <button type="button" onClick={() => updateElement(selectedElement.id, { textTransform: 'lowercase' })} className={`p-2 rounded border text-xs transition-all cursor-pointer ${selectedElement.textTransform === 'lowercase' ? 'bg-white/20 border-white text-white' : 'border-white/10 text-gray-500 hover:text-white'}`}>aa</button>
                        <button type="button" onClick={() => updateElement(selectedElement.id, { textTransform: 'uppercase' })} className={`p-2 rounded border text-xs transition-all cursor-pointer ${selectedElement.textTransform === 'uppercase' ? 'bg-white/20 border-white text-white' : 'border-white/10 text-gray-500 hover:text-white'}`}>AA</button>
                      </div>
                    )}

                    {selectedElement.type === 'icon' && (
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gray-500">Change Icon</label>
                        <div className="flex flex-wrap gap-2">
                          {ICONS.slice(0, 12).map(({ id, component: IconComponent }) => (
                            <button type="button" key={id} onClick={() => updateElement(selectedElement.id, { iconId: id })} className={`p-2 rounded-lg transition-all cursor-pointer ${selectedElement.iconId === id ? 'bg-white/20 text-white' : 'bg-black/50 text-gray-500 hover:text-white'}`}>
                              <IconComponent className="w-4 h-4" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedElement.type === 'shape' && (
                      <>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-bold mb-1.5 text-gray-500 flex justify-between">
                            <span>Width</span><span>{selectedElement.width || 100}px</span>
                          </label>
                          <input type="range" min="20" max="400" value={selectedElement.width || 100} onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) })} className="w-full accent-white" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-bold mb-1.5 text-gray-500 flex justify-between">
                            <span>Height</span><span>{selectedElement.height || 100}px</span>
                          </label>
                          <input type="range" min="20" max="400" value={selectedElement.height || 100} onChange={(e) => updateElement(selectedElement.id, { height: parseInt(e.target.value) })} className="w-full accent-white" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-bold mb-1.5 text-gray-500 flex justify-between">
                            <span>Roundness</span><span>{selectedElement.borderRadius || 0}px</span>
                          </label>
                          <input type="range" min="0" max="200" value={selectedElement.borderRadius || 0} onChange={(e) => updateElement(selectedElement.id, { borderRadius: parseInt(e.target.value) })} className="w-full accent-white" />
                        </div>
                      </>
                    )}

                    {selectedElement.type === 'image' && (
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold mb-1.5 text-gray-500 flex justify-between">
                          <span>Width</span><span>{selectedElement.width || 100}px</span>
                        </label>
                        <input type="range" min="20" max="300" value={selectedElement.width || 100} onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) })} className="w-full accent-white" />
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold mb-1.5 text-gray-500 flex justify-between">
                        <span>Opacity</span><span>{Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
                      </label>
                      <input type="range" min="0" max="1" step="0.05" value={selectedElement.opacity ?? 1} onChange={(e) => updateElement(selectedElement.id, { opacity: parseFloat(e.target.value) })} className="w-full accent-white" />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold mb-1.5 text-gray-500 flex justify-between">
                        <span>Rotation</span><span>{selectedElement.rotation || 0}°</span>
                      </label>
                      <input type="range" min="0" max="360" value={selectedElement.rotation || 0} onChange={(e) => updateElement(selectedElement.id, { rotation: parseInt(e.target.value) })} className="w-full accent-white" />
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'ai' && (
                <div className="animate-in fade-in slide-in-from-left-4">
                  <h2 className="text-lg font-serif text-white mb-1">
                    Create your card with AI
                  </h2>
                  <p className="text-xs text-gray-400 mb-6">
                    Answer a few quick questions and Gemini will generate a custom layout for your NFC card.
                  </p>
                  <AiCardGeneratorTab
                    user={user}
                    onAuthClick={() => setIsAuthModalOpen(true)}
                    onGenerate={handleAiGenerate}
                    onCancel={handleCancelAi}
                    isGenerating={isGeneratingAI}
                    hasGeneratedOnce={hasGeneratedOnce}
                    aiError={aiError}
                    onClearAiError={() => setAiError(null)}
                    isReplaceConfirmOpen={isReplaceConfirmOpen}
                  />
                </div>
              )}
              {activeTab === 'material' && (
              <div className="animate-in fade-in slide-in-from-left-4">
                <h2 className="text-lg font-serif text-white mb-1">
                  {productType === 'board' ? 'Board Color' : 'Card Material'}
                </h2>
                <p className="text-xs text-gray-400 mb-6">
                  {productType === 'board' ? 'Choose your board color' : 'Choose your card texture and finish'}
                </p>

                {productType === 'board' ? (
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedMaterialId === 'board-white' && currentSideState.bgColor === '#ffffff') return;
                        recordHistory();
                        setSelectedMaterialId('board-white');
                        updateCurrentSide({ bgColor: '#ffffff' });
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden group cursor-pointer ${selectedMaterialId === 'board-white' ? 'bg-white/10 border-white ring-1 ring-white/30' : 'bg-[#1a1a1a] border-white/5 hover:border-white/20 hover:bg-white/5'}`}
                    >
                      <div className="flex items-center space-x-3 mb-1">
                        <div className="w-6 h-6 rounded-full bg-white border border-white/20"></div>
                        <span className="text-sm font-bold text-white">White Board</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Clean, bright white plastic display board.</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedMaterialId === 'board-black' && currentSideState.bgColor === '#151515') return;
                        recordHistory();
                        setSelectedMaterialId('board-black');
                        updateCurrentSide({ bgColor: '#151515' });
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden group cursor-pointer ${selectedMaterialId === 'board-black' ? 'bg-white/10 border-white ring-1 ring-white/30' : 'bg-[#1a1a1a] border-white/5 hover:border-white/20 hover:bg-white/5'}`}
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
                            type="button"
                            key={material.id}
                            onClick={() => handleSelectMaterial(material)}
                            className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden group cursor-pointer ${isSelected ? 'bg-white/10 border-white ring-1 ring-white/30' : 'bg-[#1a1a1a] border-white/5 hover:border-white/20 hover:bg-white/5'}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2.5">
                                <div className="w-6 h-6 rounded-full border border-white/20 shadow-md relative overflow-hidden shrink-0" style={{ background: material.previewBg }}>
                                  {material.sheenOverlay && (
                                    <div className="absolute inset-0 opacity-80" style={{ background: material.sheenOverlay }}></div>
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
                <h2 className="text-lg font-serif text-white mb-6">Drawing Tools</h2>

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
                  <h3 className="text-sm font-bold text-white mb-4">Color</h3>
                  {!isPlastic ? (
                    <p className="text-xs text-gray-400 bg-[#1a1a1a] border border-white/10 rounded-xl p-3.5 leading-relaxed">
                      Metal and wood cards are laser engraved. Colours are available on plastic cards.
                    </p>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>

                <StartFromScratchAction onClick={handleStartFromScratchClick} />
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="animate-in fade-in slide-in-from-left-4">
                <h2 className="text-lg font-serif text-white mb-6">Templates</h2>
                <div className="space-y-4">
                  {TEMPLATES.map(template => (
                    <button
                      type="button"
                      key={template.id}
                      onClick={() => {
                        recordHistory();
                        setPlasticBgColors({
                          front: template.cardData.front.bgColor,
                          back: template.cardData.back.bgColor,
                        });
                        if (!isPlastic && selectedMaterial) {
                          setCardData({
                            front: { ...template.cardData.front, bgColor: selectedMaterial.bgColor },
                            back: { ...template.cardData.back, bgColor: selectedMaterial.bgColor },
                          });
                        } else {
                          setCardData(template.cardData);
                        }
                        setSelectedElementId(null);
                      }}
                      className="w-full flex flex-col items-center p-3 bg-[#1a1a1a] hover:bg-white/10 border border-white/10 rounded-xl transition-all text-left cursor-pointer"
                    >
                      <div className="mb-3 flex items-center justify-center w-full">
                        <CardPreview
                          sideState={template.cardData.front}
                          orientation="horizontal"
                          material={productType === 'board' ? null : selectedMaterial}
                          width={236}
                        />
                      </div>
                      <span className="text-sm font-bold text-white w-full">{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'background' && (
              <div className="animate-in fade-in slide-in-from-left-4">
                <h2 className="text-lg font-serif text-white mb-6">Background Color</h2>

                {!isPlastic && (
                  <p className="mb-6 text-xs text-gray-300 bg-[#1a1a1a] border border-white/10 rounded-xl p-4 leading-relaxed">
                    Metal and wood cards are laser engraved. Colours are available on plastic cards.
                  </p>
                )}

                <div
                  aria-disabled={!isPlastic}
                  className={!isPlastic ? 'opacity-35 pointer-events-none select-none' : ''}
                >
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-white mb-4">Document colors</h3>
                    <div className="flex items-center">
                      <label className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-all overflow-hidden relative shadow-sm" style={{ background: 'conic-gradient(from 90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)', padding: '2px' }}>
                        <div className="w-full h-full bg-[#151515] rounded-full flex items-center justify-center">
                          <span className="text-white text-xl font-light mb-1">+</span>
                        </div>
                        <input
                          type="color"
                          disabled={!isPlastic}
                          tabIndex={isPlastic ? 0 : -1}
                          value={currentSideState.bgColor}
                          onChange={(e) => {
                            if (!isPlastic) return;
                            const val = e.target.value;
                            recordHistory('bg-color-input');
                            updateCurrentSide({ bgColor: val });
                            setPlasticBgColors(prev => ({ ...prev, [activeSide]: val }));
                          }}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white mb-4">Default solid colors</h3>
                    <div className="grid grid-cols-6 gap-2">
                      {CANVA_COLORS.map((c) => (
                        <button
                          type="button"
                          key={c}
                          disabled={!isPlastic}
                          tabIndex={isPlastic ? 0 : -1}
                          onClick={() => {
                            if (!isPlastic || currentSideState.bgColor === c) return;
                            recordHistory();
                            updateCurrentSide({ bgColor: c });
                            setPlasticBgColors(prev => ({ ...prev, [activeSide]: c }));
                          }}
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
                </div>

                <StartFromScratchAction onClick={handleStartFromScratchClick} />
              </div>
            )}

            {activeTab === 'elements' && (
              <div className="animate-in fade-in slide-in-from-left-4">
                <h2 className="text-lg font-serif text-white mb-6">Elements</h2>

                <button type="button" onClick={() => setIsShapesOpen(!isShapesOpen)} className="w-full flex items-center justify-between text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest hover:text-white transition-colors cursor-pointer">
                  <span>Shapes</span>
                  {isShapesOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {isShapesOpen && (
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    <button type="button" onClick={() => addElementShape(100, 100, 0)} className="aspect-square flex items-center justify-center bg-[#1a1a1a] hover:bg-white/10 border border-white/5 rounded-xl transition-all cursor-pointer">
                      <div className="w-10 h-10 bg-white"></div>
                    </button>
                    <button type="button" onClick={() => addElementShape(100, 100, 16)} className="aspect-square flex items-center justify-center bg-[#1a1a1a] hover:bg-white/10 border border-white/5 rounded-xl transition-all cursor-pointer">
                      <div className="w-10 h-10 bg-white rounded-lg"></div>
                    </button>
                    <button type="button" onClick={() => addElementShape(100, 100, '50%')} className="aspect-square flex items-center justify-center bg-[#1a1a1a] hover:bg-white/10 border border-white/5 rounded-xl transition-all cursor-pointer">
                      <div className="w-10 h-10 bg-white rounded-full"></div>
                    </button>
                    <button type="button" onClick={() => addElementShape(160, 50, 9999)} className="aspect-square flex items-center justify-center bg-[#1a1a1a] hover:bg-white/10 border border-white/5 rounded-xl transition-all cursor-pointer">
                      <div className="w-16 h-5 bg-white rounded-full"></div>
                    </button>
                    <button type="button" onClick={() => addElementShape(200, 4, 0)} className="aspect-square flex items-center justify-center bg-[#1a1a1a] hover:bg-white/10 border border-white/5 rounded-xl transition-all cursor-pointer">
                      <div className="w-16 h-1 bg-white"></div>
                    </button>
                    <button type="button" onClick={() => addElementShape(4, 200, 0)} className="aspect-square flex items-center justify-center bg-[#1a1a1a] hover:bg-white/10 border border-white/5 rounded-xl transition-all cursor-pointer">
                      <div className="w-1 h-16 bg-white"></div>
                    </button>
                  </div>
                )}

                <button type="button" onClick={() => setIsTextOpen(!isTextOpen)} className="w-full flex items-center justify-between text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest hover:text-white transition-colors cursor-pointer">
                  <span>Text</span>
                  {isTextOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {isTextOpen && (
                  <div className="mb-8">
                    <button type="button" onClick={addText} className="w-full flex flex-col items-center justify-center py-8 bg-[#1a1a1a] hover:bg-white/5 border border-white/10 rounded-xl transition-all group cursor-pointer">
                      <Type className="w-8 h-8 text-gray-400 mb-3 group-hover:text-white transition-colors" />
                      <span className="text-sm font-bold text-white">Add a text box</span>
                    </button>
                  </div>
                )}

                <button type="button" onClick={() => setIsIconsOpen(!isIconsOpen)} className="w-full flex items-center justify-between text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest hover:text-white transition-colors cursor-pointer">
                  <span>Icons</span>
                  {isIconsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {isIconsOpen && (
                  <div className="grid grid-cols-4 gap-2">
                    {ICONS.map(({ id, label, component: IconComponent }) => (
                      <button
                        type="button"
                        key={id}
                        onClick={() => addIcon(id)}
                        className="aspect-square flex items-center justify-center bg-[#1a1a1a] hover:bg-white/10 border border-white/5 rounded-xl transition-all text-gray-400 hover:text-white cursor-pointer"
                        title={label}
                      >
                        <IconComponent className="w-6 h-6" />
                      </button>
                    ))}
                  </div>
                )}

                <StartFromScratchAction onClick={handleStartFromScratchClick} />
              </div>
            )}

            {activeTab === 'image' && (
              <div className="animate-in fade-in slide-in-from-left-4">
                <h2 className="text-lg font-serif text-white mb-6">Uploads</h2>
                <button onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center py-10 border-2 border-dashed border-white/20 hover:border-white/40 bg-white/5 rounded-xl transition-all text-gray-400 hover:text-white group mb-6">
                  <ImageIcon className="w-8 h-8 mb-3" />
                  <span className="text-xs font-bold uppercase tracking-widest">Upload Image</span>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                </button>

                {user && userImages.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-gray-500">Your Library</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {userImages.map(img => (
                        <button
                          key={img.id}
                          onClick={() => {
                            recordHistory();
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
                          <img src={img.url} alt="Uploaded library asset" width={100} height={100} loading="lazy" className="max-w-full max-h-full object-contain pointer-events-none" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {!user && (
                  <p className="text-[10px] text-center text-gray-500 mt-4">Sign in to save uploads to your account library.</p>
                )}

                <StartFromScratchAction onClick={handleStartFromScratchClick} />
              </div>
            )}

          </div>
          </div>
        </div>

        {/* Central Canvas Area */}
        <div
          ref={canvasAreaRef}
          className="order-1 min-[900px]:order-3 flex-1 min-w-0 min-h-0 bg-[#0a0a0a] relative flex items-center justify-center overflow-hidden"
          onClick={() => setSelectedElementId(null)}
        >
          {showSaveAccountOffer && user && !searchParams.get('project') && (
            <div
              className="absolute top-3 left-4 right-4 z-40 bg-[#161616]/95 border border-white/20 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-2xl backdrop-blur-md"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-xs text-white">
                You have an unsaved design from this browser. Would you like to save it to your account?
              </span>
              <div className="flex items-center space-x-2 shrink-0 ml-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSaveAccountOffer(false);
                    handleSaveProjectClick();
                  }}
                  className="px-3.5 py-1.5 bg-white text-black text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Save to Account
                </button>
                <button
                  type="button"
                  onClick={() => setShowSaveAccountOffer(false)}
                  className="text-gray-400 hover:text-white px-2 py-1 text-xs transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Top Context Toolbar (Canva-style) */}
          {selectedElementId && selectedElement && (
            <div
              className="absolute top-3 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100%-1.5rem)] bg-[#1a1a1a] border border-white/20 rounded-xl px-3 py-1.5 flex flex-wrap items-center justify-center gap-2 sm:gap-3 shadow-2xl animate-in fade-in slide-in-from-top-4"
              onClick={(e) => e.stopPropagation()}
            >

              {selectedElement.type === 'text' && (
                <>
                  <FontPicker
                    value={selectedElement.fontFamily || 'var(--font-serif)'}
                    onChange={(val) => updateElement(selectedElement.id, { fontFamily: val })}
                  />
                  <div className="flex items-center space-x-1.5 border-r border-white/20 pr-3">
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

              {isPlastic && selectedElement.type !== 'image' && (
                <div className="flex items-center border-r border-white/20 pr-3">
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

              <div className="flex items-center space-x-1 border-r border-white/20 pr-3">
                <button type="button" onClick={() => moveZIndex(selectedElement.id, 'up')} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10" title="Bring Forward" aria-label="Bring Forward"><ArrowUp className="w-4 h-4" /></button>
                <button type="button" onClick={() => moveZIndex(selectedElement.id, 'down')} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10" title="Send Backward" aria-label="Send Backward"><ArrowDown className="w-4 h-4" /></button>
              </div>

              <div className="flex items-center space-x-1">
                <button type="button" onClick={() => duplicateElement(selectedElement.id)} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10" title="Duplicate" aria-label="Duplicate"><Copy className="w-4 h-4" /></button>
                <button type="button" onClick={() => removeElement(selectedElement.id)} className="p-1.5 text-red-400 hover:text-red-300 rounded hover:bg-white/10" title="Delete" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {/* Mini Preview of Inactive Side (>= 900px corner thumbnail, never covers card) */}
          {productType !== 'board' && (
            <div
              className="hidden min-[900px]:block absolute top-3 right-3 z-30 group cursor-pointer border border-white/15 hover:border-white/40 rounded-lg overflow-hidden shadow-xl bg-[#111] transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleSwitchSide(activeSide === 'front' ? 'back' : 'front');
              }}
              title={`Switch to ${activeSide === 'front' ? 'Back' : 'Front'}`}
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
                <span className="text-white text-[8px] font-bold uppercase tracking-widest bg-black/80 px-1.5 py-0.5 rounded relative z-10 whitespace-nowrap text-center leading-tight">
                  {activeSide === 'front' ? 'Back' : 'Front'}
                </span>
              </div>
              <CardPreview
                sideState={cardData[activeSide === 'front' ? 'back' : 'front']}
                orientation={orientation}
                productType={productType}
                material={selectedMaterial}
                width={orientation === 'horizontal' ? 104 : 68}
                className="border-0 rounded-none"
              />
            </div>
          )}

          {/* Auto-Fit Centered Card Wrapper */}
          <div
            className="relative shrink-0"
            style={{
              width: `${cardW * effectiveScale}px`,
              height: `${cardH * effectiveScale}px`,
              transition: 'width 0.15s ease-out, height 0.15s ease-out',
            }}
          >
            <div
              style={{
                width: `${cardW}px`,
                height: `${cardH}px`,
                transform: `scale(${effectiveScale})`,
                transformOrigin: 'top left',
                transition: 'transform 0.15s ease-out',
              }}
            >
              {/* Card Container */}
              <div
                ref={containerRef}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                className="relative shrink-0 perspective-1000 cursor-pointer"
                style={{
                  width: `${cardW}px`,
                  height: `${cardH}px`,
                  perspective: '1200px',
                }}
              >
              <motion.div
                key={isPreviewGenerating ? 'generating' : `${activeSide}-${orientation}`}
                initial={isPreviewGenerating ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: isPreviewGenerating ? 0 : 0.25, ease: "easeOut" }}
                className="absolute inset-0 rounded-2xl transition-all duration-300 z-10 overflow-hidden border border-white/10"
                style={{
                  backgroundColor: isEngraved && selectedMaterial ? selectedMaterial.bgColor : currentSideState.bgColor,
                  boxShadow: selectedMaterial?.shadowStyle || '0 30px 60px -15px rgba(0, 0, 0, 0.85)',
                  transform: mousePos.active
                    ? `rotateY(${(mousePos.x - 0.5) * 18}deg) rotateX(${(0.5 - mousePos.y) * 18}deg)`
                    : 'rotateY(0deg) rotateX(0deg)',
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Material Texture & Sheen Overlay */}
                {selectedMaterial && (isEngraved || currentSideState.bgColor === selectedMaterial.bgColor) && (
                  <>
                    <div
                      className="absolute inset-0 pointer-events-none transition-all duration-500 z-0"
                      style={{
                        background: selectedMaterial.previewBg,
                        mixBlendMode: 'normal',
                        opacity: 1
                      }}
                    />
                    {selectedMaterial.sheenOverlay && (
                      <div
                        className="absolute inset-0 pointer-events-none z-0"
                        style={{
                          background: selectedMaterial.sheenOverlay,
                          mixBlendMode: isWoodEngraved ? 'normal' : 'overlay',
                          opacity: isWoodEngraved ? 1 : 0.6
                        }}
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
                      onUpdatePosition={(id: string, x: number, y: number) => {
                        if (el.x === x && el.y === y) return;
                        recordHistory();
                        updateElement(id, { x, y }, true);
                      }}
                      onUpdateElement={(id: string, updates: Partial<ElementData>) => updateElement(id, updates)}
                      IconComp={IconComp}
                      isDrawMode={activeTab === 'draw'}
                      isEraser={isEraser}
                      onRemove={removeElement}
                      setSnapGuides={setSnapGuides}
                      orientation={orientation}
                      zoom={effectiveZoom}
                      material={selectedMaterial}
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
                      const x = (e.clientX - rect.left) / effectiveScale;
                      const y = (e.clientY - rect.top) / effectiveScale;
                      setIsDrawing(true);
                      setCurrentPath([{ x, y }]);
                    }}
                    onPointerMove={(e) => {
                      if (!isDrawing) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = (e.clientX - rect.left) / effectiveScale;
                      const y = (e.clientY - rect.top) / effectiveScale;
                      setCurrentPath(prev => [...prev, { x, y }]);
                    }}
                    onPointerUp={finishDrawingStroke}
                    onPointerLeave={finishDrawingStroke}
                  >
                    {isDrawing && currentPath.length > 0 && (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                        <path
                          d={`M ${currentPath.map(p => `${p.x} ${p.y}`).join(' L ')}`}
                          stroke={effectiveDrawColor}
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

                {/* AI Generation Loading Overlay on Card */}
                {isGeneratingAI && (
                  <div className="absolute inset-0 z-[110] bg-black/80 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-200">
                    <div className="w-9 h-9 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3" />
                    <span className="text-white font-semibold text-xs tracking-wider uppercase">
                      Creating your card... this takes a few seconds.
                    </span>
                    <button
                      type="button"
                      onClick={handleCancelAi}
                      className="mt-4 px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-medium transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </motion.div>
              </div>
            </div>
          </div>

          {/* Zoom UI Control */}
          <div className="absolute bottom-3 right-3 flex items-center bg-[#151515] border border-white/10 px-3 py-1.5 rounded-full shadow-2xl z-30">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-2.5"></div>
            <input
              type="range"
              min="50"
              max="150"
              value={zoom}
              onChange={(e) => setZoom(parseInt(e.target.value))}
              aria-label="Zoom level"
              className="w-20 sm:w-28 accent-white h-1.5 bg-gray-600 rounded-full appearance-none cursor-pointer"
            />
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 ml-2.5 mr-3"></div>
            <span className="text-white text-xs font-bold w-10 text-right">{zoom}%</span>
          </div>
        </div>
      </div>

      {/* Hidden Capture Area for Downloads, 360° Preview & Order Requests */}
      <div aria-hidden="true" className="fixed top-[-9999px] left-[-9999px] z-[-10] pointer-events-none opacity-100">
        {(['front', 'back'] as Side[]).map(side => (
          <div key={side} id={`capture-${side}`}>
            <CardPreview
              sideState={cardData[side]}
              orientation={orientation}
              productType={productType}
              material={selectedMaterial}
              width={cardW}
              className="border-0 rounded-2xl"
            />
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
        frontImage={previewFrontImage}
        backImage={previewBackImage}
        productType={productType}
        orientation={orientation}
        boardColor={productType === 'board' ? (MATERIALS.find(m => m.id === selectedMaterialId)?.bgColor || '#111') : currentSideState.bgColor}
      />

      {/* Order Card Request Modal */}
      <OrderCardModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        cardData={cardData}
        orientation={orientation}
        productType={productType}
        selectedMaterial={selectedMaterial}
        defaultName={user?.name}
        defaultEmail={user?.email}
      />

      {/* AI Replacement Confirmation Dialog */}
      <AnimatePresence>
        {isReplaceConfirmOpen && (
          <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0a0a] border border-white/15 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative"
            >
              <h3 className="text-base font-bold text-white mb-2">
                Replace your current design?
              </h3>
              <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                Generating a new card will replace the elements currently on the canvas. You can always use Undo to restore your previous design.
              </p>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsReplaceConfirmOpen(false);
                    setPendingAiInput(null);
                  }}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const toGenerate = pendingAiInput;
                    setIsReplaceConfirmOpen(false);
                    if (toGenerate) {
                      await executeAiCardGeneration(toGenerate);
                    }
                  }}
                  className="flex-1 py-2.5 bg-white hover:bg-gray-200 text-black rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Yes, replace
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auth Modal for unauthenticated users clicking sign in */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            setIsAuthModalOpen(false);
            setUser(db.getCurrentUser());
          }}
        />
      )}

      {/* Start from Scratch Confirmation Dialog */}
      {isConfirmResetOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setIsConfirmResetOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-confirm-title"
        >
          <div
            className="bg-[#0a0a0a] border border-white/15 rounded-2xl w-full max-w-sm p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p id="reset-confirm-title" className="text-sm text-white leading-relaxed mb-6">
              Start from scratch? Your current design will be deleted.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmResetOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-gray-300 border border-white/15 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmStartFromScratch}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-white text-black hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Yes, start over
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
