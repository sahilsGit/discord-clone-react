import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation, useNavigate } from "react-router-dom";
import { post } from "@/services/api-service";
import { handleError, handleResponse } from "@/lib/response-handler";
import useAuth from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import ResetPassword from "@/components/resetPassword";
import { useCallback, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import ErrorComponent from "@/lib/error-Component";
import { ActionTooltip } from "@/components/actionTooltip";
import { forApiErrorInitial } from "@/lib/misc";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(1, "Password can't be empty"),
});

const LoginPage = () => {
  const authDispatch = useAuth("dispatch");
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [fieldType, setFieldType] = useState("password");
  const [forApiError, setForApiError] = useState(forApiErrorInitial);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const resetError = useCallback(() => {
    setForApiError(forApiErrorInitial);
  }, []);

  const from = location.state ? location.state.from : "/@me/conversations";

  const onSubmit = async (data) => {
    setLoading(true);
    localStorage.clear();
    authDispatch({ type: "LOGIN_START" });

    const body = {
      email: data.email,
      password: data.password,
    };

    try {
      const response = await post("/auth/login", JSON.stringify(body));
      await handleResponse(response, authDispatch);

      navigate(from);
    } catch (error) {
      const { status, message } = handleError(error, authDispatch);
      // setApiError({ status: status, message: message });
      setForApiError({
        ...forApiError,
        message: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-screen h-screen items-center justify-center">
      <Card className="items-center md:px-2 h-[450px] bg-zinc-900/40 flex">
        <div className="flex flex-col w-[350px] md:w-[500px]">
          <CardHeader className="p-3 md:pb-4">
            <CardTitle className="m-0 text-center">Welcome back!</CardTitle>
            <CardDescription className="text-center">
              We're so excited to see you again!
            </CardDescription>
          </CardHeader>
          <CardContent className="md:px-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-y-3 md:gap-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-sm  text-zinc-400">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              fieldState.error
                                ? fieldState.error.message
                                : "Enter your Email"
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
                    name="password"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-sm text-zinc-400 ring-red-400">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder={
                                fieldState.error
                                  ? fieldState.error.message
                                  : "Enter your Password"
                              }
                              {...field}
                              type={fieldType}
                              className={cn(
                                "h-[45px] bg-zinc-900 pr-[55px]",
                                fieldState.error &&
                                  "placeholder:text-red-400 focus-visible:ring-red-400 border-red-500 focus-visible:border-none"
                              )}
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
                        {/* <FormMessage /> */}
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col gap-y-3 mt-[2px]">
                  <ResetPassword authDispatch={authDispatch} />
                  <Button type="submit" variant="primary">
                    {loading && (
                      <Loader2
                        className="m-0 animate-spin h-5 w-5 mr-1.5"
                        strokeWidth={3}
                      />
                    )}
                    Log in
                  </Button>
                </div>
              </form>
            </Form>
            <div className="pt-2 flex gap-x-2">
              <p className="text-sm text-zinc-500">Need an account?</p>
              <a
                href="/register"
                className="text-blue-500 hover:underline text-sm transition-all"
              >
                Register
              </a>
            </div>
          </CardContent>
        </div>
        <div className="hidden lg:flex flex-col items-center justify-center h-auto p-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-center">Just checking out?</CardTitle>
            <CardDescription className="text-center">
              Have a quick taste of the Discord-like experience
            </CardDescription>
          </CardHeader>
          <ActionTooltip label={"Under construction!"}>
            <Button
              className="h-[45px] text-md w-full"
              disabled
              variant="primary"
            >
              Browse as guest
            </Button>
          </ActionTooltip>
          <ErrorComponent apiError={forApiError} resetError={resetError} />
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
