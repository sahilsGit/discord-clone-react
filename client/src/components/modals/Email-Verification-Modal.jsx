import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Clock10 } from "lucide-react";
import { Separator } from "../ui/separator";
import { useModal } from "@/hooks/useModals";
import { update } from "@/services/api-service";
import useAuth from "@/hooks/useAuth";
import { handleError, handleResponse } from "@/lib/response-handler";
import { useNavigate } from "react-router-dom";
import useServer from "@/hooks/useServer";

const EmailVerificationModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "emailVerification";
  const [resendCodeTimeout, setResendCodeTimeout] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [code, setCode] = useState(null);
  const access_token = useAuth("token");
  const authDispatch = useAuth("dispatch");
  const navigate = useNavigate();
  const profileId = useAuth("id");
  const servers = useServer("servers");

  const submitCode = async () => {
    try {
      const response = await update(
        `/profiles/verifyCode`,
        {
          code: code,
        },
        access_token
      );

      await handleResponse(response, authDispatch);
      servers !== "null" ||
        (servers !== "undefined" && window.location.reload());
    } catch (error) {
      handleError(error);
    }
    onClose();
  };

  const handleResendCode = async () => {
    (async () => {
      try {
        await update(
          `/profiles/verify/${profileId}`,
          {
            content: null,
          },
          access_token
        );
      } catch (error) {
        handleError(error, authDispatch);
      }
    })();

    setResendCodeTimeout(
      setTimeout(() => {
        setResendCodeTimeout(null);
        setTimeRemaining(null);
      }, 60000)
    ); // Set timeout for 1 minute

    setTimeRemaining(60); // Set initial time remaining
  };

  useEffect(() => {
    if (resendCodeTimeout) {
      const intervalId = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [resendCodeTimeout]);

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="w-[500px]">
        <DialogHeader className={"flex"}>
          <DialogTitle>Verify Email</DialogTitle>
          <DialogDescription>
            Enter the code we sent to your email, or skip verification for now
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="flex pt-0 flex-col py-2">
            <Input
              id="name"
              className="h-[40px] mb-3"
              placeholder="Enter the verification code here"
              onChange={(e) => {
                setCode(e.target.value);
              }}
            />
            <Button
              variant="primary"
              type="button"
              disabled={!code}
              className="flex-1 mb-2"
              onClick={submitCode}
            >
              Submit Code
            </Button>
            <div className="flex text-sm items-center gap-x-2">
              <Button
                variant="link"
                className={`underline-offset-3 text-sm font-normal h-[22px] text-blue-500 p-0 max-w-[90px] box-content ${
                  resendCodeTimeout ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={resendCodeTimeout ? null : handleResendCode}
              >
                Resend code
              </Button>
              {resendCodeTimeout && (
                <div className="flex items-center justify-center">
                  <Clock10 className="animate-pulse w-4 h-4" />
                  <p className="text-sm text-gray-500 ml-1">
                    {timeRemaining} seconds
                  </p>
                </div>
              )}
            </div>
          </div>
          {servers === null && (
            <div className="flex w-full items-center">
              <Separator className="shrink"></Separator>
              <p className="px-4">or</p>
              <Separator className="shrink"></Separator>
            </div>
          )}
        </div>
        {servers === null && (
          <Button
            className=""
            onClick={() => {
              navigate("/");
            }}
          >
            Skip
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmailVerificationModal;
