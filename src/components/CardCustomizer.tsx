import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue } from 'motion/react';
import { toPng } from 'html-to-image';
import {
  SmartphoneNfc, Star, Utensils, Wifi, Type, Trash2, RectangleHorizontal, RectangleVertical, Image as ImageIcon, Square, ArrowUp, ArrowDown, ChevronDown, ChevronRight,
  Waves, Coffee, ShoppingBag, Heart, User, MapPin, Phone, Mail, Globe, Instagram, Facebook, Twitter, Linkedin, Github, MessageCircle, Music, Video, Camera, Anchor, Zap, Shield, Sun, Moon, Cloud, Droplet, Hexagon, Triangle, Circle, Shapes,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, LayoutTemplate, Palette, PenTool, Eraser, Highlighter,
  Youtube, Twitch, Dribbble, Figma, Slack, Check, X, Plus, Minus, ThumbsUp, ThumbsDown, Bookmark, Link, Share2, Search, Bell, Settings, Home, Calendar, Clock, Smile, Eye, EyeOff, Menu, Filter, Copy, Clipboard, Download, Upload,
  Briefcase, CreditCard, Tag, Truck, Gift, Key, Monitor, Laptop, Smartphone, Tablet, Watch, Headphones, Speaker, Battery, Database, HardDrive, Printer, Server, Mouse,
  Plane, Car, Bus, Train, Compass, Navigation, Umbrella, AlertCircle, AlertTriangle, CheckCircle, Info, Lock, Unlock
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

const CANVA_COLORS = [
  // Grays
  '#000000', '#545454', '#737373', '#A6A6A6', '#D9D9D9', '#FFFFFF',
  // Reds & Purples
  '#FF3131', '#FF5757', '#FF66C4', '#CB6CE6', '#8C52FF', '#5E17EB',
  // Blues
  '#03989E', '#00CBCE', '#5CE1E6', '#38B6FF', '#5271FF', '#004AAD',
  // Greens & Oranges
  '#00BF63', '#7ED957', '#C1FF72', '#FFDE59', '#FFBD59', '#FF914D'
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
  // Social & Brand
  { id: 'youtube', label: 'YouTube', component: Youtube },
  { id: 'twitch', label: 'Twitch', component: Twitch },
  { id: 'dribbble', label: 'Dribbble', component: Dribbble },
  { id: 'figma', label: 'Figma', component: Figma },
  { id: 'slack', label: 'Slack', component: Slack },
  // UI & Actions
  { id: 'check', label: 'Check', component: Check },
  { id: 'x', label: 'Cross', component: X },
  { id: 'plus', label: 'Plus', component: Plus },
  { id: 'minus', label: 'Minus', component: Minus },
  { id: 'thumbsup', label: 'Thumbs Up', component: ThumbsUp },
  { id: 'thumbsdown', label: 'Thumbs Down', component: ThumbsDown },
  { id: 'bookmark', label: 'Bookmark', component: Bookmark },
  { id: 'link', label: 'Link', component: Link },
  { id: 'share', label: 'Share', component: Share2 },
  { id: 'search', label: 'Search', component: Search },
  { id: 'bell', label: 'Bell', component: Bell },
  { id: 'settings', label: 'Settings', component: Settings },
  { id: 'home', label: 'Home', component: Home },
  { id: 'calendar', label: 'Calendar', component: Calendar },
  { id: 'clock', label: 'Clock', component: Clock },
  { id: 'smile', label: 'Smile', component: Smile },
  { id: 'eye', label: 'Eye', component: Eye },
  { id: 'eyeoff', label: 'Eye Off', component: EyeOff },
  { id: 'filter', label: 'Filter', component: Filter },
  { id: 'copy', label: 'Copy', component: Copy },
  { id: 'clipboard', label: 'Clipboard', component: Clipboard },
  { id: 'download', label: 'Download', component: Download },
  { id: 'upload', label: 'Upload', component: Upload },
  // Business & Commerce
  { id: 'briefcase', label: 'Briefcase', component: Briefcase },
  { id: 'creditcard', label: 'Card', component: CreditCard },
  { id: 'tag', label: 'Tag', component: Tag },
  { id: 'truck', label: 'Truck', component: Truck },
  { id: 'gift', label: 'Gift', component: Gift },
  { id: 'key', label: 'Key', component: Key },
  // Tech & Devices
  { id: 'monitor', label: 'Monitor', component: Monitor },
  { id: 'laptop', label: 'Laptop', component: Laptop },
  { id: 'smartphone', label: 'Phone 2', component: Smartphone },
  { id: 'tablet', label: 'Tablet', component: Tablet },
  { id: 'watch', label: 'Watch', component: Watch },
  { id: 'headphones', label: 'Headphones', component: Headphones },
  { id: 'speaker', label: 'Speaker', component: Speaker },
  { id: 'battery', label: 'Battery', component: Battery },
  { id: 'database', label: 'Database', component: Database },
  { id: 'harddrive', label: 'Drive', component: HardDrive },
  { id: 'printer', label: 'Printer', component: Printer },
  { id: 'server', label: 'Server', component: Server },
  { id: 'mouse', label: 'Mouse', component: Mouse },
  // Travel & Location
  { id: 'plane', label: 'Plane', component: Plane },
  { id: 'car', label: 'Car', component: Car },
  { id: 'bus', label: 'Bus', component: Bus },
  { id: 'train', label: 'Train', component: Train },
  { id: 'compass', label: 'Compass', component: Compass },
  { id: 'navigation', label: 'Nav', component: Navigation },
  { id: 'umbrella', label: 'Umbrella', component: Umbrella },
  // Status & Alerts
  { id: 'alertcircle', label: 'Alert', component: AlertCircle },
  { id: 'alerttriangle', label: 'Warning', component: AlertTriangle },
  { id: 'checkcircle', label: 'Success', component: CheckCircle },
  { id: 'info', label: 'Info', component: Info },
  { id: 'lock', label: 'Lock', component: Lock },
  { id: 'unlock', label: 'Unlock', component: Unlock }
];

type Orientation = 'horizontal' | 'vertical';
type Side = 'front' | 'back';

interface ElementData {
  id: string;
  type: 'text' | 'icon' | 'image' | 'shape' | 'drawing';
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
  pathData?: string;
  strokeWidth?: number;
  drawTool?: 'pen' | 'marker' | 'eraser';
}

interface CardState {
  bgColor: string;
  elements: ElementData[];
}

const DraggableElement = ({ el, isSelected, containerRef, onSelect, onUpdatePosition, IconComp, isDrawMode, isEraser, onRemove }: any) => {
  const x = useMotionValue(el.x);
  const y = useMotionValue(el.y);

  useEffect(() => {
    x.set(el.x);
    y.set(el.y);
  }, [el.x, el.y, x, y]);

  return (
    <motion.div
      drag={!isDrawMode}
      dragMomentum={false}
      dragConstraints={containerRef}
      onDragEnd={(e, info) => {
        onUpdatePosition(el.id, Math.round(x.get()), Math.round(y.get()));
      }}
      onClick={(e) => { 
        e.stopPropagation(); 
        if (isDrawMode && isEraser && el.type === 'drawing') {
          onRemove(el.id);
        } else if (!isDrawMode) {
          onSelect(el.id); 
        }
      }}
      onPointerEnter={(e) => {
        if (isDrawMode && isEraser && e.buttons === 1 && el.type === 'drawing') {
          onRemove(el.id);
        }
      }}
      onPointerDown={(e) => {
        if (isDrawMode && isEraser && el.type === 'drawing') {
          onRemove(el.id);
        }
      }}
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
      className={`${!isDrawMode ? 'cursor-grab active:cursor-grabbing hover:border-white/30' : (isEraser ? 'cursor-crosshair' : 'pointer-events-none')} p-1 border ${isSelected && !isDrawMode ? 'border-indigo-400 border-dashed bg-white/5' : 'border-transparent'} rounded transition-colors`}
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
      {el.type === 'drawing' && el.pathData && (
        <svg style={{ overflow: 'visible' }} className={isDrawMode && !isEraser ? "pointer-events-none" : ""}>
          <path d={el.pathData} stroke={el.color} strokeWidth={el.strokeWidth || 4} strokeOpacity={el.drawTool === 'marker' ? 0.4 : 1} fill="none" strokeLinecap="round" strokeLinejoin="round" className={isDrawMode && isEraser ? "pointer-events-stroke" : ""} />
        </svg>
      )}
    </motion.div>
  );
};

interface CardCustomizerProps {
  onBookMeeting?: () => void;
}

const TEMPLATES = [
  {
    id: 'google-review',
    name: 'Google Review',
    cardData: {
      front: {
        bgColor: CANVA_COLORS[0],
        elements: [
          { id: 'f1', type: 'text', content: 'Enjoyed your visit?', x: 90, y: 100, z: 1, color: '#ffffff', fontSize: 26, fontFamily: '"Caveat", cursive', opacity: 1 },
          { id: 'f2', type: 'text', content: 'Review by tapping', x: 125, y: 145, z: 2, color: '#ffffff', fontSize: 22, fontFamily: '"Caveat", cursive', opacity: 1 },
          { id: 'f3', type: 'icon', iconId: 'contactless', x: 330, y: 106, z: 3, color: '#ffffff', opacity: 1 },
          { id: 'f4', type: 'text', content: 'tap&con', x: 335, y: 220, z: 4, color: '#ffffff', fontSize: 16, fontFamily: '"Caveat", cursive', opacity: 1 }
        ]
      },
      back: {
        bgColor: CANVA_COLORS[0],
        elements: [
          { id: 'b1', type: 'text', content: 'Your business name', x: 130, y: 110, z: 1, color: '#ffffff', fontSize: 26, fontFamily: '"Caveat", cursive', opacity: 1 }
        ]
      }
    }
  },
  {
    id: 'minimal-business',
    name: 'Minimal Business',
    cardData: {
      front: {
        bgColor: '#ffffff',
        elements: [
          { id: 'mb1', type: 'text', content: 'JOHN DOE', x: 50, y: 80, z: 1, color: '#000000', fontSize: 28, fontFamily: 'var(--font-sans)', opacity: 1 },
          { id: 'mb2', type: 'text', content: 'CEO & Founder', x: 50, y: 115, z: 2, color: '#666666', fontSize: 14, fontFamily: 'var(--font-sans)', opacity: 1 },
          { id: 'mb3', type: 'icon', iconId: 'contactless', x: 350, y: 80, z: 3, color: '#000000', opacity: 1 },
          { id: 'mb4', type: 'shape', x: 50, y: 150, z: 4, width: 350, height: 2, borderRadius: 0, color: '#000000', opacity: 1 }
        ]
      },
      back: {
        bgColor: '#f5f5f5',
        elements: [
          { id: 'mb5', type: 'text', content: 'john@example.com', x: 140, y: 90, z: 1, color: '#000000', fontSize: 16, fontFamily: 'var(--font-sans)', opacity: 1 },
          { id: 'mb6', type: 'text', content: '+1 234 567 890', x: 160, y: 130, z: 2, color: '#000000', fontSize: 16, fontFamily: 'var(--font-sans)', opacity: 1 }
        ]
      }
    }
  },
  {
    id: 'social-creator',
    name: 'Social Creator',
    cardData: {
      front: {
        bgColor: '#E1306C',
        elements: [
          { id: 'sc1', type: 'text', content: '@creator.name', x: 140, y: 110, z: 1, color: '#ffffff', fontSize: 32, fontFamily: 'var(--font-sans)', opacity: 1 },
          { id: 'sc2', type: 'icon', iconId: 'instagram', x: 200, y: 160, z: 2, color: '#ffffff', opacity: 1 }
        ]
      },
      back: {
        bgColor: '#1DA1F2',
        elements: [
          { id: 'sc3', type: 'text', content: 'Connect with me!', x: 130, y: 100, z: 1, color: '#ffffff', fontSize: 24, fontFamily: '"Caveat", cursive', opacity: 1 },
          { id: 'sc4', type: 'icon', iconId: 'contactless', x: 200, y: 150, z: 2, color: '#ffffff', opacity: 1 }
        ]
      }
    }
  }
];

export default function CardCustomizer({ onBookMeeting }: CardCustomizerProps = {}) {
  const [orientation, setOrientation] = useState<Orientation>('horizontal');
  const [activeSide, setActiveSide] = useState<Side>('front');

  const [cardData, setCardData] = useState<Record<Side, CardState>>(TEMPLATES[0].cardData);

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'templates' | 'text' | 'elements' | 'image' | 'background' | 'draw'>('templates');
  const [isShapesOpen, setIsShapesOpen] = useState(false);
  const [isIconsOpen, setIsIconsOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{x: number, y: number}[]>([]);
  const [drawColor, setDrawColor] = useState('#ffffff');
  const [drawThickness, setDrawThickness] = useState(4);
  const [drawTool, setDrawTool] = useState<'pen' | 'marker' | 'eraser'>('pen');
  const isEraser = drawTool === 'eraser';
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
      borderRadius,
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
        canvasWidth: orientation === 'horizontal' ? 2397 : 1510,
        canvasHeight: orientation === 'horizontal' ? 1510 : 2397,
        pixelRatio: orientation === 'horizontal' ? (2397 / 428) : (1510 / 270),
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
    <section id="customizer" className="relative bg-[#050505] h-[90vh] border-t border-white/5 flex flex-col">
      {/* Top Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-[#111] border-b border-white/10 z-20">
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.4em] block">Design Studio</span>
        </div>
        <div className="flex space-x-4 items-center">
          <div className="flex bg-black/50 p-1 rounded-lg border border-white/10">
            <button onClick={() => { setActiveSide('front'); setSelectedElementId(null); }} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors ${activeSide === 'front' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Front</button>
            <button onClick={() => { setActiveSide('back'); setSelectedElementId(null); }} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors ${activeSide === 'back' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Back</button>
          </div>
          <div className="flex bg-black/50 p-1 rounded-lg border border-white/10">
            <button onClick={() => handleOrientationChange('horizontal')} className={`p-1.5 rounded-md transition-colors ${orientation === 'horizontal' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`} title="Horizontal">
              <RectangleHorizontal className="w-4 h-4" />
            </button>
            <button onClick={() => handleOrientationChange('vertical')} className={`p-1.5 rounded-md transition-colors ${orientation === 'vertical' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`} title="Vertical">
              <RectangleVertical className="w-4 h-4" />
            </button>
          </div>
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
                  <button onClick={clearCanvas} className="flex items-center text-red-400 hover:text-red-300 transition-colors text-[10px] uppercase tracking-widest font-bold px-4 py-3 bg-red-400/10 hover:bg-red-400/20 rounded-lg w-full justify-center">
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
                <button onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center py-10 border-2 border-dashed border-white/20 hover:border-white/40 bg-white/5 rounded-xl transition-all text-gray-400 hover:text-white group">
                  <ImageIcon className="w-8 h-8 mb-3" />
                  <span className="text-xs font-bold uppercase tracking-widest">Upload Image</span>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                </button>
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
                  <select
                    value={selectedElement.fontFamily || 'var(--font-serif)'}
                    onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                    className="bg-transparent text-white text-xs border-r border-white/20 pr-4 focus:outline-none"
                  >
                    <option className="bg-[#1a1a1a] text-white" value="var(--font-serif)">Default Serif</option>
                    <option className="bg-[#1a1a1a] text-white" value="var(--font-sans)">Default Sans</option>
                    <option className="bg-[#1a1a1a] text-white" value="'Playfair Display', serif">Playfair</option>
                    <option className="bg-[#1a1a1a] text-white" value="'Montserrat', sans-serif">Montserrat</option>
                    <option className="bg-[#1a1a1a] text-white" value="'Caveat', cursive">Caveat</option>
                  </select>
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

              <div className="flex items-center pl-2">
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
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gray-500">Edit Text</label>
                    <textarea
                      value={selectedElement.content}
                      onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                      className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-white min-h-[100px]"
                    />
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
                Switch to<br/>{activeSide === 'front' ? 'Back' : 'Front'}
              </span>
            </div>
            <div 
              style={{
                width: orientation === 'horizontal' ? 428 : 270,
                height: orientation === 'horizontal' ? 270 : 428,
                transform: `scale(${160 / (orientation === 'horizontal' ? 428 : 270)})`,
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
                  onSelect={() => {}}
                  onRemove={() => {}}
                  onDrag={() => {}}
                  isDrawMode={false}
                  isEraser={false}
                />
              ))}
            </div>
          </div>

          {/* Zoom Wrapper */}
          <div style={{ transform: `scale(${zoom / 100})`, transition: 'transform 0.15s ease-out' }} className="flex items-center justify-center">
            {/* Card Container */}
            <div
              ref={containerRef}
              className="relative shrink-0 perspective-1000"
              style={{
                width: orientation === 'horizontal' ? '428px' : '270px',
                height: orientation === 'horizontal' ? '270px' : '428px',
              }}
            >
              <motion.div
                key={`${activeSide}-${orientation}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="absolute inset-0 rounded-2xl transition-all duration-500 z-10 overflow-hidden border border-white/10"
                style={{
                  backgroundColor: currentSideState.bgColor,
                }}
              >
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
                      isDrawMode={activeTab === 'draw'}
                      isEraser={isEraser}
                      onRemove={(id: string) => updateCurrentSide({ elements: currentSideState.elements.filter(e => e.id !== id) })}
                    />
                  );
                })}
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
    </section>
  );
}
