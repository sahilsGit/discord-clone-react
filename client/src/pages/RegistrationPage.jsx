import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { registerSchema } from "@/services/auth-validator";
import { post, update } from "@/services/api-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { handleError, handleResponse } from "@/lib/response-handler";
import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Clock10, Eye, EyeOff } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import ErrorComponent from "@/lib/error-Component";
import { forApiErrorInitial, forApiSuccessInitial } from "@/lib/misc";
import SuccessComponent from "@/lib/success-Component";

const RegistrationPage = () => {
  /*
   * RegistrationPage
   *
   *
   * Handles user registration process
   * Also handles user verification process
   *
   *
   * TODO: Modularize, remove verification logic out of here
   *
   */

  const location = useLocation();
  const navigate = useNavigate();
  const displayName = location.state && location.state?.displayName;
  const [showDialog, setShowDialog] = useState(false);
  const [resendCodeTimeout, setResendCodeTimeout] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [code, setCode] = useState(null);
  const access_token = useAuth("token");
  const authDispatch = useAuth("dispatch");
  const [fieldType, setFieldType] = useState("password");
  const [forApiError, setForApiError] = useState(forApiErrorInitial);
  const [forApiSuccess, setForApiSuccess] = useState(forApiSuccessInitial);

  // To track which fields have been visited
  const [focused, setFocused] = useState({
    name: false,
    username: false,
    password: false,
  });

  // To mark fields as visited
  const handleFocus = (field) => {
    !focused[field] &&
      setFocused((prevFocused) => ({ ...prevFocused, [field]: true }));
  };

  // Error resetter for custom error component to conditionally render error message
  const resetError = useCallback(() => {
    setForApiError(forApiErrorInitial);
  }, []);

  // Success resetter for standard success component to conditionally render success message
  const resetSuccess = useCallback(() => {
    setForApiSuccess(forApiSuccessInitial);
  }, []);

  // React-hook for with zod Validation
  const form = useForm({
    resolver: zodResolver(registerSchema), // Resolver
    defaultValues: {
      username: "",
      name: displayName || "",
      email: "",
      password: "",
    },
  });

  const handleResendCode = async () => {
    // Handles resendCode request logic

    setResendCodeTimeout(
      setTimeout(() => {
        setResendCodeTimeout(null);
        setTimeRemaining(null);
      }, 60000)
    ); // Set timeout for 1 minute

    setTimeRemaining(60); // Set initial time remaining
  };

  // Submits verification code
  const submitCode = async () => {
    try {
      const response = await update(
        `/profiles/verifyCode`,
        {
          code: code,
        },
        access_token
      );

      const data = await handleResponse(response, authDispatch);

      // Show Success message & Navigate the user to homepage after acknowledgement
      setForApiSuccess({
        ...forApiSuccess,
        message: data.message,
        action: "toHomepage",
      });
    } catch (error) {
      const { status, message } = handleError(error);

      // Show error and take actions based on status code
      setForApiError({
        ...forApiError,
        message: message,
        action: status === 489 ? "" : "toHomepage",
      });
    }
  };

  // For reset Password timeout
  useEffect(() => {
    if (resendCodeTimeout) {
      const intervalId = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [resendCodeTimeout]);

  // Submits registration form
  async function onSubmit(data) {
    const body = {
      username: data.username,
      email: data.email,
      name: data.name,
      password: data.password,
    };

    try {
      const response = await post("/auth/register", JSON.stringify(body));
      await handleResponse(response, authDispatch);

      // Open user verification Dialog box
      setShowDialog(true);
    } catch (error) {
      const { status, message } = handleError(error);

      // Show error and take actions based on status code
      setForApiError({
        ...forApiError,
        message: message,
        action: status === 409 ? "toLoginPage" : "",
      });
    }
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <Card className="w-[500px] flex flex-col pt-4 bg-main09 h-full">
        <CardHeader>
          <CardTitle className="text-center">Create an account</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col space-y-5"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-zinc-400">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          fieldState.error
                            ? fieldState.error.message
                            : "Enter your Email"
                        }
                        {...field}
                        className={cn(
                          "h-[45px] dark:bg-zinc-900",
                          fieldState.error &&
                            "placeholder:text-red-400 focus-visible:ring-red-400 border-red-500 focus-visible:border-none"
                        )}
                      />
                    </FormControl>
                    {/* <FormMessage /> */}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormItem className={cn("", displayName && "hidden")}>
                    <FormLabel className="uppercase text-zinc-400">
                      Display Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          fieldState.error
                            ? fieldState.error.message
                            : "Enter your Name"
                        }
                        {...field}
                        onFocus={() => {
                          handleFocus("name");
                        }}
                        className={cn(
                          "h-[45px] dark:bg-zinc-900",
                          fieldState.error &&
                            "placeholder:text-red-400 focus-visible:ring-red-400 border-red-500 focus-visible:border-none"
                        )}
                      />
                    </FormControl>
                    <FormDescription
                      className={cn(
                        "hidden transition-all",
                        focused.name && "block animate-open-ver"
                      )}
                    >
                      Others see you with this. You can use emojis and special
                      characters.
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-zinc-400">
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          fieldState.error
                            ? fieldState.error.message
                            : "Create a username"
                        }
                        {...field}
                        onFocus={() => {
                          handleFocus("username");
                        }}
                        className={cn(
                          "h-[45px] dark:bg-zinc-900",
                          fieldState.error &&
                            "placeholder:text-red-400 focus-visible:ring-red-400 border-red-500 focus-visible:border-none"
                        )}
                      />
                    </FormControl>
                    <FormDescription
                      className={cn(
                        "hidden transition-all",
                        focused.username && "block animate-open-ver"
                      )}
                    >
                      Only use numbers, letters, underscores or periods.
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-zinc-400">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder={
                            fieldState.error
                              ? fieldState.error.message
                              : "Create a password"
                          }
                          {...field}
                          type={fieldType}
                          className={cn(
                            "h-[45px] dark:bg-zinc-900",
                            fieldState.error &&
                              "placeholder:text-red-400 focus-visible:ring-red-400 border-red-500 focus-visible:border-none"
                          )}
                          onFocus={() => {
                            handleFocus("password");
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            fieldType === "password"
                              ? setFieldType("text")
                              : setFieldType("password");
                          }}
                          className="absolute right-4 top-3 dark:text-zinc-500 dark:hover:text-zinc-200 transition"
                        >
                          {fieldType === "text" ? <Eye /> : <EyeOff />}
                        </button>
                      </div>
                    </FormControl>
                    <FormDescription
                      className={cn(
                        "hidden transition-all",
                        focused.password && "block animate-open-ver"
                      )}
                    >
                      Use at least 8 characters, mix cases, numbers and special
                      characters.
                    </FormDescription>
                  </FormItem>
                )}
              />
              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Verify Email</DialogTitle>
                    <DialogDescription>
                      Enter the code we sent to your email, or skip verification
                      for now
                    </DialogDescription>
                  </DialogHeader>
                  <div>
                    <div className="flex flex-col gap-y-4 py-2">
                      <Input
                        id="name"
                        className="h-[40px]"
                        placeholder="Enter the verification code here"
                        onChange={(e) => {
                          setCode(e.target.value);
                        }}
                      />
                      <Button
                        variant="primary"
                        type="button"
                        disabled={!code}
                        className="flex-1"
                        onClick={submitCode}
                      >
                        Submit Code
                      </Button>
                      <div className="flex text-sm items-center gap-x-2">
                        <a
                          className={`text-blue-500 underline text-sm transition-all ${
                            resendCodeTimeout
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={resendCodeTimeout ? null : handleResendCode}
                        >
                          Resend code
                        </a>
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
                    <div className="flex w-full items-center">
                      <Separator className="shrink"></Separator>
                      <p className="px-4">or</p>
                      <Separator className="shrink"></Separator>
                    </div>
                  </div>
                  <Button
                    className=""
                    onClick={() => {
                      navigate("/");
                    }}
                  >
                    Skip
                  </Button>
                </DialogContent>
              </Dialog>
              <div className="pt-2">
                <Button
                  type="submit"
                  onSubmit={() => {
                    onSubmit();
                  }}
                  variant="primary"
                  className="w-full"
                >
                  Submit
                </Button>
              </div>
            </form>
            <div className="pt-2">
              <a
                href="/login"
                className="text-blue-500 hover:underline text-sm transition-all m-1"
              >
                Already have an account?
              </a>
            </div>
          </Form>
        </CardContent>
      </Card>
      <ErrorComponent apiError={forApiError} resetError={resetError} />
      <SuccessComponent
        apiSuccess={forApiSuccess}
        resetSuccess={resetSuccess}
      />
    </div>
  );
};

export default RegistrationPage;
