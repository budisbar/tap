import {
  SmartphoneNfc, Star, Utensils, Wifi, Waves, Coffee, ShoppingBag, Heart, User, MapPin, Phone, Mail, Globe,
  Instagram, Facebook, Twitter, Linkedin, Github, MessageCircle, Music, Video, Camera, Anchor, Zap, Shield,
  Sun, Moon, Cloud, Droplet, Hexagon, Triangle, Circle, Youtube, Twitch, Dribbble, Figma, Slack, Check, X,
  Plus, Minus, ThumbsUp, ThumbsDown, Bookmark, Link, Share2, Search, Bell, Settings, Home, Calendar, Clock,
  Smile, Eye, EyeOff, Filter, Copy, Clipboard, Download, Upload, Briefcase, CreditCard, Tag, Truck, Gift,
  Key, Monitor, Laptop, Smartphone, Tablet, Watch, Headphones, Speaker, Battery, Database, HardDrive,
  Printer, Server, Mouse, Plane, Car, Bus, Train, Compass, Navigation, Umbrella, AlertCircle, AlertTriangle,
  CheckCircle, Info, Lock, Unlock
} from 'lucide-react';

export const ContactlessIcon = ({ className, ...props }: any) => (
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

export const CANVA_COLORS = [
  // Neutrals & Dark
  '#ffffff', '#f5f5f5', '#e0e0e0', '#9e9e9e', '#424242', '#000000',
  '#1a1a1a', '#2c3e50', '#34495e', '#7f8c8d', '#bdc3c7', '#ecf0f1',

  // Solid Print-Safe Reds & Oranges
  '#8b0000', '#c0392b', '#e74c3c', '#d35400', '#e67e22', '#f39c12',
  '#f1c40f', '#f7dc6f', '#e59866', '#d98880', '#f5b7b1', '#fadbd8',

  // Solid Print-Safe Greens
  '#0b5345', '#148f77', '#16a085', '#1abc9c', '#27ae60', '#2ecc71',
  '#a9dfbf', '#abebc6', '#d4efdf', '#556b2f', '#6b8e23', '#8fbc8f',

  // Solid Print-Safe Blues & Purples
  '#154360', '#2980b9', '#3498db', '#5dade2', '#85c1e9', '#d6eaf8',
  '#4a235a', '#8e44ad', '#9b59b6', '#bb8fce', '#d2b4de', '#ebdef0'
];

export const GOOGLE_FONTS = [
  "Abel", "Acme", "Alata", "Alegreya", "Alice", "Amatic SC", "Amiri", "Anton", "Archivo", "Arimo",
  "Arvo", "Asap", "Assistant", "Barlow", "Bebas Neue", "Bitter", "Cabin", "Cairo", "Cardo", "Caveat",
  "Chakra Petch", "Cinzel", "Comfortaa", "Comic Neue", "Cormorant", "Courgette", "Crimson Pro", "Cuprum",
  "Dancing Script", "DM Sans", "DM Serif Display", "Dosis", "Exo", "Fira Sans", "Fjalla One", "Francois One",
  "Gelasio", "Great Vibes", "Heebo", "Hind", "Inconsolata", "Indie Flower", "Inter", "Josefin Sans", "Jost",
  "Kanit", "Karla", "Lato", "Lexend Deca", "Libre Baskerville", "Lobster", "Lora", "Manrope", "Maven Pro",
  "Merriweather", "Montserrat", "Mukta", "Nunito", "Nunito Sans", "Open Sans", "Oswald", "Oxygen",
  "Pacifico", "Playfair Display", "Poppins", "Prompt", "PT Sans", "PT Serif", "Public Sans", "Quicksand",
  "Rajdhani", "Raleway", "Righteous", "Roboto", "Roboto Mono", "Roboto Slab", "Rubik", "Saira",
  "Satisfy", "Shadows Into Light", "Signika", "Source Code Pro", "Space Mono", "Teko", "Titillium Web",
  "Ubuntu", "Varela Round", "Vollkorn", "Work Sans", "Zilla Slab"
];

// Transform to the format expected by FontPicker
export const FONTS = [
  { name: 'Default Serif', value: 'var(--font-serif)' },
  { name: 'Default Sans', value: 'var(--font-sans)' },
  ...GOOGLE_FONTS.map(font => ({
    name: font,
    value: `"${font}", sans-serif`
  }))
];

let fontsLoaded = false;
export const loadAllGoogleFonts = () => {
  if (fontsLoaded) return;
  fontsLoaded = true;

  const chunkSize = 30;
  for (let i = 0; i < GOOGLE_FONTS.length; i += chunkSize) {
    const chunk = GOOGLE_FONTS.slice(i, i + chunkSize);
    const families = chunk.map(f => `family=${f.replace(/ /g, '+')}`).join('&');
    const url = `https://fonts.googleapis.com/css2?${families}&display=swap`;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
  }
};

export const ICONS = [
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

export type Orientation = 'horizontal' | 'vertical';
export type Side = 'front' | 'back';

export interface ElementData {
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
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase';
  pathData?: string;
  strokeWidth?: number;
  drawTool?: 'pen' | 'marker' | 'eraser';
}

export interface CardState {
  bgColor: string;
  elements: ElementData[];
}

export const TEMPLATES: { id: string; name: string; cardData: Record<Side, CardState> }[] = [
  {
    id: 'hotel-review',
    name: 'Hotel Review',
    cardData: {
      front: {
        bgColor: '#1a1a1a',
        elements: [
          { id: 'f1', type: 'text', content: 'Enjoyed your visit?', x: 95, y: 110, z: 1, color: '#ffffff', fontSize: 28, fontFamily: '"Caveat", cursive', opacity: 1 },
          { id: 'f2', type: 'text', content: 'Review by tapping', x: 110, y: 150, z: 2, color: '#ffffff', fontSize: 24, fontFamily: '"Caveat", cursive', opacity: 1 },
          { id: 'f3', type: 'icon', iconId: 'contactless', x: 320, y: 120, z: 3, color: '#ffffff', opacity: 1 }
        ]
      },
      back: {
        bgColor: '#1a1a1a',
        elements: [
          { id: 'b1', type: 'text', content: 'Your business name', x: 125, y: 120, z: 1, color: '#ffffff', fontSize: 28, fontFamily: '"Caveat", cursive', opacity: 1 }
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
        bgColor: '#1DA1F2',
        elements: [
          { id: 'sc3', type: 'text', content: 'Connect with me!', x: 130, y: 100, z: 1, color: '#ffffff', fontSize: 24, fontFamily: '"Caveat", cursive', opacity: 1 },
          { id: 'sc4', type: 'icon', iconId: 'twitter', x: 200, y: 150, z: 2, color: '#ffffff', opacity: 1 }
        ]
      },
      back: {
        bgColor: '#E1306C',
        elements: [
          { id: 'sc1', type: 'text', content: '@creator.name', x: 140, y: 110, z: 1, color: '#ffffff', fontSize: 32, fontFamily: 'var(--font-sans)', opacity: 1 },
          { id: 'sc2', type: 'icon', iconId: 'insta', x: 200, y: 160, z: 2, color: '#ffffff', opacity: 1 }
        ]
      }
    }
  }
];

export interface CardMaterial {
  id: string;
  category: 'metal' | 'plastic' | 'wood';
  name: string;
  description: string;
  bgColor: string;
  previewBg: string;
  sheenOverlay?: string;
  badgeColor: string;
  shadowStyle?: string;
}

export const MATERIALS: CardMaterial[] = [
  // METAL
  {
    id: 'metal-silver',
    category: 'metal',
    name: 'Brushed Stainless Steel',
    description: 'Heavyweight stainless steel with realistic brushed metallic grain.',
    bgColor: '#cbd5e1',
    previewBg: `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380"><defs><filter id="steel-brush" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.5 0.004" numOctaves="4" result="noise"/><feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0.3 0"/></filter><linearGradient id="metal-shine" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f8fafc"/><stop offset="25%" stop-color="#cbd5e1"/><stop offset="50%" stop-color="#ffffff"/><stop offset="75%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#e2e8f0"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#metal-shine)"/><rect width="100%" height="100%" filter="url(#steel-brush)" opacity="0.75"/></svg>`)}") center/cover no-repeat`,
    sheenOverlay: 'linear-gradient(115deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 45%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 55%)',
    badgeColor: 'bg-slate-700/40 text-slate-200 border-slate-600',
    shadowStyle: '0 30px 60px -15px rgba(0, 0, 0, 0.9), inset 0 1.5px 2px rgba(255, 255, 255, 0.6), inset 0 -1.5px 2px rgba(0, 0, 0, 0.6)'
  },
  // WOOD
  {
    id: 'wood-walnut',
    category: 'wood',
    name: 'Dark Walnut Wood',
    description: '100% natural organic dark walnut wood with deep horizontal fiber grain streaks.',
    bgColor: '#3f2113',
    previewBg: `url("https://images.unsplash.com/photo-1550684376-efcbd6e3f031?q=80&w=1000&auto=format&fit=crop") center/cover no-repeat`,
    sheenOverlay: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.3) 100%)',
    badgeColor: 'bg-amber-900/40 text-amber-200 border-amber-800',
    shadowStyle: '0 30px 50px -15px rgba(0, 0, 0, 0.8), inset 0 1.5px 2px rgba(255, 255, 255, 0.25)'
  },
  {
    id: 'wood-cherry',
    category: 'wood',
    name: 'Cherry Sapele Wood',
    description: 'Warm mahogany-cherry wood finish with rich warm reddish tones and organic grain waves.',
    bgColor: '#7a311b',
    previewBg: `url("https://images.unsplash.com/photo-1531685250784-af587040dc8d?q=80&w=1000&auto=format&fit=crop") center/cover no-repeat`,
    sheenOverlay: 'radial-gradient(ellipse at 40% 50%, rgba(255,210,185,0.15) 0%, transparent 70%)',
    badgeColor: 'bg-rose-900/40 text-rose-200 border-rose-800',
    shadowStyle: '0 30px 50px -15px rgba(0, 0, 0, 0.78), inset 0 1.5px 2px rgba(255, 255, 255, 0.25)'
  },
  {
    id: 'wood-bamboo',
    category: 'wood',
    name: 'Natural Bamboo Wood',
    description: 'Eco-friendly light bamboo wood with fine linear horizontal wood grain.',
    bgColor: '#d1b28e',
    previewBg: `url("https://images.unsplash.com/photo-1520106208823-3889154aefdf?q=80&w=1000&auto=format&fit=crop") center/cover no-repeat`,
    sheenOverlay: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(0,0,0,0.1) 100%)',
    badgeColor: 'bg-yellow-800/30 text-yellow-200 border-yellow-700/50',
    shadowStyle: '0 30px 50px -15px rgba(0, 0, 0, 0.75), inset 0 1.5px 2px rgba(255, 255, 255, 0.4)'
  },
  // PLASTIC
  {
    id: 'plastic-white',
    category: 'plastic',
    name: 'Matte White PVC',
    description: 'Standard 85.5mm x 54mm smooth waterproof matte white PVC plastic.',
    bgColor: '#ffffff',
    previewBg: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
    sheenOverlay: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(241,245,249,0.2) 100%)',
    badgeColor: 'bg-white/20 text-white border-white/30',
    shadowStyle: '0 25px 45px -15px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
  },
  {
    id: 'plastic-black',
    category: 'plastic',
    name: 'Matte Black PVC',
    description: 'Sleek waterproof matte black PVC plastic card with NFC chip inside.',
    bgColor: '#18181b',
    previewBg: 'linear-gradient(135deg, #27272a 0%, #09090b 100%)',
    sheenOverlay: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.3) 100%)',
    badgeColor: 'bg-neutral-800 text-neutral-300 border-neutral-700',
    shadowStyle: '0 25px 45px -15px rgba(0, 0, 0, 0.85), inset 0 1px 1px rgba(255, 255, 255, 0.25)'
  }
];
