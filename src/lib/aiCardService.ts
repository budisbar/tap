import { getGenerativeModel, SchemaType, ThinkingLevel } from 'firebase/ai';
import { ai, PRIMARY_GEMINI_MODEL, BACKUP_GEMINI_MODEL } from './firebase';
import { CardState, ElementData, CardMaterial, MATERIALS } from '../components/studio/customizerData';

export const PRIMARY_MODEL = PRIMARY_GEMINI_MODEL;
export const BACKUP_MODEL = BACKUP_GEMINI_MODEL;

function isHighDemandError(err: any): boolean {
  const msg = String(err?.message || err || '').toLowerCase();
  return (
    msg.includes('500') ||
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('high demand') ||
    msg.includes('overloaded') ||
    msg.includes('resource_exhausted') ||
    msg.includes('resource exhausted') ||
    msg.includes('unavailable') ||
    msg.includes('busy')
  );
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      return reject(new Error('USER_CANCELLED'));
    }
    const timer = setTimeout(() => {
      resolve();
    }, ms);
    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          reject(new Error('USER_CANCELLED'));
        },
        { once: true }
      );
    }
  });
}

export interface AiCardPromptInput {
  businessName: string;
  businessType: string;
  cardPurpose: 'reviews' | 'business' | 'menu' | 'social';
  contactInfo?: {
    name?: string;
    role?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  logo?: {
    aspectRatio: number;
    dominantColors: string[];
    dataUrl?: string;
  };
  style: 'minimalist' | 'balanced' | 'creative';
  material: 'plastic' | 'metal' | 'wood';
  preferredColors?: string[];
  customText?: string;
  language: 'pt' | 'en';
}

export interface GeneratedCardResult {
  cardData: {
    front: CardState;
    back: CardState;
  };
  selectedMaterialId: string;
}

// Extract dominant colors and aspect ratio from an uploaded image in browser without sending the file
export async function analyzeLogo(file: File): Promise<{
  dataUrl: string;
  aspectRatio: number;
  dominantColors: string[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const aspectRatio = Number((img.naturalWidth / Math.max(1, img.naturalHeight)).toFixed(2));
        const canvas = document.createElement('canvas');
        canvas.width = 50;
        canvas.height = 50;
        const ctx = canvas.getContext('2d');
        const colorCounts: Record<string, number> = {};

        if (ctx) {
          ctx.drawImage(img, 0, 0, 50, 50);
          try {
            const imgData = ctx.getImageData(0, 0, 50, 50).data;
            for (let i = 0; i < imgData.length; i += 4) {
              const r = imgData[i];
              const g = imgData[i + 1];
              const b = imgData[i + 2];
              const a = imgData[i + 3];
              if (a < 50) continue; // Skip transparency
              const qr = Math.round(r / 32) * 32;
              const qg = Math.round(g / 32) * 32;
              const qb = Math.round(b / 32) * 32;
              const hex =
                '#' +
                [qr, qg, qb]
                  .map((x) => Math.min(255, x).toString(16).padStart(2, '0'))
                  .join('');
              colorCounts[hex] = (colorCounts[hex] || 0) + 1;
            }
          } catch {
            // Ignore security issues on tainted canvas
          }
        }

        const sortedColors = Object.entries(colorCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([hex]) => hex);

        resolve({
          dataUrl,
          aspectRatio,
          dominantColors: sortedColors.length > 0 ? sortedColors : ['#ffffff'],
        });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Simplified Flat JSON Schema for Canvas Elements
const elementSchema = {
  type: SchemaType.OBJECT,
  properties: {
    type: { type: SchemaType.STRING }, // "text", "shape", "icon", "image"
    x: { type: SchemaType.INTEGER },
    y: { type: SchemaType.INTEGER },
    width: { type: SchemaType.INTEGER },
    height: { type: SchemaType.INTEGER },
    text: { type: SchemaType.STRING },
    fontSize: { type: SchemaType.INTEGER },
    color: { type: SchemaType.STRING },
    shape: { type: SchemaType.STRING }, // "rectangle", "circle", "pill"
    rotation: { type: SchemaType.INTEGER },
  },
  required: ['type', 'x', 'y', 'color'],
};

const cardLayoutSchema = {
  type: SchemaType.OBJECT,
  properties: {
    materialId: { type: SchemaType.STRING },
    frontBg: { type: SchemaType.STRING },
    backBg: { type: SchemaType.STRING },
    front: {
      type: SchemaType.ARRAY,
      items: elementSchema,
    },
    back: {
      type: SchemaType.ARRAY,
      items: elementSchema,
    },
  },
  required: ['materialId', 'frontBg', 'backBg', 'front', 'back'],
};

async function callGeminiModel(
  modelName: string,
  prompt: string,
  signal?: AbortSignal
) {
  let model = getGenerativeModel(
    ai,
    {
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: cardLayoutSchema,
        temperature: 0.7,
        maxOutputTokens: 2000,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.MINIMAL,
        },
      },
    },
    {
      timeout: 30000,
      signal,
    }
  );

  try {
    return await model.generateContent(prompt);
  } catch (err: any) {
    const rawMsg = String(err?.message || err || '');
    if (rawMsg.includes('400') || rawMsg.includes('invalid argument') || rawMsg.includes('INVALID_ARGUMENT')) {
      const fallbackModel = getGenerativeModel(
        ai,
        {
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: cardLayoutSchema,
            temperature: 0.7,
            maxOutputTokens: 2000,
          },
        },
        {
          timeout: 30000,
          signal,
        }
      );
      return await fallbackModel.generateContent(prompt);
    }
    throw err;
  }
}

