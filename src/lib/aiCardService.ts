import { getGenerativeModel, SchemaType, ThinkingLevel } from 'firebase/ai';
import { ai, PRIMARY_GEMINI_MODEL, BACKUP_GEMINI_MODEL } from './firebase';
import { CardState, ElementData, CardMaterial, MATERIALS, isEngravedMaterial } from '../components/studio/customizerData';

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
  description?: string;
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

// Simplified Flat JSON Schema for Canvas Elements (shared by Generator & Editor)
const elementSchema = {
  type: SchemaType.OBJECT,
  properties: {
    id: { type: SchemaType.STRING },
    type: { type: SchemaType.STRING }, // "text", "shape", "icon", "image"
    x: { type: SchemaType.INTEGER },
    y: { type: SchemaType.INTEGER },
    width: { type: SchemaType.INTEGER },
    height: { type: SchemaType.INTEGER },
    text: { type: SchemaType.STRING },
    font: { type: SchemaType.STRING },
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
    cannotFulfill: { type: SchemaType.BOOLEAN },
    message: { type: SchemaType.STRING },
    summary: { type: SchemaType.STRING },
  },
  required: ['materialId', 'frontBg', 'backBg', 'front', 'back'],
};

function attachDebugReason(err: any, reason: string): Error {
  const wrapped: any = err instanceof Error ? err : new Error(String(err));
  if (!wrapped.debugReason) {
    wrapped.debugReason = reason;
  }
  return wrapped;
}

