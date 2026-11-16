import { SmartphoneNfc } from 'lucide-react';
import {
  CardMaterial,
  CardState,
  ICONS,
  Orientation,
  getEffectiveElementColor,
  isEngravedMaterial,
} from './customizerData';
import EngravedImage from './EngravedImage';

interface CardPreviewProps {
  sideState: CardState;
  orientation?: Orientation;
  productType?: 'card' | 'board';
  material?: CardMaterial | null;
  width?: number;
  className?: string;
}

/**
 * Renders a non-interactive scaled preview of a card or board side
 * using its exact elements, fonts, colors, and optional material finish.
 */
export default function CardPreview({
  sideState,
  orientation = 'horizontal',
  productType = 'card',
  material = null,
  width = 220,
  className = '',
}: CardPreviewProps) {
  const baseW = productType === 'board' ? 300 : orientation === 'horizontal' ? 428 : 270;
  const baseH = productType === 'board' ? 450 : orientation === 'horizontal' ? 270 : 428;
  const scale = width / baseW;
  const renderedH = Math.round(baseH * scale);

  const isEngraved = isEngravedMaterial(material);
  const isWoodEngraved = material?.category === 'wood';
  const showMaterialSurface = Boolean(
    material &&
      (isEngraved || sideState.bgColor === material.bgColor)
  );

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-white/10 select-none pointer-events-none shrink-0 ${className}`.trim()}
      style={{ width: `${width}px`, height: `${renderedH}px` }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          width: `${baseW}px`,
          height: `${baseH}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          backgroundColor: isEngraved && material ? material.bgColor : sideState.bgColor,
        }}
      >
        {showMaterialSurface && material && (
          <>
            <div
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                background: material.previewBg,
                mixBlendMode: 'normal',
                opacity: 1,
              }}
            />
            {material.sheenOverlay && (
              <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                  background: material.sheenOverlay,
                  mixBlendMode: isWoodEngraved ? 'normal' : 'overlay',
                  opacity: isWoodEngraved ? 1 : 0.6,
                }}
              />
            )}
          </>
        )}

        {sideState.elements.map((el) => {
          const IconComp =
            el.type === 'icon'
              ? ICONS.find((i) => i.id === el.iconId)?.component || SmartphoneNfc
              : null;
          const effectiveColor = getEffectiveElementColor(el.color, material);
          const effectiveOpacity = isWoodEngraved ? (el.opacity ?? 1) * 0.92 : (el.opacity ?? 1);

          return (
            <div
              key={el.id}
              style={{
                transform: `translate(${el.x}px, ${el.y}px) rotate(${el.rotation || 0}deg)`,
                zIndex: el.z || 1,
                position: 'absolute',
                top: 0,
                left: 0,
                color: effectiveColor,
                opacity: effectiveOpacity,
                mixBlendMode: isWoodEngraved ? 'multiply' : 'normal',
              }}
              className="p-1"
            >
              {el.type === 'text' && (
                <div
                  style={{
                    fontSize: el.fontSize,
                    fontFamily: el.fontFamily || 'var(--font-serif)',
                    textAlign: el.textAlign || 'left',
                    letterSpacing: `${el.letterSpacing || 0}px`,
                    textTransform: el.textTransform || 'none',
                    textShadow: isEngraved ? material?.engraveTextShadow : undefined,
                  }}
                  className="leading-tight whitespace-pre-wrap"
                >
                  {el.content}
                </div>
              )}
              {el.type === 'icon' && IconComp && (
                <div style={{ filter: isEngraved ? material?.engraveFilter : undefined }}>
                  <IconComp className="w-10 h-10" />
                </div>
              )}
              {el.type === 'image' && el.imageUrl && (
                isEngraved && (material?.category === 'metal' || material?.category === 'wood') ? (
                  <EngravedImage
                    src={el.imageUrl}
                    alt={el.content || ''}
                    mode={material.category}
                    engraveColor={effectiveColor}
                    style={{
                      width: el.width || 100,
                      height: 'auto',
                      filter: material?.engraveFilter,
                    }}
                  />
                ) : (
                  <img
                    src={el.imageUrl}
                    alt={el.content || ''}
                    style={{ width: el.width || 100, height: 'auto' }}
                    draggable={false}
                  />
                )
              )}
              {el.type === 'shape' && (
                <div
                  style={{
                    width: el.width || 100,
                    height: el.height || 100,
                    backgroundColor: effectiveColor,
                    borderRadius: el.borderRadius || 0,
                    filter: isEngraved ? material?.engraveFilter : undefined,
                  }}
                />
              )}
              {el.type === 'drawing' && el.pathData && (
                <svg
                  style={{
                    overflow: 'visible',
                    filter: isEngraved ? material?.engraveFilter : undefined,
                  }}
                >
                  <path
                    d={el.pathData}
                    stroke={effectiveColor}
                    strokeWidth={el.strokeWidth || 4}
                    strokeOpacity={el.drawTool === 'marker' ? 0.4 : 1}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
