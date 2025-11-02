import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';

// Later we can import these once you build them:
// import Login from './pages/Login';
// import Register from './pages/Register';
// import Dashboard from './pages/Dashboard';
// import Community from './pages/Community';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-darker text-white font-sans">
        <Routes>
          {/* Landing page with Hero animation + Math news */}
          <Route path="/" element={<Landing />} />

          {/* Future routes */}
          {/* <Route path="/login" element={<Login />} /> */}
          {/* <Route path="/register" element={<Register />} /> */}
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          {/* <Route path="/community" element={<Community />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
