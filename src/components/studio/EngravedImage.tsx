import { useEffect, useState, type CSSProperties } from 'react';

interface EngravedImageProps {
  src: string;
  alt: string;
  mode: 'metal' | 'wood';
  engraveColor: string;
  width?: number | string;
  style?: CSSProperties;
  className?: string;
}

const processedImageCache = new Map<string, string>();

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return [42, 21, 8];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function isOpaqueWhiteCorner(data: Uint8ClampedArray, w: number, h: number, x: number, y: number): boolean {
  const idx = (Math.min(Math.max(y, 0), h - 1) * w + Math.min(Math.max(x, 0), w - 1)) * 4;
  return data[idx + 3] > 200 && data[idx] > 235 && data[idx + 1] > 235 && data[idx + 2] > 235;
}

/**
 * Converts an uploaded logo or raster image into a single-tone laser-engraved
 * (metal) or laser-burned (wood) PNG data URL via an offscreen canvas.
 */
export default function EngravedImage({
  src,
  alt,
  mode,
  engraveColor,
  width,
  style,
  className = '',
}: EngravedImageProps) {
  const cacheKey = `${mode}:${engraveColor}:${src}`;
  const [processedSrc, setProcessedSrc] = useState<string>(() => processedImageCache.get(cacheKey) || '');

  useEffect(() => {
    const cached = processedImageCache.get(cacheKey);
    if (cached) {
      setProcessedSrc(cached);
      return;
    }

    let cancelled = false;
    const img = new Image();
    if (!src.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      if (cancelled) return;
      try {
        const naturalW = img.naturalWidth || 200;
        const naturalH = img.naturalHeight || 200;
        const maxDim = 500;
        const scale = Math.min(1, maxDim / Math.max(naturalW, naturalH));
        const w = Math.max(1, Math.round(naturalW * scale));
        const h = Math.max(1, Math.round(naturalH * scale));

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        const hasWhiteBg =
          isOpaqueWhiteCorner(data, w, h, 0, 0) &&
          isOpaqueWhiteCorner(data, w, h, w - 1, 0) &&
          isOpaqueWhiteCorner(data, w, h, 0, h - 1) &&
          isOpaqueWhiteCorner(data, w, h, w - 1, h - 1);

        const [er, eg, eb] = hexToRgb(engraveColor);

        for (let y = 0; y < h; y++) {
          const grainMod =
            mode === 'wood' ? 0.91 + 0.09 * Math.sin(y * 0.45) * Math.cos(y * 0.13) : 1;

          for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a < 10) {
              data[i + 3] = 0;
              continue;
            }

            let outAlpha = a;
            if (hasWhiteBg) {
              const lum = 0.299 * r + 0.587 * g + 0.114 * b;
              if (lum > 240) {
                outAlpha = 0;
              } else {
                const strength = Math.min(1, Math.max(0, (242 - lum) / 140));
                outAlpha = Math.round(a * strength);
              }
            }

            if (mode === 'wood' && outAlpha > 0) {
              const micro = grainMod + 0.04 * Math.sin(x * 0.12 + y * 0.7);
              outAlpha = Math.min(255, Math.max(0, Math.round(outAlpha * micro)));
            }

            data[i] = er;
            data[i + 1] = eg;
            data[i + 2] = eb;
            data[i + 3] = outAlpha;
          }
        }

        ctx.putImageData(imageData, 0, 0);
        const resultUrl = canvas.toDataURL('image/png');
        processedImageCache.set(cacheKey, resultUrl);
        if (!cancelled) {
          setProcessedSrc(resultUrl);
        }
      } catch {
        if (!cancelled) {
          setProcessedSrc('');
        }
      }
    };

    img.onerror = () => {
      if (!cancelled) setProcessedSrc('');
    };

    img.src = src;

    return () => {
      cancelled = true;
    };
  }, [cacheKey, engraveColor, mode, src]);

  const fallbackFilter =
    mode === 'metal'
      ? 'grayscale(1) contrast(1.3) brightness(0.45)'
      : 'grayscale(1) sepia(1) contrast(1.4) brightness(0.28)';

  return (
    <img
      src={processedSrc || src}
      alt={alt}
      width={typeof width === 'number' ? width : undefined}
      height={typeof width === 'number' ? width : undefined}
      style={{
        ...style,
        filter: processedSrc ? style?.filter : fallbackFilter,
      }}
      className={className}
      draggable={false}
    />
  );
}
