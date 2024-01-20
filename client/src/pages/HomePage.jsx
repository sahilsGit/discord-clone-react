// Imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAuth from "@/hooks/useAuth";
import { ArrowRight, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../App.css";

/*
 * Homepage
 *
 * This component serves as the landing page.
 * It checks the user's authentication status.
 * Redirects authenticated users to their profile page (/@me).
 * The unauthenticated ones can either login or register.
 */

const HomePage = () => {
  const navigate = useNavigate(); // For programmatic navigation
  const location = useLocation();
  const from = location.state?.from?.pathname || "/@me/conversations";
  const [justBrowsing, setJustBrowsing] = useState(false); // When users browse discord without registering
  const [displayName, setDisplayName] = useState("");

  // Fetch user and access token from custom auth hook
  const user = useAuth("user");
  const access_token = useAuth("token");

  // Navigate the authenticated user to their profile pages
  useEffect(() => {
    if (user && access_token) {
      navigate(from);
    }
  }, [user, access_token]);

  return (
    <div>
      {user && access_token ? null : (
        <div className="bg-main10">
          <div className="bg-rose-500 flex pt-7 justify-center items-center px-6">
            <div className="flex w-full justify-between items-center bg-rose-500 max-w-[1300px]">
              <a href="/">
                <img
                  src="/logos/full_logo_white_RGB.svg"
                  alt=""
                  className="h-7"
                />
              </a>
              <Link
                to="/login"
                className="flex items-center bg-white justify-center gap-x-1 py-2 px-5 text-center text-l text-main10 rounded-full transition-all drop-shadow-subtle hover:drop-shadow-[0_12px_12px_rgba(0,0,0,0.25)] hover:text-indigo-500"
              >
                Login
              </Link>
            </div>
          </div>
          <div className="flex gap-y-10 flex-col bg-rose-500 justify-center items-center px-6 py-[110px] ">
            <h1 className="max-w-[1000px] leading-none text-center text-xl8 border-box font-peace">
              Welcome to Discord but not in a literal sense...
            </h1>
            <p className="text-xl max-w-[770px] text-center">
              Just an individual trying best of their skills to emulate the fun
              Discord experience. This is not a one-on-one clone though, you
              will only find the standard stuff. This was made just as a fun
              challenge, I hope Discord won't be mad if they ever find out.
            </p>

            {!justBrowsing ? (
              <div className="flex gap-x-10 justify-center p-0 items-center">
                <Button
                  className="flex font-normal h-[55px] px-10 items-center justify-center gap-x-2 px-10 text-center text-xl text-main07 bg-white rounded-full transition-all hover:drop-shadow-[0_10px_10px_rgba(0,0,0,0.25)] hover:text-indigo-500"
                  onClick={() => {
                    setJustBrowsing(!justBrowsing);
                  }}
                >
                  <Upload />
                  Register
                </Button>
                <Button
                  className="flex font-normal drop-shadow-subtle  text-primary items-center justify-center h-[55px] gap-x-2 m-0 px-10 text-center text-xl bg-main10 rounded-full hover:bg-main07 transition-all hover:drop-shadow-[0_10px_10px_rgba(0,0,0,0.25)]"
                  onClick={() => {
                    navigate("/login");
                  }}
                >
                  Dive right in
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-y-5 items-center justify-center">
                <div className="flex w-[400px] h-[55px] items-center justify-center drop-shadow-subtle animate-open">
                  <Input
                    autoFocus
                    className="pl-[35px] text-main10 text-md h-full pr-[8px] bg-white border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-l-sm rounded-r-none rounded-l-full rounded-r-none"
                    placeholder="Enter a Display Name"
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                    }}
                  />
                  <div className="group w-[100px] p-2 h-full flex p-1 bg-white rounded-r-full">
                    <Button
                      className="bg-indigo-500 text-white text-xs m-0 w-full h-full rounded-full hover:bg-indigo-500 hover:drop-shadow-[0_0_10px_rgba(0,0,0,0.15)] hover:bg-indigo-500/80 transition-all"
                      onClick={() => {
                        displayName &&
                          navigate("/register", { state: { displayName } });
                      }}
                    >
                      <ArrowRight />
                    </Button>
                  </div>
                </div>
                <p className="text-sm">
                  By registering, you agree to our non-existent terms of
                  service.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
