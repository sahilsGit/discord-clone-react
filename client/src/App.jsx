import { Route, Routes } from "react-router-dom";
import NotFoundPage from "@/pages/NotFoundPage";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ModalProvider } from "@/components/providers/modal-provider";

import { cn } from "@/lib/utils";
import RequireAuth from "@/lib/require-auth";
import InitialModal from "@/components/modals/Initial-Modal";
import MainPage from "@/pages/MainPage";
import RegistrationPage from "@/pages/RegistrationPage";
import LoginPage from "@/pages/LoginPage";
import InvitationPage from "./pages/InvitationPage";
import { ConversationsContextProvider } from "./context/Conversations-Context";
import { ChannelsContextProvider } from "./context/Channels-Context";

function App() {
  /*
   * App
   *
   * Entry point into the application, navigation routes,
   * providers and contexts are laid down.
   *
   */

  return (
    <>
      <div className={cn("bg-white dark:bg-[#313338]")}>
        {/* Applying theme using ThemeProvider */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          storageKey="discord-theme"
        >
          {/* Providing Zustand modals using custom Provider */}
          <ModalProvider />

          {/* Setting up routes using React-router-dom */}
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />

            {/* Protected routes */}
            <Route
              path="/@me/conversations"
              // Assigning 'type' "messages" to load up messages home
              element={
                <RequireAuth>
                  <ChannelsContextProvider>
                    <ConversationsContextProvider>
                      <MainPage type="conversation" />
                    </ConversationsContextProvider>
                  </ChannelsContextProvider>
                </RequireAuth>
              }
            />
            <Route
              path="/@me/conversations/:memberProfileId/:myProfileId"
              // Assigning 'type' "conversation" to load up a specific direct conversation
              element={
                <RequireAuth>
                  <ChannelsContextProvider>
                    <ConversationsContextProvider>
                      <MainPage type="conversation" />
                    </ConversationsContextProvider>
                  </ChannelsContextProvider>
                </RequireAuth>
              }
            />
            <Route
              path="/servers/:serverId/:channelId"
              // Assigning 'type' "channel" to load up a specific channel
              element={
                <RequireAuth>
                  <ChannelsContextProvider>
                    <ConversationsContextProvider>
                      <MainPage type="channel" />
                    </ConversationsContextProvider>
                  </ChannelsContextProvider>
                </RequireAuth>
              }
            />
            <Route
              path="/servers/:serverId"
              // Assigning 'type' "server" to load up a specific server
              element={
                <RequireAuth>
                  <ChannelsContextProvider>
                    <ConversationsContextProvider>
                      <MainPage type="channel" />
                    </ConversationsContextProvider>
                  </ChannelsContextProvider>
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
