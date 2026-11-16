import { useRef, ReactNode } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';

interface ScrollSectionProps {
  children: ReactNode;
  isFirst?: boolean;
  isLast?: boolean;
  blendFromDarkToLight?: boolean;
  className?: string;
}

export default function ScrollSection({
  children,
  isFirst = false,
  isLast = false,
  blendFromDarkToLight = false,
  className = '',
}: ScrollSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const offset = (
    isFirst
      ? ['start start', 'end start']
      : isLast
      ? ['start end', 'end end']
      : ['start end', 'end start']
  ) as ['start start' | 'start end', 'end start' | 'end end'];

  const { scrollYProgress } = useScroll({
    target: ref,
    offset,
  });

  const inputRange = isFirst
    ? [0, 0.15, 0.95, 1]
    : isLast
    ? [0, 0.5, 1]
    : [0, 0.24, 0.76, 1];

  const opacityOutput = isFirst
    ? [1, 1, 0.3, 0.3]
    : isLast
    ? [0.3, 1, 1]
    : [0.3, 1, 1, 0.3];

  const scaleOutput = isFirst
    ? [1, 1, 0.97, 0.97]
    : isLast
    ? [0.97, 1, 1]
    : [0.97, 1, 1, 0.97];

  const yOutput = isFirst
    ? [0, 0, 0, 0]
    : isLast
    ? [48, 0, 0]
    : [48, 0, 0, -24];

  const opacity = useTransform(scrollYProgress, inputRange, opacityOutput);
  const scale = useTransform(scrollYProgress, inputRange, scaleOutput);
  const y = useTransform(scrollYProgress, inputRange, yOutput);

  const blendBand = blendFromDarkToLight ? (
    <div
      aria-hidden="true"
      className="w-full pointer-events-none"
      style={{
        height: '96px',
        background: 'linear-gradient(180deg, #050505 0%, #ffffff 100%)',
      }}
    />
  ) : null;

  if (shouldReduceMotion) {
    return (
      <div ref={ref} className={`scroll-section ${className}`.trim()}>
        {blendBand}
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`relative overflow-x-clip ${isFirst ? '' : '-mt-10 md:-mt-16'} ${className}`.trim()}
    >
      <motion.div
        style={{ opacity, scale, y, willChange: 'transform, opacity' }}
        className="scroll-section origin-center"
      >
        {blendBand}
        {children}
      </motion.div>
    </div>
  );
}
