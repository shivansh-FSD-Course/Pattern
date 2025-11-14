// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

import IntroGate from "./pages/IntroGate";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Community from "./pages/Community";
import Dashboard from "./pages/Dashboard";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function IntroWrapper() {
  const navigate = useNavigate();
  return <IntroGate onEnter={() => navigate("/home")} />;
}

// Simple layout that shows the navbar on top of each page
function Layout({ children }) {
  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden">
      <Navbar />
      {/* children handle their own backgrounds / hero layouts */}
      {children}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Intro screen has NO navbar */}
        <Route path="/" element={<IntroWrapper />} />

        {/* Public pages wrapped in Layout */}
        <Route
          path="/home"
          element={
            <Layout>
              <Landing />
            </Layout>
          }
        />

        <Route
          path="/login"
          element={
            <Layout>
              <Login />
            </Layout>
          }
        />

        <Route
          path="/register"
          element={
            <Layout>
              <Register />
            </Layout>
          }
        />

        {/* Protected pages */}
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <Layout>
                <Community />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/myspace"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
