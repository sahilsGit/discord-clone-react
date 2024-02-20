// HomePage.js
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../App.css";
import useAuth from "@/hooks/useAuth";
import GetStarted from "@/components/getStarted";
import { ActionTooltip } from "@/components/actionTooltip";

const HomePage = () => {
  const navigate = useNavigate(); // For programmatic navigation
  const location = useLocation();
  const from = location.state?.from?.pathname || "/@me/conversations";
  const [isDiving, setIsDiving] = useState(false); // When users browse discord without registering

  // Fetch user and access token from custom auth hook
  const user = useAuth("user");
  const access_token = useAuth("token");

  // Navigate the authenticated user to their profile pages
  useEffect(() => {
    if (user && access_token) {
      navigate(from);
    }
  }, [user, access_token]);

  const handleDisplayNameSubmit = (displayName) => {
    navigate("/register", { state: { displayName } });
  };

  return (
    <div>
      {user && access_token ? null : (
        <div className="bg-main10">
          <div className="px-3 bg-[#404EED] flex pt-4 sm:pt-7 justify-center items-center sm:px-6">
            <div className="flex w-full justify-between items-center max-w-[1300px]">
              <a href="/">
                <img
                  src="/logos/full_logo_white_RGB.svg"
                  alt=""
                  className="h-5 sm:h-7"
                />
              </a>
              <nav className="flex hidden md:flex gap-x-12 w-full items-center justify-center">
                <button
                  className="font-medium"
                  onClick={() =>
                    document.getElementById("showcase").scrollIntoView()
                  }
                >
                  Showcase
                </button>
                <a
                  className="font-medium cursor-pointer"
                  href="https://github.com/sahilsGit/discordCloneReact"
                >
                  GitHub
                </a>
                <ActionTooltip
                  label={"This's here just for aesthetics for now"}
                  side={"bottom"}
                >
                  <button disabled className="font-medium">
                    About
                  </button>
                </ActionTooltip>
              </nav>
              <a
                href="/login"
                className="bg-white px-5 gap-x-1 py-1.5 sm:py-2 sm:px-7 text-center text-sm sm:text-md text-main10 rounded-full transition-all drop-shadow-subtle hover:drop-shadow-[0_12px_12px_rgba(0,0,0,0.25)] hover:text-indigo-600"
              >
                Login
              </a>
            </div>
          </div>
          <div className="px-4 flex gap-y-8 flex-col bg-[#404EED] items-start sm:items-center sm:justify-center sm:px-6 py-[110px] lg:py-[150px]">
            <h1 className="max-w-[1000px] leading-none text-xl4 text-start sm:text-center sm:text-xl8 border-box font-peace">
              Not the Real Discord but...
            </h1>
            <p className="text-md font-light text-start sm:text-xl pt-2 max-w-[770px] sm:text-center">
              ...something like it. You won't find it all, just the standard
              stuff. Was made as a fun challenge, I hope Discord won't mind if
              they ever stumble upon.
            </p>
            {isDiving ? (
              <div className="flex flex-col gap-y-5 items-center justify-center">
                <GetStarted onDisplayNameSubmit={handleDisplayNameSubmit} />
                <p className="text-sm">
                  By registering, you agree to our non-existent terms of
                  service.
                </p>
              </div>
            ) : (
              <div className="flex sm:items-center sm:justify-center flex-col sm:flex-row w-full gap-y-5 sm:gap-x-10 p-0 sm:mt-6">
                <Button
                  className="flex font-normal max-w-[180px] sm:max-w-[250px] py-6 px-10 text-md sm:text-xl  sm:px-12 px-4 sm:h-[55px] items-center justify-center gap-x-2 text-center  text-main07 bg-white rounded-full transition-all hover:drop-shadow-[0_10px_10px_rgba(0,0,0,0.25)] hover:text-indigo-600"
                  onClick={() => {
                    setIsDiving(!isDiving);
                  }}
                >
                  <Upload className="h-4 w-4 sm:h-6 sm:w-6" />
                  Register
                </Button>
                <Button
                  className="flex font-normal max-w-[180px] sm:max-w-[250px] py-6 text-md sm:h-[55px] sm:text-xl sm:px-12  drop-shadow-subtle text-primary items-center justify-center gap-x-2 m-0 text-center bg-main10 rounded-full hover:bg-main07 transition-all hover:drop-shadow-[0_10px_10px_rgba(0,0,0,0.25)]"
                  onClick={() => {
                    navigate("/login");
                  }}
                >
                  Dive right in
                </Button>
              </div>
            )}
          </div>
          <div
            id="showcase"
            className="hidden sm:flex bg-white w-full items-center justify-center gap-x-[150px] h-[600px]"
          >
            <div className="hidden overflow-hidden xl:flex items-center justify-center h-[280px] w-[600px] rounded-lg bg-zinc-700 drop-shadow-xl">
              <img
                src="/illustrations/createServer.gif"
                className="rounded-lg"
                alt=""
              />
            </div>
            <div className="hidden sm:block">
              <p className="min-w-[200px] w-[400px] text-black font-extrabold leading-tight text-4xl">
                Create Servers & host community
              </p>
              <p className="pt-6 font-normal text-black text-lg">
                Servers are like virtual communities built around <br />
                shared interests. Imagine them as organized clubs or <br />
                groups, each dedicated to a specific topic, or a hobby.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
