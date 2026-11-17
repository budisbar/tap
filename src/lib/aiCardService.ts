import { getGenerativeModel, SchemaType } from 'firebase/ai';
import { ai, GEMINI_MODEL_NAME } from './firebase';
import { CardState, ElementData, CardMaterial, MATERIALS } from '../components/studio/customizerData';

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
  style: 'simple' | 'balanced' | 'creative';
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

export async function generateCardWithAi(
  input: AiCardPromptInput,
  signal?: AbortSignal
): Promise<GeneratedCardResult> {
  let model;
  try {
    model = getGenerativeModel(
      ai,
      {
        model: GEMINI_MODEL_NAME,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: cardLayoutSchema,
          temperature: 0.7,
          maxOutputTokens: 2000,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      },
      {
        timeout: 30000,
        signal,
      }
    );
  } catch (modelInitErr: any) {
    console.error('Failed to initialize Gemini model:', modelInitErr);
    const errCode = modelInitErr?.code || 'AI/model-init-failed';
    throw new Error(`${errCode}: ${modelInitErr?.message || String(modelInitErr)}`);
  }

  const langText = input.language === 'pt' ? 'Portuguese' : 'English';
  const logoInfo = input.logo
    ? `User logo provided (ratio ${input.logo.aspectRatio}, dominant colors: ${input.logo.dominantColors.join(', ')}). Include 1 image element on front.`
    : 'No logo.';

  const contactList = input.contactInfo
    ? Object.entries(input.contactInfo)
        .filter(([_, v]) => Boolean(v))
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')
    : '';

  const prompt = `
Design an NFC card (428x270px). Safe margins: x: 24-380, y: 20-240.
Business: "${input.businessName}" (${input.businessType})
Card purpose: ${input.cardPurpose}
${contactList ? `Contact: ${contactList}` : ''}
${input.customText ? `Include text: "${input.customText}"` : ''}
${logoInfo}
Style: ${input.style}. Language: ${langText}.
Material rules:
- plastic: frontBg and backBg "#ffffff" or "#18181b", element colors from: ${input.preferredColors?.join(', ') || '#ffffff, #000000'}
- metal: frontBg and backBg strictly "#c8d0d8", element colors strictly "#3a4048"
- wood: frontBg and backBg strictly "#d8b784", element colors strictly "#2a1508"
Icon names for text field: contactless, nfc, review, menu, phone, mail, globe, insta, share.
Shapes for shape field: rectangle, circle, pill.
Return only the JSON layout.
`.trim();

  let response;
  try {
    response = await model.generateContent(prompt);
  } catch (genErr: any) {
    if (signal?.aborted) {
      if (signal.reason === 'TIMEOUT' || String(genErr).includes('taking too long') || String(genErr).includes('DEADLINE_EXCEEDED')) {
        throw new Error('This is taking too long. Please try again.');
      }
      throw new Error('USER_CANCELLED');
    }
    const rawMsg = genErr?.message || String(genErr);
    if (rawMsg.includes('DEADLINE_EXCEEDED') || rawMsg.includes('timeout')) {
      throw new Error('This is taking too long. Please try again.');
    }
    console.error('Gemini generateContent error:', genErr);
    const errCode = genErr?.code || genErr?.status || 'AI/fetch-error';
    throw new Error(`${errCode}: ${rawMsg}`);
  }

  let text = '';
  try {
    text = response.response.text();
  } catch (textErr: any) {
    console.error('Failed to extract text from Gemini response:', textErr);
    throw new Error(`AI/empty-response: Could not read text from Gemini (${textErr?.message || String(textErr)})`);
  }

  if (!text) {
    throw new Error('AI/empty-response: Gemini returned an empty response.');
  }

  let rawData: any;
  try {
    rawData = JSON.parse(text);
  } catch (jsonErr: any) {
    console.error('Failed to parse Gemini response as JSON:', jsonErr, 'Raw text:', text);
    throw new Error(`AI/json-parse-error: Malformed JSON output (${jsonErr?.message || String(jsonErr)})`);
  }

  // Validate and sanitize the generated card layout
  try {
    const sanitized = sanitizeGeneratedLayout(rawData, input);
    return sanitized;
  } catch (valErr: any) {
    console.error('Layout sanitization error:', valErr);
    throw new Error(`AI/layout-validation-error: Invalid layout structure (${valErr?.message || String(valErr)})`);
  }
}

function sanitizeGeneratedLayout(raw: any, input: AiCardPromptInput): GeneratedCardResult {
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

  const sanitizeElement = (el: any, index: number, side: 'front' | 'back'): ElementData => {
    const type: 'text' | 'shape' | 'icon' | 'image' = ['text', 'shape', 'icon', 'image'].includes(
      el.type
    )
      ? el.type
      : 'text';

    const width = Number(el.width) || (type === 'shape' ? 100 : type === 'image' ? 70 : 180);
    const height = Number(el.height) || (type === 'shape' ? 40 : type === 'image' ? 50 : 28);

    // Safe bounds clamping
    const x = Math.max(24, Math.min(Number(el.x) || 30, 428 - Math.min(width, 350) - 20));
    const y = Math.max(16, Math.min(Number(el.y) || 30, 270 - Math.min(height, 200) - 16));

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
      cleanEl.fontSize = Math.max(11, Math.min(Number(el.fontSize) || 16, 36));
      cleanEl.fontFamily = 'var(--font-sans)';
      cleanEl.textAlign = 'left';
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
        cleanEl.width = Math.max(40, Math.min(width, 110));
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

  const frontElements: ElementData[] = rawFrontList.map((el: any, i: number) => sanitizeElement(el, i, 'front'));
  const backElements: ElementData[] = rawBackList.map((el: any, i: number) => sanitizeElement(el, i, 'back'));

  // If user provided a logo and AI didn't include an image element, add it to front side
  if (input.logo?.dataUrl && !frontElements.some((e) => e.type === 'image')) {
    const ar = input.logo.aspectRatio || 1;
    const logoW = 75;
    const logoH = Math.round(logoW / ar);
    frontElements.unshift({
      id: `ai-logo-injected-${Date.now().toString().slice(-4)}`,
      type: 'image',
      imageUrl: input.logo.dataUrl,
      x: 32,
      y: 28,
      z: 1,
      width: logoW,
      height: logoH,
      color: isEngraved ? matchingMaterial.engraveColor || '#3a4048' : '#ffffff',
      opacity: 1,
    });
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
