import React, { useState } from "react";
import { z } from "zod";
import { post } from "@/services/api-service";
import { handleError, handleResponse } from "@/lib/response-handler";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import ErrorComponent from "@/lib/error-Component";

const emailSchema = z.string().email();

const ResetPassword = ({ authDispatch }) => {
  const [passwordField, setPasswordField] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [fieldError, setFieldError] = useState(false);
  const [apiError, setApiError] = useState({ status: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [apiSuccess, setApiSuccess] = useState(false);

  const validateEmail = (value) => {
    try {
      emailSchema.parse(value);
      setIsValidEmail(true);
    } catch (error) {
      setIsValidEmail(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.target.value && e.key === "Enter") {
      handleSubmit();
    }
  };

  // Error setter for standard error component
  const setError = ({ status, message }) => {
    setApiError({ status: status, message: message });
  };

  const handleSubmit = async () => {
    if (!isValidEmail) {
      setFieldError(true);
      return;
    }

    setLoading(true);
    try {
      const response = await post(
        `/profiles/forgotPassword`,
        JSON.stringify({
          email: passwordField,
        }),
        null
      );

      await handleResponse(response, authDispatch);
      setApiSuccess(true);
    } catch (error) {
      const { status, message } = handleError(error, authDispatch);
      setApiError({ status: status, message: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="text-start">
        <Button
          variant="link"
          type="button"
          className="underline-offset-2 text-sm font-normal h-[22px] text-blue-500 justify-start p-0 max-w-[180px] box-content hover:underline text-sm transition-all m-1"
        >
          Forgot your password?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[500px] py-6 bg-zinc-700 pb-0 pl-0 pr-0">
        <DialogHeader className="pl-6 pr-6 rounded-sm">
          <DialogTitle className="mb-1">Reset Password</DialogTitle>
          <DialogDescription>
            Enter your registered email, we will send an OTP for you to reset
            your password.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col pl-6 pr-6 ">
          <Input
            placeholder={
              fieldError ? "Enter a valid email" : "Enter your email"
            }
            className={cn(
              "h-[45px] mb-2 bg-zinc-900/80",
              fieldError &&
                !isValidEmail &&
                "placeholder:text-red-400 focus-visible:ring-red-400 border-red-500 focus-visible:border-none"
            )}
            onChange={(e) => {
              setPasswordField(e.target.value);
              validateEmail(e.target.value);
            }}
            onKeyDown={onKeyDown}
          ></Input>
        </div>
        <DialogFooter className="bg-zinc-800/40 px-6 py-4">
          <Button
            className="flex min-w-[100px]"
            type="button"
            variant="primary"
            onClick={handleSubmit}
          >
            {loading && (
              <Loader2
                className="m-0 animate-spin h-5 w-5 mr-1.5"
                strokeWidth={3}
              />
            )}
            <p>Submit</p>
          </Button>
        </DialogFooter>
      </DialogContent>
      {apiError?.message && (
        <ErrorComponent
          error={apiError}
          setError={setError}
          errorHeading={"Reset Password"}
        />
      )}
      <Dialog open={apiSuccess} onOpenChange={() => setApiSuccess(false)}>
        <DialogContent className="w-[500px] py-6">
          <DialogHeader>
            <DialogTitle>Create a new password</DialogTitle>
            <DialogDescription>{apiError?.message}</DialogDescription>
          </DialogHeader>
          <Input placeholder="Old password / OTP"></Input>
          <Input placeholder="new password"></Input>
          <Input placeholder="confirm password"></Input>
          <Button className="mt-3" type="button" variant="primary">
            Submit
          </Button>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default ResetPassword;
