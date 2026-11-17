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

// Structured JSON Schema for Gemini
const elementSchema = {
  type: SchemaType.OBJECT,
  properties: {
    type: { type: SchemaType.STRING }, // "text", "shape", "icon", "image"
    content: { type: SchemaType.STRING },
    iconId: { type: SchemaType.STRING },
    x: { type: SchemaType.INTEGER },
    y: { type: SchemaType.INTEGER },
    width: { type: SchemaType.INTEGER },
    height: { type: SchemaType.INTEGER },
    borderRadius: { type: SchemaType.INTEGER },
    color: { type: SchemaType.STRING },
    fontSize: { type: SchemaType.INTEGER },
    fontFamily: { type: SchemaType.STRING },
    textAlign: { type: SchemaType.STRING },
    textTransform: { type: SchemaType.STRING },
  },
  required: ['type', 'x', 'y', 'color'],
};

const cardLayoutSchema = {
  type: SchemaType.OBJECT,
  properties: {
    materialId: { type: SchemaType.STRING },
    front: {
      type: SchemaType.OBJECT,
      properties: {
        bgColor: { type: SchemaType.STRING },
        elements: {
          type: SchemaType.ARRAY,
          items: elementSchema,
        },
      },
      required: ['bgColor', 'elements'],
    },
    back: {
      type: SchemaType.OBJECT,
      properties: {
        bgColor: { type: SchemaType.STRING },
        elements: {
          type: SchemaType.ARRAY,
          items: elementSchema,
        },
      },
      required: ['bgColor', 'elements'],
    },
  },
  required: ['materialId', 'front', 'back'],
};

