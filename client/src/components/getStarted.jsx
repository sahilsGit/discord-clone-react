// DisplayNameInput.js
import React, { useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const GetStarted = ({ onDisplayNameSubmit }) => {
  const [displayName, setDisplayName] = useState("");
  const [isValidUsername, setIsValidUsername] = useState(false);
  const [fieldError, setFieldError] = useState(false);
  const usernameSchema = z.string().min(1);

  const validateUsername = (value) => {
    try {
      usernameSchema.parse(value);
      setIsValidUsername(true);
    } catch (error) {
      setIsValidUsername(false);
    }
  };

  const handleNext = () => {
    if (!isValidUsername) {
      setFieldError(true);
      return;
    }
    displayName && onDisplayNameSubmit(displayName);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      handleNext();
    }
  };

  return (
    <div className="flex text-sm sm:text-md sm:w-[400px] h-[55px] sm:items-center sm:justify-center drop-shadow-subtle animate-open">
      {fieldError && !isValidUsername && (
        <div className="rounded-sm absolute text-center text-black top-[-83px] sm:top-[-65px] bg-white ">
          <p className="py-3 text-sm text-red-500 px-6">
            We need a name, we can't just call you "nobody"
          </p>
          <div className="absolute w-0 h-0 left-1/2 transform bottom-[-10px] -translate-x-1/2 border-l-[10px] border-l-transparent border-t-[15px] border-t-white border-r-[10px] border-r-transparent"></div>
        </div>
      )}

      <Input
        autoFocus
        className="pl-[35px] text-main10 text-md h-full pr-[8px] bg-white border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-l-sm rounded-r-none rounded-l-full rounded-r-none"
        placeholder="Enter a Display Name"
        onChange={(e) => {
          setDisplayName(e.target.value);
          validateUsername(e.target.value);
        }}
        onKeyDown={onKeyDown}
      />
      <div className="group w-[100px] p-2 h-full flex p-1 bg-white rounded-r-full">
        <Button
          className="bg-indigo-500 text-white text-xs m-0 w-full h-full rounded-full hover:bg-indigo-500 hover:drop-shadow-[0_0_10px_rgba(0,0,0,0.15)] hover:bg-indigo-500/80 transition-all"
          onClick={handleNext}
        >
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
};

export default GetStarted;
