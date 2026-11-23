import { Routes, Route } from "react-router-dom";
import WelcomeScreen from "./screens/welcome/WelcomeScreen";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomeScreen />} />
    </Routes>
  );
}
