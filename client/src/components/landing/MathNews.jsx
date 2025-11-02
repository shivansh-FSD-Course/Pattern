import { useEffect, useState } from 'react';
import axios from 'axios';

const MathNews = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await axios.get(
          'https://export.arxiv.org/api/query?search_query=cat:math&sortBy=submittedDate&max_results=6'
        );
        const parser = new DOMParser();
        const xml = parser.parseFromString(res.data, 'application/xml');
        const entries = xml.getElementsByTagName('entry');
        const parsed = Array.from(entries).map((entry) => ({
          title: entry.getElementsByTagName('title')[0].textContent,
          link: entry.getElementsByTagName('id')[0].textContent,
          summary:
            entry.getElementsByTagName('summary')[0].textContent.slice(0, 150) +
            '...',
        }));
        setArticles(parsed);
      } catch (err) {
        console.error('Error fetching math news:', err);
      }
    }

    fetchNews();
  }, []);

  return (
    <section className="bg-dark py-20 px-6 text-center">
      <h2 className="text-4xl font-bold mb-8">Latest in Mathematics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {articles.map((a, i) => (
          <a
            key={i}
            href={a.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
          >
            <h3 className="text-xl font-semibold mb-3 text-primary">
              {a.title}
            </h3>
            <p className="text-gray-400 text-sm">{a.summary}</p>
          </a>
        ))}
      </div>
    </section>
  );
};

export default MathNews;
