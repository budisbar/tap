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
    id: 'restaurant-review',
    name: 'Restaurant Review',
    cardData: {
      front: {
        bgColor: '#161616',
        elements: [
          { id: 'rr1', type: 'icon', iconId: 'menu', x: 38, y: 44, z: 1, color: '#f59e0b', opacity: 1 },
          { id: 'rr2', type: 'text', content: 'YOUR RESTAURANT', x: 38, y: 96, z: 2, color: '#9ca3af', fontSize: 12, fontFamily: 'var(--font-sans)', letterSpacing: 2, opacity: 1 },
          { id: 'rr3', type: 'text', content: 'Enjoyed your meal?\nTap to review us on Google.', x: 38, y: 122, z: 3, color: '#ffffff', fontSize: 20, fontFamily: 'var(--font-serif)', opacity: 1 },
          { id: 'rr4', type: 'icon', iconId: 'contactless', x: 352, y: 112, z: 4, color: '#ffffff', opacity: 1 }
        ]
      },
      back: {
        bgColor: '#161616',
        elements: [
          { id: 'rr5', type: 'text', content: 'Thank you for dining with us', x: 82, y: 122, z: 1, color: '#ffffff', fontSize: 20, fontFamily: 'var(--font-serif)', opacity: 1 }
        ]
      }
    }
  },
  {
    id: 'barbershop-salon',
    name: 'Barbershop & Salon',
    cardData: {
      front: {
        bgColor: '#121212',
        elements: [
          { id: 'bs1', type: 'text', content: 'STUDIO CUTS', x: 38, y: 58, z: 1, color: '#ffffff', fontSize: 24, fontFamily: 'var(--font-sans)', letterSpacing: 2, opacity: 1 },
          { id: 'bs2', type: 'shape', x: 38, y: 102, z: 2, width: 280, height: 2, borderRadius: 0, color: '#d4af37', opacity: 1 },
          { id: 'bs3', type: 'text', content: 'Tap to book or leave a review.', x: 38, y: 126, z: 3, color: '#e5e7eb', fontSize: 17, fontFamily: 'var(--font-serif)', opacity: 1 },
          { id: 'bs4', type: 'icon', iconId: 'contactless', x: 352, y: 112, z: 4, color: '#ffffff', opacity: 1 }
        ]
      },
      back: {
        bgColor: '#121212',
        elements: [
          { id: 'bs5', type: 'text', content: 'Open Tue – Sat · 9:00 – 19:00', x: 86, y: 122, z: 1, color: '#ffffff', fontSize: 15, fontFamily: 'var(--font-sans)', opacity: 1 }
        ]
      }
    }
  },
  {
    id: 'wifi-access',
    name: 'Wi-Fi Access',
    cardData: {
      front: {
        bgColor: '#0f172a',
        elements: [
          { id: 'wf1', type: 'icon', iconId: 'wifi', x: 38, y: 44, z: 1, color: '#38bdf8', opacity: 1 },
          { id: 'wf2', type: 'text', content: 'GUEST WI-FI', x: 38, y: 98, z: 2, color: '#94a3b8', fontSize: 12, fontFamily: 'var(--font-sans)', letterSpacing: 3, opacity: 1 },
          { id: 'wf3', type: 'text', content: 'Tap to connect to our Wi-Fi.', x: 38, y: 126, z: 3, color: '#ffffff', fontSize: 21, fontFamily: 'var(--font-sans)', opacity: 1 },
          { id: 'wf4', type: 'text', content: 'Your Business Network', x: 38, y: 170, z: 4, color: '#cbd5e1', fontSize: 13, fontFamily: 'var(--font-sans)', opacity: 1 },
          { id: 'wf5', type: 'icon', iconId: 'contactless', x: 352, y: 112, z: 5, color: '#ffffff', opacity: 1 }
        ]
      },
      back: {
        bgColor: '#0f172a',
        elements: [
          { id: 'wf6', type: 'text', content: 'Your Business Name', x: 116, y: 122, z: 1, color: '#ffffff', fontSize: 22, fontFamily: 'var(--font-serif)', opacity: 1 }
        ]
      }
    }
  },
  {
    id: 'digital-menu',
    name: 'Digital Menu',
    cardData: {
      front: {
        bgColor: '#1c1917',
        elements: [
          { id: 'dm1', type: 'icon', iconId: 'coffee', x: 38, y: 44, z: 1, color: '#fbbf24', opacity: 1 },
          { id: 'dm2', type: 'text', content: 'CAFE & BISTRO', x: 38, y: 98, z: 2, color: '#a8a29e', fontSize: 12, fontFamily: 'var(--font-sans)', letterSpacing: 3, opacity: 1 },
          { id: 'dm3', type: 'text', content: 'Tap to see our menu.', x: 38, y: 126, z: 3, color: '#ffffff', fontSize: 26, fontFamily: 'var(--font-serif)', opacity: 1 },
          { id: 'dm4', type: 'text', content: 'Seasonal plates & drinks', x: 38, y: 174, z: 4, color: '#d6d3d1', fontSize: 13, fontFamily: 'var(--font-sans)', opacity: 1 },
          { id: 'dm5', type: 'icon', iconId: 'contactless', x: 352, y: 112, z: 5, color: '#ffffff', opacity: 1 }
        ]
      },
      back: {
        bgColor: '#1c1917',
        elements: [
          { id: 'dm6', type: 'text', content: 'Your Business Name', x: 116, y: 122, z: 1, color: '#ffffff', fontSize: 22, fontFamily: 'var(--font-serif)', opacity: 1 }
        ]
      }
    }
  },
  {
    id: 'follow-us',
    name: 'Follow Us',
    cardData: {
      front: {
        bgColor: '#18181b',
        elements: [
          { id: 'fu1', type: 'icon', iconId: 'insta', x: 38, y: 44, z: 1, color: '#f472b6', opacity: 1 },
          { id: 'fu2', type: 'text', content: 'Tap to follow us on Instagram.', x: 38, y: 112, z: 2, color: '#ffffff', fontSize: 20, fontFamily: 'var(--font-sans)', opacity: 1 },
          { id: 'fu3', type: 'text', content: '@yourbusiness', x: 38, y: 152, z: 3, color: '#d4d4d8', fontSize: 16, fontFamily: 'var(--font-serif)', opacity: 1 },
          { id: 'fu4', type: 'icon', iconId: 'contactless', x: 352, y: 112, z: 4, color: '#ffffff', opacity: 1 }
        ]
      },
      back: {
        bgColor: '#18181b',
        elements: [
          { id: 'fu5', type: 'text', content: 'Share your experience with us', x: 78, y: 122, z: 1, color: '#ffffff', fontSize: 20, fontFamily: 'var(--font-serif)', opacity: 1 }
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
  engraveColor?: string;
  engraveTextShadow?: string;
  engraveFilter?: string;
}

export function isEngravedMaterial(material?: CardMaterial | null): boolean {
  return Boolean(material && (material.category === 'metal' || material.category === 'wood'));
}

export function getEffectiveElementColor(
  originalColor: string,
  material?: CardMaterial | null
): string {
  if (material && material.engraveColor && isEngravedMaterial(material)) {
    return material.engraveColor;
  }
  return originalColor;
}

const STEEL_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <defs>
      <linearGradient id="steel-base" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#e5eaef"/>
        <stop offset="28%" stop-color="#c3ccd5"/>
        <stop offset="52%" stop-color="#edf1f5"/>
        <stop offset="76%" stop-color="#a8b3bf"/>
        <stop offset="100%" stop-color="#d7dfe7"/>
      </linearGradient>
      <filter id="steel-grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.65 0.005" numOctaves="4" seed="3" result="noise"/>
        <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0.24 0"/>
      </filter>
    </defs>
    <rect width="600" height="380" fill="url(#steel-base)"/>
    <rect width="600" height="380" filter="url(#steel-grain)" opacity="0.85"/>
  </svg>`
);

const BAMBOO_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <defs>
      <linearGradient id="bamboo-base" x1="0%" y1="0%" x2="100%" y2="25%">
        <stop offset="0%" stop-color="#e2c493"/>
        <stop offset="35%" stop-color="#d5b179"/>
        <stop offset="70%" stop-color="#e5c899"/>
        <stop offset="100%" stop-color="#caa268"/>
      </linearGradient>
      <filter id="bamboo-grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.24" numOctaves="4" seed="7" result="f1"/>
        <feColorMatrix type="matrix" values="0.16 0 0 0 0.62  0.12 0 0 0 0.44  0.07 0 0 0 0.22  0 0 0 0.48 0"/>
      </filter>
      <filter id="bamboo-pores" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.06 0.45" numOctaves="2" seed="19"/>
        <feColorMatrix type="matrix" values="0.08 0 0 0 0.38  0.05 0 0 0 0.24  0.02 0 0 0 0.1  0 0 0 0.18 0"/>
      </filter>
    </defs>
    <rect width="600" height="380" fill="url(#bamboo-base)"/>
    <rect width="600" height="380" filter="url(#bamboo-grain)" opacity="0.78"/>
    <path d="M0,48 Q160,44 340,51 T600,46 M0,118 Q220,124 410,115 T600,120 M0,206 Q180,200 360,208 T600,203 M0,295 Q210,301 430,292 T600,298" stroke="#a67b43" stroke-width="1.4" stroke-opacity="0.22" fill="none"/>
    <path d="M0,78 Q240,74 420,81 T600,76 M0,162 Q150,166 370,159 T600,164 M0,252 Q210,247 450,255 T600,250 M0,340 Q190,344 390,337 T600,342" stroke="#8c6230" stroke-width="0.9" stroke-opacity="0.18" fill="none"/>
    <rect width="600" height="380" filter="url(#bamboo-pores)" opacity="0.45"/>
  </svg>`
);

const WALNUT_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <defs>
      <linearGradient id="walnut-base" x1="0%" y1="0%" x2="100%" y2="30%">
        <stop offset="0%" stop-color="#55321c"/>
        <stop offset="32%" stop-color="#432514"/>
        <stop offset="68%" stop-color="#5e3821"/>
        <stop offset="100%" stop-color="#391f10"/>
      </linearGradient>
      <filter id="walnut-grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.008 0.14" numOctaves="5" seed="14"/>
        <feColorMatrix type="matrix" values="0.2 0 0 0 0.18  0.11 0 0 0 0.09  0.06 0 0 0 0.04  0 0 0 0.65 0"/>
      </filter>
      <filter id="walnut-pores" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04 0.42" numOctaves="3" seed="27"/>
        <feColorMatrix type="matrix" values="0.08 0 0 0 0.08  0.04 0 0 0 0.03  0.02 0 0 0 0.01  0 0 0 0.28 0"/>
      </filter>
    </defs>
    <rect width="600" height="380" fill="url(#walnut-base)"/>
    <rect width="600" height="380" filter="url(#walnut-grain)" opacity="0.85"/>
    <path d="M0,36 C160,26 290,52 460,34 S560,28 600,36 M0,92 C190,106 340,78 510,94 S570,98 600,92 M0,164 C140,148 310,178 480,158 S565,152 600,162 M0,238 C180,254 350,224 520,242 S575,248 600,236 M0,318 C150,304 320,330 490,314 S565,308 600,316" stroke="#241106" stroke-width="2.2" stroke-opacity="0.34" fill="none"/>
    <path d="M0,64 C170,74 330,52 490,68 T600,62 M0,128 C140,116 320,140 470,124 T600,128 M0,200 C185,212 340,188 505,204 T600,198 M0,278 C155,266 325,288 485,274 T600,278 M0,352 C175,360 350,342 515,356 T600,350" stroke="#75492c" stroke-width="1.2" stroke-opacity="0.22" fill="none"/>
    <rect width="600" height="380" filter="url(#walnut-pores)" opacity="0.5"/>
  </svg>`
);

export const MATERIALS: CardMaterial[] = [
  // METAL
  {
    id: 'metal-silver',
    category: 'metal',
    name: 'Brushed Stainless Steel',
    description: 'Heavyweight stainless steel with brushed metallic finish and laser-etched engraving.',
    bgColor: '#c8d0d8',
    previewBg: `url("data:image/svg+xml;utf8,${STEEL_SVG}") center/cover no-repeat`,
    sheenOverlay: 'linear-gradient(115deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 42%, rgba(255,255,255,0.48) 50%, rgba(255,255,255,0) 58%)',
    badgeColor: 'bg-slate-700/40 text-slate-200 border-slate-600',
    shadowStyle: '0 30px 60px -15px rgba(0, 0, 0, 0.9), inset 0 1.5px 2px rgba(255, 255, 255, 0.6), inset 0 -1.5px 2px rgba(0, 0, 0, 0.6)',
    engraveColor: '#3a4048',
    engraveTextShadow: '0 1px 0 rgba(255, 255, 255, 0.55), 0 -1px 0 rgba(15, 23, 42, 0.45)',
    engraveFilter: 'drop-shadow(0 1px 0 rgba(255, 255, 255, 0.55)) drop-shadow(0 -0.5px 0 rgba(15, 23, 42, 0.45))',
  },
  // WOOD
  {
    id: 'wood-bamboo',
    category: 'wood',
    name: 'Natural Bamboo Wood',
    description: 'Light organic bamboo wood with natural grain fibers and deep laser-burned engraving.',
    bgColor: '#d8b784',
    previewBg: `url("data:image/svg+xml;utf8,${BAMBOO_SVG}") center/cover no-repeat`,
    sheenOverlay: 'radial-gradient(ellipse at center, rgba(255,250,240,0.06) 0%, rgba(0,0,0,0) 62%, rgba(45,25,8,0.28) 100%), linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.12) 100%)',
    badgeColor: 'bg-yellow-800/30 text-yellow-200 border-yellow-700/50',
    shadowStyle: '0 30px 50px -15px rgba(0, 0, 0, 0.78), inset 0 1px 2px rgba(255, 240, 210, 0.3), inset 0 -2px 4px rgba(35, 18, 5, 0.35)',
    engraveColor: '#2a1508',
    engraveTextShadow: '0 1px 0 rgba(255, 235, 200, 0.25), 0 -1px 1px rgba(15, 6, 0, 0.65), 0 0 1px rgba(42, 21, 8, 0.35)',
    engraveFilter: 'drop-shadow(0 1px 0 rgba(255, 235, 200, 0.22)) drop-shadow(0 -0.5px 0.5px rgba(15, 6, 0, 0.6))',
  },
  {
    id: 'wood-walnut',
    category: 'wood',
    name: 'Dark Walnut Wood',
    description: 'Rich dark walnut heartwood with flowing grain variation and laser-burned engraving.',
    bgColor: '#462816',
    previewBg: `url("data:image/svg+xml;utf8,${WALNUT_SVG}") center/cover no-repeat`,
    sheenOverlay: 'radial-gradient(ellipse at center, rgba(255,240,220,0.04) 0%, rgba(0,0,0,0) 60%, rgba(12,5,0,0.42) 100%), linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.22) 100%)',
    badgeColor: 'bg-amber-900/40 text-amber-200 border-amber-800',
    shadowStyle: '0 30px 50px -15px rgba(0, 0, 0, 0.85), inset 0 1px 2px rgba(255, 220, 185, 0.18), inset 0 -2px 5px rgba(0, 0, 0, 0.5)',
    engraveColor: '#160a03',
    engraveTextShadow: '0 1px 0 rgba(255, 220, 185, 0.16), 0 -1px 1px rgba(0, 0, 0, 0.85), 0 0 1.5px rgba(22, 10, 3, 0.5)',
    engraveFilter: 'drop-shadow(0 1px 0 rgba(255, 220, 185, 0.15)) drop-shadow(0 -0.5px 0.5px rgba(0, 0, 0, 0.8))',
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
