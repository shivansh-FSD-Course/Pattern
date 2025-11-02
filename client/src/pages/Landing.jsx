import Hero from '../components/landing/Hero';
import MathNews from '../components/landing/MathNews';

const Landing = () => {
  return (
    <div className="bg-darker text-white overflow-x-hidden">
      {/* ---------------- HERO SECTION ---------------- */}
      <Hero />

      {/* ---------------- MATH NEWS SECTION ---------------- */}
      <MathNews />

      {/* ---------------- CALL TO ACTION SECTION ---------------- */}
      <section className="py-24 text-center bg-gradient-to-r from-primary to-secondary">
        <h2 className="text-5xl font-bold mb-6">Join the Pattern Revolution</h2>
        <p className="text-lg text-gray-100 mb-8">
          Upload your data. Discover patterns. Inspire others.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Temporary links until /register and /login pages exist */}
          <a
            href="#register"
            className="px-8 py-4 bg-white text-dark font-semibold text-lg rounded-full hover:scale-105 transition-transform duration-300 shadow-lg"
          >
            Get Started Free
          </a>
          <a
            href="#login"
            className="px-8 py-4 border border-white/20 text-white font-semibold text-lg rounded-full hover:bg-white/20 transition-all duration-300"
          >
            Sign In
          </a>
        </div>
      </section>
    </div>
  );
};

export default Landing;
