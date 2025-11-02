import { motion } from 'framer-motion';
import { Lightbulb, Cpu, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: <Lightbulb size={36} />,
    title: 'AI-Enhanced Discovery',
    desc: 'Uncover mathematical relationships automatically with our intelligent pattern engine.',
  },
  {
    icon: <Cpu size={36} />,
    title: 'Interactive Insights',
    desc: 'Visualize structures in your data through intuitive, dynamic interfaces.',
  },
  {
    icon: <BarChart3 size={36} />,
    title: 'Predictive Modeling',
    desc: 'Turn insights into forecasts with adaptive algorithms tuned for accuracy.',
  },
];

function Features() {
  return (
    <section className="relative py-28 bg-[#0e1627] text-center overflow-hidden">
      <h2 className="text-5xl font-bold mb-16 text-white">
        What Makes PatternCraft Powerful
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
        {features.map((f, i) => (
          <motion.div
            key={i}
            className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:scale-105 transition-transform duration-300 shadow-xl text-left"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
          >
            <div className="text-cyan-400 mb-4">{f.icon}</div>
            <h3 className="text-2xl font-semibold mb-3 text-white">{f.title}</h3>
            <p className="text-gray-400">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default Features;
