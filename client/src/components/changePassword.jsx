import React, { useState } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { z } from "zod";
import { isPasswordValid } from "@/services/auth-validator";
import { Form, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { cn } from "@/lib/utils";
import { handleResponse } from "@/lib/response-handler";
import ErrorComponent from "@/lib/error-Component";
import { update } from "@/services/api-service";

const setNewPasswordSchema = z.object({
  old: z.string().min(1, "OTP or your old password can't be empty"),
  newPassword: z
    .string()
    .min(8, "Must contain at least 8 characters")
    .max(100)
    .refine(isPasswordValid, {
      message: "Password doesn't match the requirements",
    }),
  confirmPassword: z
    .string()
    .min(8, "Must contain at least 8 characters")
    .max(100)
    .refine({
      check: (value, { parent }) => value === parent.newPassword,
      message: "Passwords do not match",
    }),
});

const ChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState({ status: "", message: "" });

  // Error setter for standard error component
  const setError = ({ status, message }) => {
    setApiError({ status: status, message: message });
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
      const response = await update("/auth/resetPassword", data, null);
      await handleResponse(response, null);
    } catch (error) {
      // Ingulf error
      setApiError({
        status: 401,
        message: "Something went wrong, try again later.",
      });
    }
  };

  return (
    <DialogContent className="w-[500px] py-6">
      <DialogHeader>
        <DialogTitle>Create a new password</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmitPassword)}>
          <FormField
            control={form.control}
            name="old"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="uppercase text-sm  text-zinc-400">
                  OTP
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      fieldState.error
                        ? fieldState.error.message
                        : "Enter the 6 digits OTP"
                    }
                    className={cn(
                      "h-[45px] bg-zinc-900",
                      fieldState.error &&
                        "placeholder:text-red-400 focus-visible:ring-red-400 border-red-500 focus-visible:border-none"
                    )}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="uppercase text-sm  text-zinc-400">
                  New Password
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      fieldState.error
                        ? fieldState.error.message
                        : "Enter new password"
                    }
                    className={cn(
                      "h-[45px] bg-zinc-900",
                      fieldState.error &&
                        "placeholder:text-red-400 focus-visible:ring-red-400 border-red-500 focus-visible:border-none"
                    )}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder={
                      fieldState.error
                        ? fieldState.error.message
                        : "Confirm new password"
                    }
                    className={cn(
                      "h-[45px] bg-zinc-900",
                      fieldState.error &&
                        "placeholder:text-red-400 focus-visible:ring-red-400 border-red-500 focus-visible:border-none"
                    )}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button className="mt-3" type="submit" variant="primary">
            Submit
          </Button>
        </form>
      </Form>
      <ErrorComponent error={apiError} setError={setError} />
    </DialogContent>
  );
};

export default ChangePassword;
