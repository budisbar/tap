import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCcw } from 'lucide-react';

interface Preview3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  frontImage: string;
  backImage?: string;
  productType: 'card' | 'board';
  orientation: 'horizontal' | 'vertical';
  boardColor?: string;
}

export default function Preview3DModal({
  isOpen,
  onClose,
  frontImage,
  backImage,
  productType,
  orientation,
  boardColor
}: Preview3DModalProps) {
  const [isRotating, setIsRotating] = useState(true);
  const [rotationY, setRotationY] = useState(0);
  const [rotationX, setRotationX] = useState(-5);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animationFrame: number;
    
    const animate = () => {
      if (isRotating && !isDragging) {
        setRotationY((prev) => (prev + 0.3) % 360);
      }
      animationFrame = requestAnimationFrame(animate);
    };

    if (isOpen) {
      animationFrame = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isOpen, isRotating, isDragging]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setIsRotating(false);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    
    setRotationY((prev) => prev + deltaX * 0.5);
    // Limit rotationX to prevent flipping upside down completely
    setRotationX((prev) => {
      const newRot = prev - deltaY * 0.5;
      return Math.max(-80, Math.min(80, newRot));
    });
    
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#050505]/95 backdrop-blur-md"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[110] p-2 bg-white/10 rounded-full hover:bg-white/20"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[110] text-center pointer-events-none">
          <h2 className="text-2xl font-bold text-white mb-2">360° Preview</h2>
          <p className="text-white/50 text-sm flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" /> 
            Drag to rotate freely
          </p>
        </div>

        <div 
          className="w-full h-full flex items-center justify-center perspective-[1500px] select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ touchAction: 'none' }}
        >
          <div
            className="relative cursor-grab active:cursor-grabbing"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
              width: productType === 'board' ? '300px' : (orientation === 'horizontal' ? '428px' : '270px'),
              height: productType === 'board' ? '450px' : (orientation === 'horizontal' ? '270px' : '428px'),
            }}
          >
            {productType === 'card' ? (
              <>
                {/* Front Face */}
                <div className="absolute inset-0 shadow-2xl rounded-2xl overflow-hidden border border-white/20" style={{ backfaceVisibility: 'hidden', transform: 'translateZ(1px)' }}>
                  <img src={frontImage} alt="Front" className="w-full h-full object-cover pointer-events-none" draggable={false} />
                </div>
                {/* Back Face */}
                <div className="absolute inset-0 shadow-2xl rounded-2xl overflow-hidden border border-white/20" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg) translateZ(1px)' }}>
                  <img src={backImage || frontImage} alt="Back" className="w-full h-full object-cover pointer-events-none" draggable={false} />
                </div>
              </>
            ) : (
              // Board L-Shape
              <div className="w-full h-full relative flex items-end" style={{ transformStyle: 'preserve-3d' }}>
                {/* Tilted Face */}
                <div className="w-full h-full relative origin-bottom" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(15deg)' }}>
                  {/* Front of the tilted face */}
                  <div className="absolute inset-0 shadow-2xl overflow-hidden rounded-t-sm" style={{ backfaceVisibility: 'hidden', transform: 'translateZ(1px)' }}>
                    <img src={frontImage} alt="Front" className="w-full h-full object-cover pointer-events-none" draggable={false} />
                  </div>
                  {/* Back of the tilted face (Support) */}
                  <div className="absolute inset-0 rounded-t-sm border border-white/5" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg) translateZ(1px)', backgroundColor: boardColor || '#151515' }}>
                  </div>
                </div>

                {/* Base flat on the ground */}
                <div className="absolute bottom-0 w-full h-[150px] border border-white/5 origin-bottom" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(90deg)', backgroundColor: boardColor || '#111' }}>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-[110]">
           <button 
             onClick={() => setIsRotating(!isRotating)}
             className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-semibold transition-all border border-white/10 flex items-center gap-2"
           >
             {isRotating ? 'Pause Rotation' : 'Auto Rotate'}
           </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