export function getCallToAction(purpose: string, language: 'pt' | 'en'): string {
  if (language === 'pt') {
    switch (purpose) {
      case 'reviews':
        return 'Toque para nos avaliar no Google';
      case 'menu':
        return 'Toque para ver o cardápio';
      case 'social':
        return 'Toque para nos seguir';
      case 'business':
      default:
        return 'Toque para salvar o contato';
    }
  } else {
    switch (purpose) {
      case 'reviews':
        return 'Tap to review us on Google';
      case 'menu':
        return 'Tap to view menu';
      case 'social':
        return 'Tap to connect with us';
      case 'business':
      default:
        return 'Tap to save contact';
    }
  }
}

function cleanStringForComparison(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function isCtaPhrase(cleanedText: string, ctaLine: string): boolean {
  const cleanedCta = cleanStringForComparison(ctaLine);
  if (!cleanedText) return false;
  if (cleanedText === cleanedCta || cleanedCta.includes(cleanedText) || cleanedText.includes(cleanedCta)) {
    return true;
  }
  const ctaKeywords = [
    'review us on google',
    'review on google',
    'tap to review us on google',
    'tap to review',
    'review us',
    'review google',
    'toque para nos avaliar no google',
    'toque para avaliar no google',
    'avaliar no google',
    'avalie nos no google',
    'toque para avaliar',
    'tap to view menu',
    'tap for menu',
    'view menu',
    'digital menu',
    'cardapio digital',
    'toque para ver o cardapio',
    'toque para ver cardapio',
    'ver o cardapio',
    'tap to connect with us',
    'tap to connect',
    'connect with us',
    'follow us',
    'siga nos',
    'toque para nos seguir',
    'toque para se conectar conosco',
    'tap to save contact',
    'save contact',
    'toque para salvar o contato',
    'toque para salvar contato',
    'salvar o contato',
    'salvar contato',
  ];
  return ctaKeywords.some((kw) => cleanedText === kw || cleanedText.includes(kw) || kw.includes(cleanedText));
}

function isTextElementAllowed(
  rawText: string,
  input: AiCardPromptInput,
  ctaLine: string
): boolean {
  if (!rawText || !rawText.trim()) return false;
  const cleaned = cleanStringForComparison(rawText);
  if (!cleaned) return false;

  // NFC tap / icon text exception
  const nfcTokens = ['nfc', 'tap', 'toque', 'contactless', 'aproxima', 'aproxime', 'scan'];
  if (nfcTokens.includes(cleaned)) return true;

  // Call-to-action line exception
  if (isCtaPhrase(cleaned, ctaLine)) return true;

  // Business name match (or individual words from business name)
  const cleanedBiz = cleanStringForComparison(input.businessName);
  if (cleaned === cleanedBiz || cleanedBiz.includes(cleaned) || cleaned.includes(cleanedBiz)) {
    return true;
  }
  const bizWords = cleanedBiz.split(' ').filter((w) => w.length > 1);
  const textWords = cleaned.split(' ').filter(Boolean);
  if (textWords.length > 0 && textWords.every((w) => bizWords.includes(w))) {
    return true;
  }

  // User optional line of text
  if (input.customText && input.customText.trim()) {
    const cleanedCustom = cleanStringForComparison(input.customText);
    if (cleaned === cleanedCustom || cleanedCustom.includes(cleaned) || cleaned.includes(cleanedCustom)) {
      return true;
    }
  }

  // Contact details provided by user
  if (input.contactInfo) {
    const contactValues = [
      input.contactInfo.name,
      input.contactInfo.role,
      input.contactInfo.phone,
      input.contactInfo.email,
      input.contactInfo.website,
    ].filter(Boolean) as string[];

    for (const val of contactValues) {
      const cleanedVal = cleanStringForComparison(val);
      if (!cleanedVal) continue;
      if (cleaned === cleanedVal || cleanedVal.includes(cleaned) || cleaned.includes(cleanedVal)) {
        return true;
      }

      // Check phone numbers by numeric digits
      const digitsVal = val.replace(/\D/g, '');
      const digitsText = rawText.replace(/\D/g, '');
      if (digitsVal.length >= 6 && digitsText.length >= 6 && (digitsVal.includes(digitsText) || digitsText.includes(digitsVal))) {
        return true;
      }

      // Allow contact labels + value (e.g. "Tel: +351...", "Email: info@...")
      const prefixes = ['tel', 'phone', 'cel', 'mobile', 'email', 'mail', 'site', 'web', 'website', 't', 'p', 'e', 'w'];
      for (const prefix of prefixes) {
        if (cleaned.startsWith(prefix + ' ') || cleaned.startsWith(prefix)) {
          const rest = cleaned.replace(new RegExp(`^${prefix}\\s*`), '').trim();
          if (rest && (cleanedVal.includes(rest) || rest.includes(cleanedVal))) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

export async function generateCardWithAi(
  input: AiCardPromptInput,
  signal?: AbortSignal
): Promise<GeneratedCardResult> {
  const normalizedStyle: 'minimalist' | 'balanced' | 'creative' =
    (input.style as string) === 'simple' ? 'minimalist' : input.style;
  const ctaLine = getCallToAction(input.cardPurpose, input.language);
  const langText = input.language === 'pt' ? 'Portuguese' : 'English';
  const logoInfo = input.logo
    ? `User logo provided (ratio ${input.logo.aspectRatio}, dominant colors: ${input.logo.dominantColors.join(', ')}). Include 1 image element on front.`
    : 'No logo provided.';

  const contactList = input.contactInfo
    ? Object.entries(input.contactInfo)
        .filter(([_, v]) => Boolean(v && String(v).trim()))
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')
    : '';

  const colorsPool = [
    ...(input.logo?.dominantColors || []),
    ...(input.preferredColors || []),
    '#ffffff',
    '#18181b',
  ].filter(Boolean);
  const allowedColors = Array.from(new Set(colorsPool)).join(', ');

  const prompt = `
CONTENT RULE:
Use only the content the user provided: business name, logo, card purpose, contact details and their optional line of text. Never invent text, slogans, icons or illustrations. If a field is empty, leave it out. The only additions allowed are a small NFC tap icon and the call-to-action line for the card's purpose (for example '${ctaLine}').

EVERY ELEMENT MUST HAVE A REASON:
Every shape, line or colour block must have a clear purpose: framing the logo, separating content, creating hierarchy, or echoing a shape or colour from the user's logo. Colours must come from the logo or the user's chosen colours. No random decorative circles, blobs, gradients or patterns. Before finishing, check each element and remove it if you cannot say why it is there.

STYLE DEFINITIONS:
- Minimalist: lots of empty space, maximum 3 elements per side, one font, small logo, no shapes.
- Balanced: clear and well aligned layout, one font, up to three text sizes, at most one line or shape that structures the content.
- Creative: be truly bold and expressive. Make the logo huge, let it be cropped by the card edge, place the business name inside, around or across the logo, use dramatic contrast in text size, rotated or stacked text, strong asymmetric compositions, and large colour blocks taken from the logo. Surprise the user, but every choice must still follow rules 2 and 3.

GENERAL RULES:
Text always readable for print, never unreadable text over a busy part of the logo, safe margins respected for anything that is not intentionally cropped, the back side always carries the NFC tap icon and the call-to-action.
Card dimensions: 428x270px. Safe margins for non-cropped elements: x: 24-380, y: 20-240.

USER PROVIDED CONTENT:
- Business name: "${input.businessName}" (${input.businessType})
- Card purpose: ${input.cardPurpose}
- Call-to-action line for the card's purpose: "${ctaLine}"
${contactList ? `- Contact details: ${contactList}` : '- Contact details: None provided'}
${input.customText?.trim() ? `- Optional line of text: "${input.customText.trim()}"` : '- Optional line of text: None provided'}
- Logo: ${logoInfo}
- Language: ${langText}
- Chosen style: ${normalizedStyle.toUpperCase()}

MATERIAL & COLOR RULES:
- plastic: frontBg and backBg "#ffffff" or "#18181b", element colors strictly from: ${allowedColors}
- metal: frontBg and backBg strictly "#c8d0d8", element colors strictly "#3a4048"
- wood: frontBg and backBg strictly "#d8b784", element colors strictly "#2a1508"

CANVAS ELEMENT SPECIFICATIONS:
- "text": text content, fontSize (11-36, or larger contrast in Creative), x, y, color, rotation.
- "icon": type "icon", text set to icon name (contactless, nfc, review, menu, phone, mail, globe, insta, share), x, y, width, height, color.
- "shape": shape ("rectangle", "circle", "pill"), x, y, width, height, color.
- "image": logo placement (if logo provided).

Return only the JSON layout.
`.trim();

  let response: any = null;
  let lastError: any = null;

  // 1. Primary Model: Initial attempt + up to 2 retries on 500, 503, 429 / high demand
  const retryDelays = [2000, 4000];
  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      if (signal?.aborted) throw new Error('USER_CANCELLED');
      response = await callGeminiModel(PRIMARY_MODEL, prompt, signal);
      lastError = null;
      break;
    } catch (err: any) {
      lastError = err;
      console.error(`[AI Generation] ${PRIMARY_MODEL} attempt ${attempt + 1} error:`, err);

      if (signal?.aborted) {
        if (signal.reason === 'TIMEOUT' || String(err).includes('taking too long') || String(err).includes('DEADLINE_EXCEEDED')) {
          throw new Error('This is taking too long. Please try again.');
        }
        throw new Error('USER_CANCELLED');
      }

      if (attempt < 2 && isHighDemandError(err)) {
        await sleep(retryDelays[attempt], signal);
      } else {
        break;
      }
    }
  }

  // 2. Backup Model: Try once if primary model failed
  if (!response && BACKUP_MODEL) {
    try {
      if (signal?.aborted) throw new Error('USER_CANCELLED');
      console.warn(`[AI Generation] Primary model failed. Attempting backup model: ${BACKUP_MODEL}`);
      response = await callGeminiModel(BACKUP_MODEL, prompt, signal);
      lastError = null;
    } catch (backupErr: any) {
      lastError = backupErr;
      console.error(`[AI Generation] Backup model ${BACKUP_MODEL} error:`, backupErr);
    }
  }

  if (!response) {
    if (signal?.aborted) {
      if (signal.reason === 'TIMEOUT' || String(lastError).includes('taking too long') || String(lastError).includes('DEADLINE_EXCEEDED')) {
        throw new Error('This is taking too long. Please try again.');
      }
      throw new Error('USER_CANCELLED');
    }
    if (isHighDemandError(lastError)) {
      throw new Error('Our AI is very busy right now. Please try again in a minute.');
    }
    throw new Error("We couldn't create your card. Please try again.");
  }

  let text = '';
  try {
    text = response.response.text();
  } catch (textErr: any) {
    console.error('Failed to extract text from Gemini response:', textErr);
    throw new Error("We couldn't create your card. Please try again.");
  }

  if (!text) {
    throw new Error("We couldn't create your card. Please try again.");
  }

  let rawData: any;
  try {
    rawData = JSON.parse(text);
  } catch (jsonErr: any) {
    console.error('Failed to parse Gemini response as JSON:', jsonErr, 'Raw text:', text);
    throw new Error("We couldn't create your card. Please try again.");
  }

  // Validate and sanitize the generated card layout
  try {
    const sanitized = sanitizeGeneratedLayout(rawData, input);
    return sanitized;
  } catch (valErr: any) {
    console.error('Layout sanitization error:', valErr);
    throw new Error("We couldn't create your card. Please try again.");
  }
}

function sanitizeGeneratedLayout(raw: any, input: AiCardPromptInput): GeneratedCardResult {
  const normalizedStyle: 'minimalist' | 'balanced' | 'creative' =
    (input.style as string) === 'simple' ? 'minimalist' : input.style;
  const ctaLine = getCallToAction(input.cardPurpose, input.language);

  // Determine target material
  let materialId = 'plastic-white';
  if (input.material === 'metal') materialId = 'metal-silver';
  else if (input.material === 'wood') materialId = 'wood-bamboo';
  else if (raw.materialId && MATERIALS.some((m) => m.id === raw.materialId)) {
    materialId = raw.materialId;
  } else if (raw.frontBg === '#18181b' || raw.frontBg === '#000000' || raw.front?.bgColor === '#18181b') {
    materialId = 'plastic-black';
  }

  const matchingMaterial = MATERIALS.find((m) => m.id === materialId) || MATERIALS[0];
  const isEngraved = matchingMaterial.category === 'metal' || matchingMaterial.category === 'wood';

  const defaultBg = isEngraved
    ? matchingMaterial.bgColor
    : materialId === 'plastic-black'
    ? '#18181b'
    : '#ffffff';

  const frontBg = isEngraved ? matchingMaterial.bgColor : raw.frontBg || raw.front?.bgColor || defaultBg;
  const backBg = isEngraved ? matchingMaterial.bgColor : raw.backBg || raw.back?.bgColor || defaultBg;

  const sanitizeElement = (el: any, index: number, side: 'front' | 'back'): ElementData | null => {
    const type: 'text' | 'shape' | 'icon' | 'image' = ['text', 'shape', 'icon', 'image'].includes(
      el.type
    )
      ? el.type
      : 'text';

    // Minimalist style rule: no shapes allowed
    if (normalizedStyle === 'minimalist' && type === 'shape') {
      return null;
    }

    const width = Number(el.width) || (type === 'shape' ? 100 : type === 'image' ? 70 : 180);
    const height = Number(el.height) || (type === 'shape' ? 40 : type === 'image' ? 50 : 28);

    // Bounds handling
    let x: number;
    let y: number;
    if (type === 'text') {
      // Safe margins strictly respected for all text
      x = Math.max(24, Math.min(Number(el.x) || 30, 428 - Math.min(width, 350) - 24));
      y = Math.max(16, Math.min(Number(el.y) || 30, 270 - Math.min(height, 200) - 16));
    } else if (normalizedStyle === 'creative' && (type === 'image' || type === 'shape')) {
      // In Creative, allow intentional cropping / bleed across card edges
      x = Math.max(-100, Math.min(Number(el.x) || 30, 400));
      y = Math.max(-80, Math.min(Number(el.y) || 30, 250));
    } else {
      x = Math.max(20, Math.min(Number(el.x) || 30, 428 - Math.min(width, 350) - 20));
      y = Math.max(16, Math.min(Number(el.y) || 30, 270 - Math.min(height, 200) - 16));
    }

    let color = el.color || (materialId === 'plastic-black' ? '#ffffff' : '#000000');
    if (isEngraved) {
      color = matchingMaterial.engraveColor || '#3a4048';
    }

    const cleanEl: ElementData = {
      id: `ai-${side}-${index + 1}-${Date.now().toString().slice(-4)}`,
      type,
      x,
      y,
      z: index + 1,
      width,
      height,
      color,
      rotation: Number(el.rotation) || 0,
      opacity: 1,
    };

    if (type === 'text') {
      cleanEl.content = String(el.text || el.content || input.businessName);
      const maxFontSize = normalizedStyle === 'creative' ? 48 : 36;
      cleanEl.fontSize = Math.max(11, Math.min(Number(el.fontSize) || 16, maxFontSize));
      cleanEl.fontFamily = 'var(--font-sans)';
      cleanEl.textAlign = ['left', 'center', 'right'].includes(el.textAlign) ? el.textAlign : 'left';
      cleanEl.textTransform = 'none';
    } else if (type === 'icon') {
      cleanEl.iconId = el.text || el.iconId || 'contactless';
      cleanEl.width = Math.max(20, Math.min(width, 60));
      cleanEl.height = cleanEl.width;
    } else if (type === 'shape') {
      cleanEl.borderRadius = el.shape === 'circle' || el.shape === 'pill' ? 999 : Number(el.borderRadius) || 0;
    } else if (type === 'image') {
      if (input.logo?.dataUrl) {
        cleanEl.imageUrl = input.logo.dataUrl;
        const ar = input.logo.aspectRatio || 1;
        const maxLogoW = normalizedStyle === 'creative' ? 320 : normalizedStyle === 'minimalist' ? 70 : 120;
        const minLogoW = normalizedStyle === 'creative' ? 100 : 35;
        const defaultLogoW = normalizedStyle === 'creative' ? 220 : normalizedStyle === 'minimalist' ? 60 : 85;
        cleanEl.width = Math.max(minLogoW, Math.min(width || defaultLogoW, maxLogoW));
        cleanEl.height = Math.round(cleanEl.width / ar);
      }
    }

    return cleanEl;
  };

  const rawFrontList = Array.isArray(raw.front)
    ? raw.front
    : Array.isArray(raw.front?.elements)
    ? raw.front.elements
    : [];

  const rawBackList = Array.isArray(raw.back)
    ? raw.back
    : Array.isArray(raw.back?.elements)
    ? raw.back.elements
    : [];

  let frontElements: ElementData[] = rawFrontList
    .map((el: any, i: number) => sanitizeElement(el, i, 'front'))
    .filter((el): el is ElementData => el !== null);

  let backElements: ElementData[] = rawBackList
    .map((el: any, i: number) => sanitizeElement(el, i, 'back'))
    .filter((el): el is ElementData => el !== null);

  // 6. Safety check: remove any text element whose content was not provided by user
  // (except the NFC icon and the call-to-action)
  frontElements = frontElements.filter((el) => {
    if (el.type !== 'text') return true;
    const allowed = isTextElementAllowed(el.content || '', input, ctaLine);
    if (!allowed) {
      console.warn(`[AI Safety Check] Removed unprovided text element on front: "${el.content}"`);
      return false;
    }
    return true;
  });

  backElements = backElements.filter((el) => {
    if (el.type !== 'text') return true;
    const allowed = isTextElementAllowed(el.content || '', input, ctaLine);
    if (!allowed) {
      console.warn(`[AI Safety Check] Removed unprovided text element on back: "${el.content}"`);
      return false;
    }
    return true;
  });

  // Balanced style rule: at most one line or shape that structures the content
  if (normalizedStyle === 'balanced') {
    let frontShapes = 0;
    frontElements = frontElements.filter((el) => {
      if (el.type === 'shape') {
        frontShapes++;
        return frontShapes <= 1;
      }
      return true;
    });

    let backShapes = 0;
    backElements = backElements.filter((el) => {
      if (el.type === 'shape') {
        backShapes++;
        return backShapes <= 1;
      }
      return true;
    });
  }

  // Minimalist style rule: maximum 3 elements per side
  if (normalizedStyle === 'minimalist') {
    if (frontElements.length > 3) frontElements = frontElements.slice(0, 3);
    if (backElements.length > 3) backElements = backElements.slice(0, 3);
  }

  // If user provided a logo and front side has no image element, inject it
  if (input.logo?.dataUrl && !frontElements.some((e) => e.type === 'image')) {
    const ar = input.logo.aspectRatio || 1;
    const logoW = normalizedStyle === 'creative' ? 220 : normalizedStyle === 'minimalist' ? 65 : 85;
    const logoH = Math.round(logoW / ar);
    const logoX = normalizedStyle === 'creative' ? 240 : 32;
    const logoY = normalizedStyle === 'creative' ? -20 : 28;
    frontElements.unshift({
      id: `ai-logo-injected-${Date.now().toString().slice(-4)}`,
      type: 'image',
      imageUrl: input.logo.dataUrl,
      x: logoX,
      y: logoY,
      z: 1,
      width: logoW,
      height: logoH,
      color: isEngraved ? matchingMaterial.engraveColor || '#3a4048' : '#ffffff',
      opacity: 1,
    });
  }

  // Ensure back side always carries the NFC tap icon and the call-to-action
  const hasBackIcon = backElements.some(
    (e) => e.type === 'icon' || (e.type === 'text' && ['nfc', 'contactless', 'tap', 'toque'].includes(cleanStringForComparison(e.content || '')))
  );
  const hasBackCta = backElements.some((e) => e.type === 'text' && isCtaPhrase(cleanStringForComparison(e.content || ''), ctaLine));

  const textFillColor = isEngraved
    ? matchingMaterial.engraveColor || '#3a4048'
    : backBg === '#18181b' || backBg === '#000000'
    ? '#ffffff'
    : '#18181b';

  if (!hasBackIcon) {
    backElements.unshift({
      id: `ai-back-nfc-${Date.now().toString().slice(-4)}`,
      type: 'icon',
      iconId: 'contactless',
      x: 194,
      y: hasBackCta ? 65 : 95,
      z: 1,
      width: 40,
      height: 40,
      color: textFillColor,
      opacity: 1,
    });
  }

  if (!hasBackCta) {
    backElements.push({
      id: `ai-back-cta-${Date.now().toString().slice(-4)}`,
      type: 'text',
      content: ctaLine,
      fontSize: 13,
      fontFamily: 'var(--font-sans)',
      textAlign: 'center',
      textTransform: 'none',
      x: 44,
      y: 145,
      z: 2,
      width: 340,
      height: 24,
      color: textFillColor,
      opacity: 1,
    });
  }

  // For Minimalist, enforce maximum 3 elements after any injection
  if (normalizedStyle === 'minimalist' && backElements.length > 3) {
    backElements = backElements.slice(0, 3);
  }

  return {
    cardData: {
      front: {
        bgColor: frontBg,
        elements: frontElements,
      },
      back: {
        bgColor: backBg,
        elements: backElements,
      },
    },
    selectedMaterialId: materialId,
  };
}
