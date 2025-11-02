import { BrowserRouter as Router } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-darker text-white">
        <h1 className="text-4xl font-bold text-center pt-20">
          🌌 Pattern Discovery
        </h1>
        <p className="text-center text-gray-400 mt-4">
          Setup Complete! Ready to build amazing visualizations.
        </p>
      </div>
    </Router>
  );
}

export default App;