async function callGeminiModel(
  modelName: string,
  prompt: string,
  signal?: AbortSignal,
  schema: any = cardLayoutSchema,
  maxOutputTokens: number = 2000
) {
  let model = getGenerativeModel(
    ai,
    {
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.7,
        maxOutputTokens,
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
            responseSchema: schema,
            temperature: 0.7,
            maxOutputTokens,
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

async function executePromptWithRetries(
  prompt: string,
  schema: any,
  fallbackErrorMessage: string,
  logTag: string,
  signal?: AbortSignal,
  maxOutputTokens: number = 2000
): Promise<any> {
  let response: any = null;
  let lastError: any = null;

  // 1. Primary Model: Initial attempt + up to 2 retries on 500, 503, 429 / high demand
  const retryDelays = [2000, 4000];
  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      if (signal?.aborted) throw new Error('USER_CANCELLED');
      response = await callGeminiModel(PRIMARY_MODEL, prompt, signal, schema, maxOutputTokens);
      lastError = null;
      break;
    } catch (err: any) {
      lastError = err;
      console.error(`[${logTag}] ${PRIMARY_MODEL} attempt ${attempt + 1} error:`, err);

      if (signal?.aborted) {
        if (signal.reason === 'TIMEOUT' || String(err).includes('taking too long') || String(err).includes('DEADLINE_EXCEEDED')) {
          throw attachDebugReason(new Error('This is taking too long. Please try again.'), 'TIMEOUT: Request exceeded 30s');
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
      console.warn(`[${logTag}] Primary model failed. Attempting backup model: ${BACKUP_MODEL}`);
      response = await callGeminiModel(BACKUP_MODEL, prompt, signal, schema, maxOutputTokens);
      lastError = null;
    } catch (backupErr: any) {
      lastError = backupErr;
      console.error(`[${logTag}] Backup model ${BACKUP_MODEL} error:`, backupErr);
    }
  }

  if (!response) {
    if (signal?.aborted) {
      if (signal.reason === 'TIMEOUT' || String(lastError).includes('taking too long') || String(lastError).includes('DEADLINE_EXCEEDED')) {
        throw attachDebugReason(new Error('This is taking too long. Please try again.'), 'TIMEOUT: Request exceeded 30s');
      }
      throw new Error('USER_CANCELLED');
    }
    const errCode = lastError?.code || lastError?.status || lastError?.name || 'AI/fetch-error';
    const errMsg = lastError?.message || String(lastError || 'Unknown error');
    const detail = `${errCode}: ${errMsg}`;
    if (isHighDemandError(lastError)) {
      throw attachDebugReason(new Error('Our AI is very busy right now. Please try again in a minute.'), detail);
    }
    throw attachDebugReason(new Error(fallbackErrorMessage), detail);
  }

  let text = '';
  try {
    text = response.response.text();
  } catch (textErr: any) {
    console.error(`[${logTag}] Failed to extract text from Gemini response:`, textErr);
    throw attachDebugReason(
      new Error(fallbackErrorMessage),
      `RESPONSE_READ_ERROR: ${textErr?.message || String(textErr)}`
    );
  }

  if (!text) {
    console.error(`[${logTag}] Raw AI response was empty.`);
    throw attachDebugReason(new Error(fallbackErrorMessage), 'EMPTY_RESPONSE: Gemini returned empty text');
  }

  if (logTag === 'AI Edit') {
    console.error('[AI Edit] Raw AI response:', text);
  }

  const cleanedJson = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(cleanedJson);
  } catch (jsonErr: any) {
    console.error(`[${logTag}] Failed to parse Gemini response as JSON:`, jsonErr, 'Raw text:', text);
    throw attachDebugReason(
      new Error(fallbackErrorMessage),
      `INVALID_JSON: ${jsonErr?.message || String(jsonErr)}`
    );
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

  // Text explicitly requested in user's free-form description
  if (input.description && input.description.trim()) {
    const cleanedDesc = cleanStringForComparison(input.description);
    if (cleanedDesc) {
      if (cleaned === cleanedDesc || cleanedDesc.includes(cleaned)) {
        return true;
      }
      const descWords = new Set(cleanedDesc.split(' ').filter(Boolean));
      if (textWords.length > 0 && textWords.every((w) => descWords.has(w))) {
        return true;
      }
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

  const descriptionBlock = input.description?.trim()
    ? `
USER DESCRIPTION ("Describe what's in your head"):
"${input.description.trim()}"
Rule: "Use the user's description to guide the style, mood, layout and colours. Text the user explicitly asks to put on the card counts as their content and may be used. Do not invent anything else."
Priority rule: The form fields take priority if they conflict with the description.`
    : '';

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
${descriptionBlock}

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

  const rawData = await executePromptWithRetries(
    prompt,
    cardLayoutSchema,
    "We couldn't create your card. Please try again.",
    'AI Generation',
    signal
  );

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

// ---------------------------------------------------------------------------
// EDIT BY ASKING (NATURAL LANGUAGE CARD EDITING)
// ---------------------------------------------------------------------------

export interface AiCardEditInput {
  cardData: {
    front: CardState;
    back: CardState;
  };
  materialId: string;
  materialCategory: 'plastic' | 'metal' | 'wood';
  cardWidth: number;
  cardHeight: number;
  userRequest: string;
  recentRequests: string[];
  selectedElementId?: string | null;
  selectedSide?: 'front' | 'back';
}

export interface EditedCardResult {
  cannotFulfill: boolean;
  message?: string;
  summary?: string;
  cardData?: {
    front: CardState;
    back: CardState;
  };
}

function buildEditPayload(input: AiCardEditInput) {
  const imageMap = new Map<string, ElementData>();
  const idToPlaceholder = new Map<string, string>();
  let imageIndex = 0;

  const mapSide = (side: CardState) =>
    side.elements
      .filter((el) => el.type !== 'drawing')
      .map((el) => {
        const isImage = el.type === 'image';
        let id = el.id;
        if (isImage) {
          imageIndex += 1;
          const placeholderId = `image_${imageIndex}`;
          imageMap.set(placeholderId, el);
          idToPlaceholder.set(el.id, placeholderId);
          id = placeholderId;
        }

        const serialized: Record<string, any> = {
          id,
          type: el.type,
          x: Math.round(el.x),
          y: Math.round(el.y),
          width: Math.round(el.width ?? (isImage ? 100 : el.type === 'icon' ? 40 : 140)),
          height: Math.round(el.height ?? (isImage ? 100 : el.type === 'icon' ? 40 : 28)),
          rotation: Math.round(el.rotation || 0),
          color: el.color || '#000000',
        };

        if (el.type === 'text') {
          serialized.text = el.content || '';
          serialized.font = el.fontFamily || 'var(--font-sans)';
          serialized.fontSize = el.fontSize || 16;
        } else if (el.type === 'icon') {
          serialized.text = el.iconId || 'contactless';
        } else if (el.type === 'shape') {
          serialized.shape = (el.borderRadius || 0) >= 999 ? 'circle' : 'rectangle';
        }
        // Images strictly emit placeholder id, position, width, height, rotation, color (never URLs or base64)
        return serialized;
      });

  const frontMapped = mapSide(input.cardData.front);
  const backMapped = mapSide(input.cardData.back);
  const selectedPlaceholderOrId = input.selectedElementId
    ? idToPlaceholder.get(input.selectedElementId) || input.selectedElementId
    : null;

  return {
    imageMap,
    selectedPlaceholderOrId,
    payload: {
      materialId: input.materialId,
      frontBg: input.cardData.front.bgColor,
      backBg: input.cardData.back.bgColor,
      front: frontMapped,
      back: backMapped,
    },
  };
}

function isRemovalRequest(request: string): boolean {
  return /(\bremove\b|\bdelete\b|\bhide\b|\bclear\b|\bdrop\b|\bwithout\b|\bapagar\b|\bremover\b|\bexcluir\b|\beliminar\b|\btirar\b|\blimpar\b|\bsem\b)/i.test(
    request
  );
}

export async function editCardWithAi(
  input: AiCardEditInput,
  signal?: AbortSignal
): Promise<EditedCardResult> {
  const cardW = input.cardWidth || 428;
  const cardH = input.cardHeight || 270;
  const safeMaxX = Math.max(40, cardW - 24);
  const safeMaxY = Math.max(40, cardH - 16);

  const { imageMap, selectedPlaceholderOrId, payload } = buildEditPayload(input);
  const currentDesignJson = JSON.stringify(payload);

  const historyBlock =
    input.recentRequests.length > 0
      ? `RECENT EDIT REQUESTS (oldest to newest):\n${input.recentRequests
          .slice(-3)
          .map((req, idx) => `${idx + 1}. "${req}"`)
          .join('\n')}`
      : 'RECENT EDIT REQUESTS: None';

  const selectedBlock = selectedPlaceholderOrId
    ? `\nSELECTED ELEMENT:\nThe user has selected element id "${selectedPlaceholderOrId}" on the "${
        input.selectedSide || 'front'
      }" side.\nRule: "Apply the change only to the selected element. Do not change anything else."\n`
    : '';

  const matchingMaterial = MATERIALS.find((m) => m.id === input.materialId);
  const engraveRule =
    input.materialCategory === 'metal' || input.materialCategory === 'wood'
      ? `Material is ${input.materialCategory} (${matchingMaterial?.name || input.materialId}). Background MUST stay "${matchingMaterial?.bgColor || input.cardData.front.bgColor}" and ALL elements MUST use color "${matchingMaterial?.engraveColor || '#3a4048'}".`
      : `Material is plastic (${input.materialId}). Print-safe colors allowed for plastic backgrounds and elements.`;

  const prompt = `
You are editing an existing NFC card design in JSON format.
The user may write in English or Portuguese.

CRITICAL RULES:
- Change only what the user asked for. Keep everything else exactly as it is.
- Never add text, icons or elements the user did not ask for.
- Keep every element inside the safe margins unless it is intentionally cropped.
- Metal and wood: no colours, engraved look only.
- Preserve every element's "id" field on all existing elements (especially image placeholders like "image_1").
- For "image" elements (the user's uploaded logo), never remove or change image identity; only update x, y, width, height, or rotation when asked.
- Card dimensions: ${cardW}x${cardH}px. Safe margins: x: 24-${safeMaxX}, y: 16-${safeMaxY}.
- ${engraveRule}
- If the request is unclear or impossible (for example "add a photo of my shop", adding photos, realistic images, 3D renders, or anything outside card layout/text/colors/sizes/shapes/icons), set "cannotFulfill": true, "message": "I couldn't do that. Try something like 'make the name bigger'.", and return the unchanged "front" and "back" arrays.
- Otherwise set "cannotFulfill": false, return the full updated card design ("materialId", "frontBg", "backBg", "front", "back"), and include a short "summary" field (one sentence, in the language the user wrote in) describing what you changed.
${selectedBlock}
${historyBlock}

CURRENT REQUEST:
"${input.userRequest}"

CURRENT DESIGN JSON:
${currentDesignJson}

Icon names for icon elements ("text" field): contactless, nfc, review, menu, phone, mail, globe, insta, share.
Shape names for shape elements ("shape" field): rectangle, circle, pill.

Return only the JSON result.
`.trim();

  const rawData = await executePromptWithRetries(
    prompt,
    cardLayoutSchema,
    "We couldn't apply that change. Please try again.",
    'AI Edit',
    signal,
    4000
  );

  try {
    return sanitizeEditedLayout(rawData, input, imageMap);
  } catch (valErr: any) {
    console.error('[AI Edit] Layout validation error:', valErr);
    throw attachDebugReason(
      new Error("We couldn't apply that change. Please try again."),
      valErr?.debugReason || valErr?.message || String(valErr)
    );
  }
}

function sanitizeEditedLayout(
  raw: any,
  input: AiCardEditInput,
  imageMap: Map<string, ElementData>
): EditedCardResult {
  if (!raw || typeof raw !== 'object') {
    throw attachDebugReason(new Error('Invalid response structure'), 'VALIDATION_OBJECT: Response is not a JSON object');
  }

  if (raw.cannotFulfill === true) {
    return {
      cannotFulfill: true,
      message: "I couldn't do that. Try something like 'make the name bigger'.",
    };
  }

  const rawFrontHasItems = Array.isArray(raw.front) && raw.front.length > 0;
  const rawBackHasItems = Array.isArray(raw.back) && raw.back.length > 0;

  if (!rawFrontHasItems && !rawBackHasItems) {
    if (typeof raw.message === 'string' && raw.message.trim()) {
      return {
        cannotFulfill: true,
        message: "I couldn't do that. Try something like 'make the name bigger'.",
      };
    }
    throw attachDebugReason(new Error('No elements returned'), 'VALIDATION_EMPTY: AI returned no elements on front or back');
  }

  const cardW = input.cardWidth || 428;
  const cardH = input.cardHeight || 270;
  const matchingMaterial = MATERIALS.find((m) => m.id === input.materialId);
  const isEngraved =
    input.materialCategory === 'metal' ||
    input.materialCategory === 'wood' ||
    isEngravedMaterial(matchingMaterial);

  const frontBg = isEngraved && matchingMaterial
    ? matchingMaterial.bgColor
    : typeof raw.frontBg === 'string' && raw.frontBg.trim()
    ? raw.frontBg.trim()
    : input.cardData.front.bgColor;

  const backBg = isEngraved && matchingMaterial
    ? matchingMaterial.bgColor
    : typeof raw.backBg === 'string' && raw.backBg.trim()
    ? raw.backBg.trim()
    : input.cardData.back.bgColor;

  const allowRemoval = isRemovalRequest(input.userRequest);

  const sanitizeEditedSide = (rawList: any[] | undefined, origSide: CardState, sideName: 'front' | 'back'): CardState => {
    const targetBg = sideName === 'front' ? frontBg : backBg;

    // Forgiving rule: if AI returned only one side, keep the other side unchanged
    if (!Array.isArray(rawList) || rawList.length === 0) {
      return {
        bgColor: targetBg,
        elements: origSide.elements.map((el) => ({
          ...el,
          color: isEngraved && matchingMaterial ? matchingMaterial.engraveColor || el.color : el.color,
        })),
      };
    }

    const origById = new Map<string, ElementData>(origSide.elements.map((e) => [e.id, e]));
    const origImages = origSide.elements.filter((e) => e.type === 'image' && e.imageUrl);
    const origDrawings = origSide.elements.filter((e) => e.type === 'drawing');
    const usedOrigIds = new Set<string>();

    const sanitizedElements: ElementData[] = [];

    rawList.forEach((el: any, index: number) => {
      if (!el || typeof el !== 'object') return;

      const rawType = ['text', 'shape', 'icon', 'image'].includes(el.type) ? el.type : null;
      let origMatch: ElementData | undefined;

      // 1. Direct match by placeholder id (e.g. "image_1") or original element id
      if (typeof el.id === 'string' && el.id.trim()) {
        const mappedImg = imageMap.get(el.id.trim());
        if (mappedImg && !usedOrigIds.has(mappedImg.id)) {
          origMatch = mappedImg;
        } else {
          const direct = origById.get(el.id.trim());
          if (direct && !usedOrigIds.has(direct.id)) {
            origMatch = direct;
          }
        }
      }

      // Prioritize the user-selected element if AI returned a single element with missing/changed id
      if (
        !origMatch &&
        input.selectedElementId &&
        sideName === (input.selectedSide === 'back' ? 'back' : 'front') &&
        rawList.length === 1
      ) {
        const selectedCandidate = origById.get(input.selectedElementId);
        if (selectedCandidate && !usedOrigIds.has(selectedCandidate.id) && selectedCandidate.type === rawType) {
          origMatch = selectedCandidate;
        }
      }

      // 2. Forgiving match when id is missing or changed: match by placeholder in text, type & text, or type order
      if (!origMatch && rawType === 'image') {
        if (typeof el.text === 'string' && imageMap.has(el.text.trim())) {
          const byTextPlaceholder = imageMap.get(el.text.trim());
          if (byTextPlaceholder && !usedOrigIds.has(byTextPlaceholder.id)) {
            origMatch = byTextPlaceholder;
          }
        }
        if (!origMatch) {
          origMatch = origImages.find((imgEl) => !usedOrigIds.has(imgEl.id));
        }
        if (!origMatch) {
          for (const mapped of imageMap.values()) {
            if (!usedOrigIds.has(mapped.id)) {
              origMatch = mapped;
              break;
            }
          }
        }
      }

      if (!origMatch && rawType === 'text') {
        const cleanedText = typeof el.text === 'string' ? cleanStringForComparison(el.text) : '';
        if (cleanedText) {
          origMatch = origSide.elements.find(
            (orig) =>
              !usedOrigIds.has(orig.id) &&
              orig.type === 'text' &&
              orig.content &&
              cleanStringForComparison(orig.content) === cleanedText
          );
        }
        if (!origMatch) {
          origMatch = origSide.elements.find((orig) => !usedOrigIds.has(orig.id) && orig.type === 'text');
        }
      }

      if (!origMatch && rawType === 'icon') {
        const iconName = typeof el.text === 'string' ? el.text.trim().toLowerCase() : '';
        if (iconName) {
          origMatch = origSide.elements.find(
            (orig) => !usedOrigIds.has(orig.id) && orig.type === 'icon' && orig.iconId?.toLowerCase() === iconName
          );
        }
        if (!origMatch) {
          origMatch = origSide.elements.find((orig) => !usedOrigIds.has(orig.id) && orig.type === 'icon');
        }
      }

      if (!origMatch && rawType === 'shape') {
        origMatch = origSide.elements.find((orig) => !usedOrigIds.has(orig.id) && orig.type === 'shape');
      }

      const type: ElementData['type'] = origMatch?.type || rawType || 'text';

      // Never allow AI to invent a brand-new image without an existing uploaded image
      if (type === 'image' && (!origMatch || !origMatch.imageUrl)) {
        return;
      }

      if (origMatch) {
        usedOrigIds.add(origMatch.id);
      }

      const rawW = Number(el.width);
      const rawH = Number(el.height);
      const defaultW = origMatch?.width ?? (type === 'shape' ? 100 : type === 'image' ? 100 : type === 'icon' ? 40 : 140);
      const defaultH = origMatch?.height ?? (type === 'shape' ? 40 : type === 'image' ? 80 : type === 'icon' ? 40 : 28);

      let width = Number.isFinite(rawW) && rawW > 0 ? Math.round(rawW) : defaultW;
      let height: number | undefined = Number.isFinite(rawH) && rawH > 0 ? Math.round(rawH) : origMatch?.height ?? defaultH;

      if (type === 'image' && origMatch) {
        const origW = origMatch.width || 100;
        const origH = origMatch.height || origW;
        const ar = origW / Math.max(1, origH);
        let targetW = Number.isFinite(rawW) && rawW > 0 ? rawW : origW;
        if ((!Number.isFinite(rawW) || rawW <= 0) && Number.isFinite(rawH) && rawH > 0 && origMatch.height) {
          targetW = rawH * ar;
        }
        width = Math.max(24, Math.min(Math.round(targetW), Math.round(cardW * 1.15)));
        height = origMatch.height ? Math.round(width / Math.max(0.1, ar)) : undefined;
      } else if (type === 'icon') {
        width = Math.max(20, Math.min(width, 80));
        height = width;
      }

      const rawX = Number(el.x);
      const rawY = Number(el.y);
      const fallbackX = origMatch ? origMatch.x : 30;
      const fallbackY = origMatch ? origMatch.y : 30;
      const candidateX = Number.isFinite(rawX) ? Math.round(rawX) : fallbackX;
      const candidateY = Number.isFinite(rawY) ? Math.round(rawY) : fallbackY;

      let x: number;
      let y: number;
      if (type === 'text' || type === 'icon') {
        const effW = Math.min(width, Math.max(40, cardW - 48));
        const effH = Math.min(height ?? 28, Math.max(24, cardH - 32));
        x = Math.max(24, Math.min(candidateX, Math.max(24, cardW - effW - 24)));
        y = Math.max(16, Math.min(candidateY, Math.max(16, cardH - effH - 16)));
      } else {
        x = Math.max(-120, Math.min(candidateX, cardW - 16));
        y = Math.max(-100, Math.min(candidateY, cardH - 16));
      }

      let color =
        typeof el.color === 'string' && el.color.trim()
          ? el.color.trim()
          : origMatch?.color || (origSide.bgColor === '#18181b' ? '#ffffff' : '#18181b');
      if (isEngraved && matchingMaterial) {
        color = matchingMaterial.engraveColor || '#3a4048';
      }

      const elementId = origMatch ? origMatch.id : `ai-edit-${sideName}-${index + 1}-${Date.now().toString().slice(-4)}`;

      const cleanEl: ElementData = {
        ...(origMatch || {}),
        id: elementId,
        type,
        x,
        y,
        z: origMatch?.z ?? index + 1,
        width,
        height,
        color,
        rotation: Number.isFinite(Number(el.rotation)) ? Math.round(Number(el.rotation)) : origMatch?.rotation || 0,
        opacity: origMatch?.opacity ?? 1,
      };

      if (type === 'text') {
        const textContent = typeof el.text === 'string' && el.text.trim() ? el.text : origMatch?.content;
        if (!textContent) return;
        cleanEl.content = textContent;
        const rawFontSize = Number(el.fontSize);
        cleanEl.fontSize = Math.max(
          10,
          Math.min(Number.isFinite(rawFontSize) && rawFontSize > 0 ? Math.round(rawFontSize) : origMatch?.fontSize || 16, 64)
        );
        cleanEl.fontFamily =
          typeof el.font === 'string' && el.font.trim()
            ? el.font.trim()
            : origMatch?.fontFamily || 'var(--font-sans)';
        cleanEl.textAlign = origMatch?.textAlign || 'left';
        cleanEl.textTransform = origMatch?.textTransform || 'none';
      } else if (type === 'icon') {
        cleanEl.iconId = typeof el.text === 'string' && el.text.trim() ? el.text.trim() : origMatch?.iconId || 'contactless';
      } else if (type === 'shape') {
        if (el.shape === 'circle' || el.shape === 'pill') {
          cleanEl.borderRadius = 999;
        } else if (el.shape === 'rectangle') {
          cleanEl.borderRadius =
            origMatch?.borderRadius && origMatch.borderRadius < 999 ? origMatch.borderRadius : 0;
        } else {
          cleanEl.borderRadius = origMatch?.borderRadius ?? 0;
        }
      } else if (type === 'image' && origMatch) {
        // Restore original uploaded logo asset from placeholder id
        cleanEl.imageUrl = origMatch.imageUrl;
      }

      sanitizedElements.push(cleanEl);
    });

    // Retain any uploaded logo image if omitted without an explicit removal request
    if (!allowRemoval) {
      origImages.forEach((imgEl) => {
        if (!usedOrigIds.has(imgEl.id)) {
          sanitizedElements.push({ ...imgEl });
        }
      });
    }

    // Preserve hand-drawn strokes on the side
    origDrawings.forEach((drawEl) => {
      sanitizedElements.push({
        ...drawEl,
        color: isEngraved && matchingMaterial ? matchingMaterial.engraveColor || drawEl.color : drawEl.color,
      });
    });

    sanitizedElements.sort((a, b) => (a.z || 0) - (b.z || 0));

    return {
      bgColor: targetBg,
      elements: sanitizedElements,
    };
  };

  const frontState = sanitizeEditedSide(rawFrontHasItems ? raw.front : undefined, input.cardData.front, 'front');
  const backState = sanitizeEditedSide(rawBackHasItems ? raw.back : undefined, input.cardData.back, 'back');
  const summary = typeof raw.summary === 'string' && raw.summary.trim() ? raw.summary.trim() : undefined;

  // If editing a single selected element, keep everything else strictly untouched
  if (input.selectedElementId) {
    const targetSide: 'front' | 'back' = input.selectedSide === 'back' ? 'back' : 'front';
    const origTargetSide = input.cardData[targetSide];
    const origSelected = origTargetSide.elements.find((e) => e.id === input.selectedElementId);
    if (origSelected) {
      const sanitizedTargetSide = targetSide === 'front' ? frontState : backState;
      const updatedSelected =
        sanitizedTargetSide.elements.find((e) => e.id === input.selectedElementId) || origSelected;
      const lockedTargetSide: CardState = {
        bgColor: origTargetSide.bgColor,
        elements: origTargetSide.elements.map((el) =>
          el.id === input.selectedElementId ? updatedSelected : { ...el }
        ),
      };
      const otherSide: 'front' | 'back' = targetSide === 'front' ? 'back' : 'front';
      const lockedOtherSide: CardState = {
        bgColor: input.cardData[otherSide].bgColor,
        elements: input.cardData[otherSide].elements.map((el) => ({ ...el })),
      };
      return {
        cannotFulfill: false,
        summary,
        cardData: {
          front: targetSide === 'front' ? lockedTargetSide : lockedOtherSide,
          back: targetSide === 'back' ? lockedTargetSide : lockedOtherSide,
        },
      };
    }
  }

  return {
    cannotFulfill: false,
    summary,
    cardData: {
      front: frontState,
      back: backState,
    },
  };
}
