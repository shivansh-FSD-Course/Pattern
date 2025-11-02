import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden flex flex-col justify-center items-center text-center bg-gradient-to-br from-[#0b0f19] via-[#111827] to-[#1e1b4b]">
      {/* background orbs */}
      <div className="absolute -top-32 -left-20 w-[40rem] h-[40rem] bg-indigo-600/40 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[35rem] h-[35rem] bg-cyan-400/30 rounded-full blur-[120px]" />

      <motion.h1
        className="text-7xl md:text-8xl font-bold text-white mb-6 leading-tight drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        PatternCraft
      </motion.h1>

      <motion.p
        className="text-xl md:text-2xl text-gray-300 max-w-2xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
      >
        Where mathematics meets creativity. Discover patterns hidden in your data.
      </motion.p>

      <motion.div
        className="mt-10 flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
      >
        <a
          href="#register"
          className="px-10 py-4 bg-gradient-to-r from-cyan-400 to-indigo-500 text-white font-semibold rounded-full shadow-lg hover:scale-105 transition-transform duration-300"
        >
          Get Started
        </a>
        <a
          href="#login"
          className="px-10 py-4 bg-white/10 text-white border border-white/20 rounded-full hover:bg-white/20 transition-all duration-300"
        >
          Sign In
        </a>
      </motion.div>
    </section>
  );
};

export default Hero;
