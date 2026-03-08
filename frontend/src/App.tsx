import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Sender from "./components/sender";
import Receiver from "./components/receiver";
import Random from "./components/random";
import Test from "./components/test";
import Home from "./components/home";
import AboutProject from "./components/working";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sender" element={<Sender />} />
        <Route path="/receiver" element={<Receiver />} />
        <Route path="/random" element={<Random />} />
        <Route path="/test" element={<Test />} />\
        <Route path="/about-project" element={<AboutProject />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
