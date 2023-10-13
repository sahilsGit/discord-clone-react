import { Route, Routes } from "react-router-dom";
import PageNotFound from "./pages/PageNotFound";
import Homepage from "./pages/Homepage";
import About from "./pages/About";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { cn } from "./lib/utils";
import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
  return (
    // client side routing using "Routes"
    <>
      <div className={cn("bg-white dark:bg-[#313338]")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          storageKey="discord-theme"
        >
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/about" element={<About />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<PageNotFound />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </ThemeProvider>
      </div>
    </>
  );
}

export default App;
