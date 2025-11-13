import { BrowserRouter, Routes, Route } from "react-router-dom";
import IntroGate from "./pages/IntroGate";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IntroGate />} />
        <Route path="/home" element={<Landing />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/community" element={
          <div style={{ color: "white", textAlign: "center", paddingTop: "80px" }}>
            Community Coming Soon!
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}
