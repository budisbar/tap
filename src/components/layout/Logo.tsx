

interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <div className={`flex flex-col items-center leading-none select-none ${className}`}>
      <div className="flex items-center relative">
        <span className="text-3xl font-bold tracking-tighter">tap</span>
        <div className="relative mx-[2px] flex items-center justify-center">
          <span className="text-3xl font-bold tracking-tighter relative z-10">&amp;</span>
        </div>
        <span className="text-3xl font-bold tracking-tighter">con</span>
      </div>
      <span className="text-[8px] font-bold tracking-wider uppercase mt-1">By Duda & Vila</span>
    </div>
  );
}
