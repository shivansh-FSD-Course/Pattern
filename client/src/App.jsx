import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import IntroGate from "./pages/IntroGate";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Community from "./pages/Community";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
function IntroWrapper() {
  const navigate = useNavigate();
  return <IntroGate onEnter={() => navigate("/home")} />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IntroWrapper />} />
        <Route path="/home" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/community" element={<Community />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/myspace" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}
