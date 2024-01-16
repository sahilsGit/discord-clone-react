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
import { handleResponse } from "@/lib/response-handler";
import useAuth from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(1, "Password can't be empty"),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const authDispatch = useAuth("dispatch");
  const location = useLocation();

  const from = location.state ? location.state.from : "/@me/conversations";

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
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
    } catch (err) {
      setHasError;
      // handleError(err, authDispatch);
    }
  };
  return (
    <div className="flex w-screen h-screen items-center justify-center">
      <Card className="items-center px-2 h-[450px] bg-main09 flex">
        <div className="flex flex-col w-[500px]">
          <CardHeader className="pb-4">
            <CardTitle className="text-center">Welcome back!</CardTitle>
            <CardDescription className="text-center">
              We're so excited to see you again!
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-y-5">
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
                              "h-[45px]",
                              fieldState.error && "placeholder:text-red-400"
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
                        <FormLabel className="uppercase text-sm text-zinc-400">
                          Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              fieldState.error
                                ? fieldState.error.message
                                : "Enter your Password"
                            }
                            {...field}
                            type="password"
                            className={cn(
                              "h-[45px]",
                              fieldState.error && "placeholder:text-red-400"
                            )}
                          />
                        </FormControl>
                        {/* <FormMessage /> */}
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col gap-y-3 mt-[2px]">
                  <a
                    href="/login"
                    className="text-blue-500 hover:underline text-sm transition-all m-1"
                  >
                    Forgot your password?
                  </a>
                  <Button type="submit" variant="primary">
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
        <div className="flex flex-col items-center justify-center h-auto p-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-center">Just checking out?</CardTitle>
            <CardDescription className="text-center">
              Have a quick taste of the Discord-like experience
            </CardDescription>
          </CardHeader>
          <Button className="h-[45px] text-md w-full" variant="primary">
            Browse as guest
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
