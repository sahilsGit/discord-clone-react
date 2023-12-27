import { Route, Routes } from "react-router-dom";
import PageNotFound from "@/pages/PageNotFound";
import Homepage from "@/pages/Homepage";
import About from "@/pages/About";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ModalProvider } from "@/components/providers/modal-provider";

import { cn } from "@/lib/utils";
import RequireAuth from "@/lib/require-auth";
import InitialModal from "@/components/modals/Initial-Modal";
import MainPage from "@/pages/MainPage";
import RegistrationForm from "@/pages/Registration";
import LoginForm from "@/pages/Login";
import InvitationPage from "./pages/InvitationPage";
import { MiscContextProvider } from "./context/Misc-Context";
import Settings from "./pages/Settings";

function App() {
  console.log(import.meta.env.VITE_API);

  return (
    // client side routing using "Routes"
    <>
      <div className={cn("bg-white dark:bg-[#313338]")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          storageKey="discord-theme"
        >
          <ModalProvider />
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="*" element={<PageNotFound />} />
            <Route path="/" element={<Homepage />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/@me/conversations"
              element={
                <RequireAuth>
                  <MiscContextProvider>
                    <MainPage type="messages" />
                  </MiscContextProvider>
                </RequireAuth>
              }
            />
            <Route
              path="/@me/settings"
              element={
                <RequireAuth>
                  <MiscContextProvider>
                    <Settings />
                  </MiscContextProvider>
                </RequireAuth>
              }
            />
            <Route
              path="/@me/conversations/:memberProfileId/:myProfileId"
              element={
                <RequireAuth>
                  <MiscContextProvider>
                    <MainPage type="conversation" />
                  </MiscContextProvider>
                </RequireAuth>
              }
            />
            <Route
              path="/servers/:serverId/:channelId"
              element={
                <RequireAuth>
                  <MiscContextProvider>
                    <MainPage type="channel" />
                  </MiscContextProvider>
                </RequireAuth>
              }
            />
            <Route
              path="/servers/:serverId"
              element={
                <RequireAuth>
                  <MiscContextProvider>
                    <MainPage type="server" />
                  </MiscContextProvider>
                </RequireAuth>
              }
            />
            <Route
              path="/servers/create"
              element={
                <RequireAuth>
                  <InitialModal />
                </RequireAuth>
              }
            />

            <Route
              path="/invite/:inviteCode"
              element={
                <RequireAuth>
                  <InvitationPage />
                </RequireAuth>
              }
            />
          </Routes>
        </ThemeProvider>
      </div>
    </>
  );
}

export default App;
