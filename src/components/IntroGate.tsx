import { motion, useTransform, MotionValue } from 'motion/react';
import { Wifi, SmartphoneNfc, Star } from 'lucide-react';

interface IntroGateProps {
  scrollY: MotionValue<number>;
  gateHeight: number;
}

const AnimatedPhone = ({ scrollY, range, startX, startY, startRotate, tapX, tapY, tapRotate, endX, endY, endRotate, children }: any) => {
  const [t1, t2, t3, t4] = range;
  
  const x = useTransform(scrollY, [t1, t2, t3, t4], [startX, tapX, tapX, endX]);
  const y = useTransform(scrollY, [t1, t2, t3, t4], [startY, tapY, tapY, endY]);
  const rotate = useTransform(scrollY, [t1, t2, t3, t4], [startRotate, tapRotate, tapRotate, endRotate]);
  
  const scale = useTransform(scrollY, [t2, t2 + 50, t2 + 100], [1, 0.95, 1]);
  
  const screen1Opacity = useTransform(scrollY, [t2 + 50, t2 + 150], [1, 0]);
  const screen2Opacity = useTransform(scrollY, [t2 + 50, t2 + 150], [0, 1]);

  const opacity = useTransform(scrollY, [t1 - 100, t1, t4, t4 + 100], [0, 1, 1, 0]);

  return (
    <>
      <Ripple scrollY={scrollY} t2={t2} tapX={tapX} tapY={tapY} />
      <motion.div
        style={{
          x, y, rotate, scale, opacity
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-56 h-[400px] bg-black border-[6px] border-gray-800 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col items-center"
      >
        <div className="w-16 h-4 bg-black rounded-full absolute top-2 z-30"></div>

        <motion.div
          style={{ opacity: screen1Opacity }}
          className="absolute inset-0 bg-gradient-to-b from-gray-900 to-[#0a0a0a] w-full h-full flex flex-col items-center justify-center p-4 z-10"
        >
          <SmartphoneNfc className="w-8 h-8 text-white/20 mb-4" />
          <div className="text-white/40 text-xs text-center">Ready to scan</div>
        </motion.div>

        <motion.div
          style={{ opacity: screen2Opacity }}
          className="absolute inset-0 bg-white w-full h-full p-4 pt-10 flex flex-col z-20"
        >
           {children}
        </motion.div>
      </motion.div>
    </>
  )
};

const Ripple = ({ scrollY, t2, tapX, tapY }: any) => {
  const rippleOpacity = useTransform(scrollY, [t2, t2 + 100, t2 + 200], [0, 1, 0]);
  const rippleScale = useTransform(scrollY, [t2, t2 + 200], [0, 3]);
  return (
      <motion.div
        style={{
          opacity: rippleOpacity,
          scale: rippleScale,
          x: tapX,
          y: tapY,
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/50 bg-white/10 rounded-full pointer-events-none z-30"
      ></motion.div>
  )
}

export default function IntroGate({ scrollY, gateHeight }: IntroGateProps) {
  // Timeline:
  // 0 - 2800: Phones fly in simultaneously
  // 3000 - 4000: Doors swing open to the front

  const leftDoorRotateY = useTransform(scrollY, [3000, 4000], [0, 90]);
  const rightDoorRotateY = useTransform(scrollY, [3000, 4000], [0, -90]);
  
  const solidOpacity = useTransform(scrollY, [2999, 3000], [1, 0]);
  const splitOpacity = useTransform(scrollY, [2999, 3000], [0, 1]);
  
  const gateOpacity = useTransform(scrollY, [4000, 4100], [1, 0]);
  const pointerEvents = useTransform(scrollY, [3990, 4000], ["auto", "none"] as any);

  const GateContent = ({ isLeft }: { isLeft: boolean }) => (
    <div className={`absolute top-0 h-full w-[100vw] flex items-center justify-center ${isLeft ? 'left-0' : 'right-0'}`}>
      <div className="flex items-center space-x-4 md:space-x-8">
        <span className="text-white text-7xl md:text-[9rem] font-serif font-light tracking-tighter lowercase">tap&con</span>
        <Wifi className="w-12 h-12 md:w-24 md:h-24 text-white transform rotate-90" />
      </div>
    </div>
  );

  return (
    <motion.div style={{ pointerEvents, opacity: gateOpacity }} className="fixed inset-0 w-full h-full overflow-hidden z-50">
      <div className="absolute inset-0 w-full h-full" style={{ perspective: '1200px' }}>
        
        <motion.div style={{ opacity: solidOpacity }} className="absolute inset-0 w-full h-full bg-[#050505] z-30 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <GateContent isLeft={true} />
        </motion.div>

        <motion.div 
          style={{ opacity: splitOpacity, rotateY: leftDoorRotateY, transformOrigin: 'left center' }} 
          className="absolute inset-y-0 left-0 w-1/2 bg-[#050505] overflow-hidden shadow-[10px_0_50px_rgba(0,0,0,0.5)] z-20"
        >
          <GateContent isLeft={true} />
        </motion.div>

        <motion.div 
          style={{ opacity: splitOpacity, rotateY: rightDoorRotateY, transformOrigin: 'right center' }} 
          className="absolute inset-y-0 right-0 w-1/2 bg-[#050505] overflow-hidden shadow-[-10px_0_50px_rgba(0,0,0,0.5)] z-20"
        >
          <GateContent isLeft={false} />
        </motion.div>
      </div>

      {/* Phone 1: Google Reviews (Bottom Right) */}
      <AnimatedPhone 
        scrollY={scrollY} range={[0, 1000, 1800, 2800]}
        startX="50vw" startY="50vh" startRotate={25}
        tapX="15vw" tapY="22vh" tapRotate={-5}
        endX="50vw" endY="50vh" endRotate={25}
      >
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">G</div>
          <div>
            <div className="text-xs font-bold text-gray-800">The Artisan Cafe</div>
            <div className="text-[10px] text-gray-500">Rate and review</div>
          </div>
        </div>
        <div className="flex justify-center space-x-1 my-4">
          {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />)}
        </div>
        <div className="bg-gray-100 rounded-xl p-3 flex-1 flex flex-col space-y-2">
          <div className="h-2 w-1/2 bg-gray-300 rounded"></div>
          <div className="h-2 w-full bg-gray-200 rounded"></div>
          <div className="h-2 w-3/4 bg-gray-200 rounded"></div>
        </div>
      </AnimatedPhone>

      {/* Phone 2: Social Media (Top Left) */}
      <AnimatedPhone 
        scrollY={scrollY} range={[0, 1000, 1800, 2800]}
        startX="-50vw" startY="-50vh" startRotate={-25}
        tapX="-15vw" tapY="-22vh" tapRotate={5}
        endX="-50vw" endY="-50vh" endRotate={-25}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 p-[2px]">
             <div className="w-full h-full bg-white rounded-full border-2 border-white"></div>
          </div>
          <div>
             <div className="text-xs font-bold text-gray-800">@tapandcon</div>
             <div className="text-[10px] text-gray-500">Digital Creator</div>
          </div>
        </div>
        <div className="flex justify-between px-2 mb-4 text-center">
          <div><div className="font-bold text-xs">124</div><div className="text-[8px] text-gray-500">Posts</div></div>
          <div><div className="font-bold text-xs">12.4k</div><div className="text-[8px] text-gray-500">Followers</div></div>
          <div><div className="font-bold text-xs">400</div><div className="text-[8px] text-gray-500">Following</div></div>
        </div>
        <div className="w-full bg-blue-500 text-white rounded py-1.5 text-center text-[10px] font-bold mb-4">Follow</div>
        <div className="grid grid-cols-3 gap-1">
          {[...Array(9)].map((_, i) => <div key={i} className="aspect-square bg-gray-200"></div>)}
        </div>
      </AnimatedPhone>

      {/* Phone 3: Restaurant Menu (Bottom Left) */}
      <AnimatedPhone 
        scrollY={scrollY} range={[0, 1000, 1800, 2800]}
        startX="-50vw" startY="50vh" startRotate={-20}
        tapX="-18vw" tapY="20vh" tapRotate={10}
        endX="-50vw" endY="50vh" endRotate={-20}
      >
        <div className="w-full h-24 bg-orange-100 rounded-lg mb-3 flex items-center justify-center">
          <span className="text-orange-500 font-serif text-lg">The Artisan</span>
        </div>
        <div className="text-xs font-bold text-gray-800 mb-2">Popular Items</div>
        <div className="space-y-3">
          {[1,2,3].map(i => (
             <div key={i} className="flex justify-between items-center">
                <div>
                   <div className="text-[10px] font-bold text-gray-700">Truffle Pasta</div>
                   <div className="text-[8px] text-gray-400">Fresh pasta, black truffle...</div>
                </div>
                <div className="text-[10px] font-bold text-gray-800">$24</div>
             </div>
          ))}
        </div>
      </AnimatedPhone>

      {/* Phone 4: LinkedIn Profile (Top Right) */}
      <AnimatedPhone 
        scrollY={scrollY} range={[0, 1000, 1800, 2800]}
        startX="50vw" startY="-50vh" startRotate={20}
        tapX="18vw" tapY="-20vh" tapRotate={-10}
        endX="50vw" endY="-50vh" endRotate={20}
      >
        <div className="absolute top-0 left-0 w-full h-24 bg-blue-200"></div>
        <div className="pt-16 px-2 relative z-10">
          <div className="w-14 h-14 rounded-full bg-white border-2 border-white overflow-hidden shadow-sm mb-2">
            <div className="w-full h-full bg-gray-300"></div>
          </div>
          <div className="text-sm font-bold text-gray-900">Jane Doe</div>
          <div className="text-[9px] text-gray-600 mb-3">CEO & Founder at Tap&Con</div>
          <div className="flex space-x-2">
             <div className="flex-1 bg-blue-600 text-white rounded-full py-1.5 text-center text-[10px] font-bold">Connect</div>
             <div className="flex-1 border border-blue-600 text-blue-600 rounded-full py-1.5 text-center text-[10px] font-bold">Message</div>
          </div>
          <div className="mt-4">
            <div className="text-[10px] font-bold mb-1">About</div>
            <div className="text-[8px] text-gray-500 leading-relaxed">
              Passionate about streamlining offline-to-online conversions using NFC technology.
            </div>
          </div>
        </div>
      </AnimatedPhone>

    </motion.div>
  );
}