export async function generateCardWithAi(input: AiCardPromptInput): Promise<GeneratedCardResult> {
  let model;
  try {
    model = getGenerativeModel(ai, {
      model: GEMINI_MODEL_NAME,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: cardLayoutSchema,
        temperature: 0.7,
      },
    });
  } catch (modelInitErr: any) {
    console.error('Failed to initialize Gemini model:', modelInitErr);
    const errCode = modelInitErr?.code || 'AI/model-init-failed';
    throw new Error(`${errCode}: ${modelInitErr?.message || String(modelInitErr)}`);
  }

  const languagePrompt =
    input.language === 'pt'
      ? 'All customer-facing texts, call-to-actions, and instructions MUST be in natural, professional European/Brazilian Portuguese (e.g. "Toque para avaliar no Google", "Menu Digital", "Aproxime o seu telemóvel").'
      : 'All customer-facing texts, call-to-actions, and instructions MUST be in natural, professional English (e.g. "Tap to review on Google", "Digital Menu", "Tap phone to connect").';

  let purposeGuidance = '';
  if (input.cardPurpose === 'reviews') {
    purposeGuidance = `
PURPOSE: Google Reviews NFC Card.
- FRONT: Focus on encouraging Google reviews. Prominent headline (e.g., "${input.language === 'pt' ? 'Gostou da sua experiência?' : 'Enjoyed your visit?'}") with subtext (e.g., "${input.language === 'pt' ? 'Toque para nos avaliar no Google' : 'Tap to review us on Google'}"), iconId: "review" (stars) and/or iconId: "contactless".
- BACK: The business name "${input.businessName}" prominent, with supportive tagline and tap indicator (iconId: "contactless").`;
  } else if (input.cardPurpose === 'business') {
    purposeGuidance = `
PURPOSE: Smart Contact Business Card.
- FRONT: Clean brand identity with business name "${input.businessName}", tagline or business type "${input.businessType}", and optional logo slot.
- BACK: Contact details:
  ${input.contactInfo?.name ? `- Name: "${input.contactInfo.name}" (prominent)` : ''}
  ${input.contactInfo?.role ? `- Role: "${input.contactInfo.role}"` : ''}
  ${input.contactInfo?.phone ? `- Phone: "${input.contactInfo.phone}" (with iconId: "phone")` : ''}
  ${input.contactInfo?.email ? `- Email: "${input.contactInfo.email}" (with iconId: "mail")` : ''}
  ${input.contactInfo?.website ? `- Website: "${input.contactInfo.website}" (with iconId: "globe")` : ''}
  - Tap contactless indicator icon (iconId: "contactless").`;
  } else if (input.cardPurpose === 'menu') {
    purposeGuidance = `
PURPOSE: Digital Menu NFC Card.
- FRONT: Large "Digital Menu" or "${input.language === 'pt' ? 'Menu Digital' : 'Digital Menu'}" title, business name "${input.businessName}", iconId: "menu" and iconId: "contactless".
- BACK: Instructions: "${input.language === 'pt' ? 'Aproxime o telemóvel para ver o nosso menu e especiais' : 'Tap your phone to view our full menu and specials'}", iconId: "contactless".`;
  } else {
    purposeGuidance = `
PURPOSE: Social Media & Follow NFC Card.
- FRONT: "Follow Us" or "${input.language === 'pt' ? 'Siga-nos' : 'Follow Us'}", business name "${input.businessName}", social icons (iconId: "insta" or iconId: "share"), iconId: "contactless".
- BACK: "${input.language === 'pt' ? 'Aproxime para conectar' : 'Tap phone to connect'}", handle / brand presence.`;
  }

  const logoDetails = input.logo
    ? `The user has an uploaded logo with aspect ratio ${input.logo.aspectRatio} (width/height) and dominant colors: ${input.logo.dominantColors.join(', ')}. Include an element with type: "image" positioned appropriately (e.g. top-left or top-center of front side), with width between 60 and 90.`
    : 'No logo provided. Rely cleanly on typography and layout.';

  const materialGuidance =
    input.material === 'metal'
      ? `MATERIAL: Metal (Brushed Stainless Steel).
- materialId MUST be "metal-silver".
- bgColor MUST be "#c8d0d8".
- All element colors MUST be laser-etched dark gray "#3a4048". NO other colors allowed.`
      : input.material === 'wood'
      ? `MATERIAL: Wood (Natural Bamboo).
- materialId MUST be "wood-bamboo" or "wood-walnut".
- bgColor MUST be "#d8b784" (for bamboo) or "#462816" (for walnut).
- All element colors MUST be laser-burned dark brown "#2a1508" (for bamboo) or "#160a03" (for walnut). NO other colors allowed.`
      : `MATERIAL: Plastic (PVC).
- materialId can be "plastic-white" (with bgColor "#ffffff") or "plastic-black" (with bgColor "#18181b").
- Preferred colors to weave into accents or text: ${input.preferredColors?.join(', ') || 'High-contrast black, white, and subtle accents'}.`;

  const prompt = `
You are an expert graphic designer for NFC physical smart cards.
Design a high-quality physical smart card with dimensions exactly 428 pixels wide by 270 pixels tall.
All elements must fit strictly within safe printable margins: x between 24 and 380, y between 20 and 240.

BUSINESS INFORMATION:
- Business Name: "${input.businessName}"
- Business Type: "${input.businessType}"
${input.customText ? `- Custom line of text to include: "${input.customText}"` : ''}

${purposeGuidance}

STYLE PREFERENCE:
- Style: ${input.style} (simple = minimal whitespace; balanced = structured hierarchy; creative = bold typography and subtle shapes).
${logoDetails}
${materialGuidance}
${languagePrompt}

AVAILABLE ICON IDS:
contactless, nfc, review, menu, wifi, coffee, shop, heart, user, map, phone, mail, globe, insta, fb, twitter, linkedin, check, link, share.

AVAILABLE GOOGLE FONTS:
"Inter", sans-serif; "Montserrat", sans-serif; "Playfair Display", serif; "Cinzel", serif; "Poppins", sans-serif; "Bebas Neue", sans-serif; "Caveat", cursive; "Lato", sans-serif; "Oswald", sans-serif.

Return only the structured JSON layout adhering to the schema.
`;

  let response;
  try {
    response = await model.generateContent(prompt);
  } catch (genErr: any) {
    console.error('Gemini generateContent error:', genErr);
    const rawMsg = genErr?.message || String(genErr);
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
  } else if (raw.front?.bgColor === '#18181b' || raw.front?.bgColor === '#000000') {
    materialId = 'plastic-black';
  }

  const matchingMaterial = MATERIALS.find((m) => m.id === materialId) || MATERIALS[0];
  const isEngraved = matchingMaterial.category === 'metal' || matchingMaterial.category === 'wood';

  const defaultBg = isEngraved
    ? matchingMaterial.bgColor
    : materialId === 'plastic-black'
    ? '#18181b'
    : '#ffffff';

  const frontBg = isEngraved ? matchingMaterial.bgColor : raw.front?.bgColor || defaultBg;
  const backBg = isEngraved ? matchingMaterial.bgColor : raw.back?.bgColor || defaultBg;

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
      opacity: 1,
    };

    if (type === 'text') {
      cleanEl.content = String(el.content || input.businessName);
      cleanEl.fontSize = Math.max(11, Math.min(Number(el.fontSize) || 16, 36));
      cleanEl.fontFamily = el.fontFamily || 'var(--font-sans)';
      cleanEl.textAlign = ['left', 'center', 'right'].includes(el.textAlign) ? el.textAlign : 'left';
      cleanEl.textTransform = el.textTransform === 'uppercase' ? 'uppercase' : 'none';
    } else if (type === 'icon') {
      cleanEl.iconId = el.iconId || 'contactless';
      cleanEl.width = Math.max(20, Math.min(width, 60));
      cleanEl.height = cleanEl.width;
    } else if (type === 'shape') {
      cleanEl.borderRadius = Number(el.borderRadius) || 0;
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

  const frontElements: ElementData[] = Array.isArray(raw.front?.elements)
    ? raw.front.elements.map((el: any, i: number) => sanitizeElement(el, i, 'front'))
    : [];

  const backElements: ElementData[] = Array.isArray(raw.back?.elements)
    ? raw.back.elements.map((el: any, i: number) => sanitizeElement(el, i, 'back'))
    : [];

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
