import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Sender from "./components/sender";
import Receiver from "./components/receiver";
import Random from "./components/random";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sender" element={<Sender />} />
        <Route path="/receiver" element={<Receiver />} />
        <Route path="/random" element={<Random />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
