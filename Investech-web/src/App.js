import React,{useState} from "react";
import Navbar from "./Components/Navbar";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Finance from "./Components/Finance";
import News from "./Components/News";
import About from "./Components/About";
import Home from "./Components/Home";
import LoadingBar from "react-top-loading-bar";

function App() {
  const apiKey = "9bfb9be7f357498c8deb8784da335bc1";
  const [prog, setProgress] = useState(10);
  
  return (
    <div style={{backgroundColor:"black"}}>
    <BrowserRouter>
      <Navbar />
      <LoadingBar color="#f11946" progress={prog} />
    
      <Routes>
        <Route path="/" element={<Home setProgress={setProgress} />} />
        <Route path="/news" element={<News
        setProgress={setProgress}
        apiKey={apiKey}
        key="general"
        pageSize={5}
        country="in"
        category="business"
        />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  </div>
  );
}

export default App;
