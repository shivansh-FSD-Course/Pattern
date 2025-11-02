import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-[#0b0f19]">
      {/* Animated Gradient Background */}
      <motion.div
        className="absolute inset-0"
        initial={{ backgroundPosition: '0% 50%' }}
        animate={{ backgroundPosition: '100% 50%' }}
        transition={{
          repeat: Infinity,
          duration: 15,
          ease: 'linear',
        }}
        style={{
          background: 'linear-gradient(270deg, #3b82f6, #8b5cf6, #06b6d4, #a855f7)',
          backgroundSize: '400% 400%',
          filter: 'blur(80px)',
          opacity: 0.6,
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-cyan-400"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
              scale: 0,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Text Content */}
      <div className="relative z-10 text-center">
        <motion.h1
          className="text-6xl md:text-7xl font-bold text-white"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          PatternCraft
        </motion.h1>

        <motion.p
          className="text-xl text-gray-300 mt-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.8, ease: 'easeOut', delay: 0.2 }}
        >
          Discover the beauty of mathematics through patterns
        </motion.p>
      </div>
    </section>
  );
};

export default Hero;
