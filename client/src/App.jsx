import { Route, Routes } from "react-router-dom";
import PageNotFound from "./pages/PageNotFound";
import Homepage from "./pages/Homepage";
import About from "./pages/About";

function App() {
  return (
    // client side routing using "Routes"
    <>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}

export default App;
