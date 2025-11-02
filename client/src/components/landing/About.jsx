import { motion } from 'framer-motion';

const About = () => (
  <section className="relative py-28 bg-gradient-to-t from-[#0f172a] to-[#1e1b4b] text-center overflow-hidden">
    <motion.div
      className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-12 backdrop-blur-2xl shadow-2xl"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <h2 className="text-5xl font-bold mb-6 text-white">Why PatternCraft?</h2>
      <p className="text-gray-300 text-lg leading-relaxed">
        We believe mathematics is more than numbers — it’s a language of beauty and order.
        PatternCraft empowers thinkers, researchers, and innovators to see patterns that inspire
        change. From data to discovery, we make insight accessible and elegant.
      </p>
    </motion.div>
  </section>
);

export default About;
