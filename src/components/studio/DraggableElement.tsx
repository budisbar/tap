import { useRef, useEffect } from 'react';
import { motion, useMotionValue } from 'motion/react';

export default function DraggableElement({
  el,
  isSelected,
  onSelect,
  onUpdatePosition,
  onUpdateElement,
  IconComp,
  isDrawMode,
  isEraser,
  onRemove,
  setSnapGuides,
  orientation,
  zoom
}: any) {
  const x = useMotionValue(el.x);
  const y = useMotionValue(el.y);
  const nodeRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    x.set(el.x);
    y.set(el.y);
  }, [el.x, el.y, x, y]);

  // Sync text content only when not focused to prevent cursor jumping
  useEffect(() => {
    if (el.type === 'text' && textRef.current && document.activeElement !== textRef.current) {
      textRef.current.innerText = el.content || '';
    }
  }, [el.content, el.type]);

  return (
    <motion.div
      ref={nodeRef}
      drag={!isDrawMode}
      dragMomentum={false}
      onDrag={() => {
        if (!nodeRef.current) return;
        const rect = nodeRef.current.getBoundingClientRect();
        const elW = rect.width / (zoom / 100);
        const elH = rect.height / (zoom / 100);

        const currentX = x.get();
        const currentY = y.get();

        const elCenterX = currentX + elW / 2;
        const elCenterY = currentY + elH / 2;

        const cW = orientation === 'horizontal' ? 428 : 270;
        const cH = orientation === 'horizontal' ? 270 : 428;

        const snapThreshold = 8;
        let newSnapX = null;
        let newSnapY = null;

        // Check horizontal center
        if (Math.abs(elCenterX - cW / 2) < snapThreshold) {
          newSnapX = cW / 2;
          // Soft snap
          x.set((cW / 2) - (elW / 2));
        }

        // Check vertical center
        if (Math.abs(elCenterY - cH / 2) < snapThreshold) {
          newSnapY = cH / 2;
          // Soft snap
          y.set((cH / 2) - (elH / 2));
        }

        setSnapGuides({ x: newSnapX, y: newSnapY });
      }}
      onDragEnd={() => {
        onUpdatePosition(el.id, Math.round(x.get()), Math.round(y.get()));
        setSnapGuides({ x: null, y: null });
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
      onPointerDown={() => {
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
        <div
          ref={textRef}
          contentEditable={isSelected && !isDrawMode}
          suppressContentEditableWarning={true}
          onInput={(e) => {
            onUpdateElement(el.id, { content: e.currentTarget.innerText });
          }}
          // Focus the text when double clicked or just let them click it if selected
          style={{
            fontSize: el.fontSize,
            fontFamily: el.fontFamily || 'var(--font-serif)',
            textAlign: el.textAlign || 'left',
            letterSpacing: `${el.letterSpacing || 0}px`,
            textTransform: el.textTransform || 'none',
            minWidth: '20px',
            minHeight: '20px'
          }}
          className={`leading-tight whitespace-pre-wrap outline-none border-none bg-transparent ${isSelected && !isDrawMode ? 'cursor-text' : 'select-none pointer-events-none'}`}
        />
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
}
