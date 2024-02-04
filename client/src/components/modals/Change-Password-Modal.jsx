import React, { useState } from "react";
import { z } from "zod";
import { isPasswordValid } from "@/services/auth-validator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { handleError, handleResponse } from "@/lib/response-handler";
import ErrorComponent from "@/lib/error-Component";
import { update } from "@/services/api-service";
import useAuth from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useModal } from "@/hooks/useModals";
import { Button } from "../ui/button";
import SuccessComponent from "@/lib/success-Component";
import { Separator } from "../ui/separator";
import { Eye, EyeOff } from "lucide-react";

const ChangePasswordModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "changePassword";
  const access_token = useAuth("token");
  const authDispatch = useAuth("dispatch");

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState({ status: "", message: "" });
  const [apiSuccess, setApiSuccess] = useState({ status: "", message: "" });
  const [oldVisibility, setOldVisibility] = useState("password");
  const [newVisibility, setNewVisibility] = useState("password");

  const setNewPasswordSchema = z
    .object({
      old: z.string().min(1, "You did not have an empty password!"),
      newPassword: z
        .string()
        .min(8, "Must contain at least 8 characters")
        .max(100)
        .refine(isPasswordValid, {
          message: "Password doesn't match the requirements",
        }),
      confirmPassword: z.string().min(8, "Must contain at least 8 characters"),
    })
    .refine((data) => data.confirmPassword === data.newPassword, {
      message: "Passwords do not match",
    });

  // Error setter for standard error component
  const setError = ({ status, message }) => {
    setApiError({ status: status, message: message });
  };

  // Success setter for standard error component
  const setSuccess = ({ status, message }) => {
    setApiSuccess({ status: status, message: message });
    handleClose();
  };

  const handleClose = () => {
    form.reset();
    onClose();
    setOldVisibility("password");
    setNewVisibility("password");
  };

  const togglePasswordVisibility = (element, setElement) => {
    element === "password" ? setElement("text") : setElement("password");
  };

  const form = useForm({
    resolver: zodResolver(setNewPasswordSchema),
    defaultValues: {
      old: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleSubmitPassword = async (data) => {
    setLoading(true);

    try {
      const response = await update(
        "/profiles/changePassword",
        data,
        access_token
      );

      await handleResponse(response, null);
      setApiSuccess({
        status: 200,
        message: "Changed password Successfully!",
      });
    } catch (error) {
      const { status, message } = handleError(error, authDispatch);
      setApiError({
        status: status,
        message: message,
      });
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[500px] dark:bg-main08 py-6">
        <DialogHeader>
          <DialogTitle className="text-zinc-600 dark:text-zinc-400">
            Create a new password
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitPassword)}>
            <div className="flex flex-col gap-y-4">
              <FormField
                control={form.control}
                name="old"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="flex text-sm items-center text-zinc-400">
                      <p className="uppercase text-xs">Old password</p>
                      {fieldState.error && (
                        <Separator className="ml-1 h-[1px] bg-destructive w-[8px]" />
                      )}
                      <FormMessage className="text-xs ml-1 dark:text-red-700" />
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Enter your old password"
                          type={oldVisibility}
                          className={cn(
                            "h-[45px] dark:bg-zinc-900 bg-zinc-200",
                            fieldState.error &&
                              "focus-visible:ring-red-400 border-red-500 focus-visible:border-none"
                          )}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            togglePasswordVisibility(
                              oldVisibility,
                              setOldVisibility
                            );
                          }}
                          className="absolute right-4 top-3 dark:text-zinc-500 dark:hover:text-zinc-200 transition"
                        >
                          {oldVisibility === "text" ? <Eye /> : <EyeOff />}
                        </button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-y-2">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="flex text-sm items-center text-zinc-400">
                        <p className="uppercase text-xs">New Password</p>
                        {fieldState.error && (
                          <Separator className="ml-1 h-[1px] bg-destructive w-[8px]" />
                        )}
                        <FormMessage className="text-xs ml-1 dark:text-red-700" />
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Enter new password"
                            type={newVisibility}
                            className={cn(
                              "h-[45px] dark:bg-zinc-900 bg-zinc-200",
                              fieldState.error &&
                                "focus-visible:ring-red-400 border-red-500 focus-visible:border-none"
                            )}
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              togglePasswordVisibility(
                                newVisibility,
                                setNewVisibility
                              );
                            }}
                            className="absolute right-4 top-3 dark:text-zinc-500 dark:hover:text-zinc-200 transition"
                          >
                            {newVisibility === "text" ? <Eye /> : <EyeOff />}
                          </button>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="flex text-sm items-center text-zinc-400">
                        <p className="uppercase text-xs">Confirm Password</p>
                        {fieldState.error && (
                          <Separator className="ml-1 h-[1px] bg-destructive w-[8px]" />
                        )}
                        <FormMessage className="text-xs ml-1 dark:text-red-700" />
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Confirm new password"
                            type={newVisibility}
                            className={cn(
                              "h-[45px] dark:bg-zinc-900 bg-zinc-200",
                              fieldState.error &&
                                "focus-visible:ring-red-400 border-red-500 focus-visible:border-none"
                            )}
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              togglePasswordVisibility(
                                newVisibility,
                                setNewVisibility
                              );
                            }}
                            className="absolute right-4 top-3 dark:text-zinc-500 dark:hover:text-zinc-200 transition"
                          >
                            {newVisibility === "text" ? <Eye /> : <EyeOff />}
                          </button>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button
              className="mt-3 min-w-[100px]"
              type="submit"
              variant="primary"
            >
              Submit
            </Button>
          </form>
        </Form>
        <ErrorComponent error={apiError} setError={setError} />
        <SuccessComponent success={apiSuccess} setSuccess={setSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordModal;
