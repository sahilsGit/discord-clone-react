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
import { post } from "@/services/api-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { handleError } from "@/lib/response-handler";
import { useState } from "react";

const RegistrationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const displayName = location.state && location.state?.displayName;
  const [focused, setFocused] = useState([null, false]);

  const handleFocus = (item) => {
    setFocused((prev) => [...prev, item]);
  };

  const form = useForm({
    resolver: zodResolver(registerSchema), //Resolving registerSchema created before
    defaultValues: {
      username: "",
      name: displayName || "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data) {
    const body = {
      username: data.username,
      email: data.email,
      name: data.name,
      password: data.password,
    };

    try {
      const status = await post("/auth/register", JSON.stringify(body));
    } catch (err) {
      const errorCode = await handleError(err);
    } finally {
      navigate("/");
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
                          "h-[45px]",
                          fieldState.error && "placeholder:text-red-400"
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
                          handleFocus(1);
                        }}
                        className={cn(
                          "h-[45px]",
                          fieldState.error && "placeholder:text-red-400"
                        )}
                      />
                    </FormControl>
                    <FormDescription
                      className={cn(
                        "hidden transition-all",
                        focused.includes(1) && "block animate-open-ver"
                      )}
                    >
                      Others see you with this. You can use emojis and special
                      characters.
                    </FormDescription>

                    {/* <FormMessage /> */}
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
                          handleFocus(2);
                        }}
                        className={cn(
                          "h-[45px]",
                          fieldState.error && "placeholder:text-red-400"
                        )}
                      />
                    </FormControl>
                    <FormDescription
                      className={cn(
                        "hidden transition-all",
                        focused.includes(2) && "block animate-open-ver"
                      )}
                    >
                      Only use numbers, letters, underscores or periods.
                    </FormDescription>

                    {/* <FormMessage /> */}
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
                      <Input
                        placeholder={
                          fieldState.error
                            ? fieldState.error.message
                            : "Create a password"
                        }
                        {...field}
                        type="password"
                        className={cn(
                          "h-[45px]",
                          fieldState.error && "placeholder:text-red-400"
                        )}
                        onFocus={() => {
                          handleFocus(3);
                        }}
                      />
                    </FormControl>
                    <FormDescription
                      className={cn(
                        "hidden transition-all",
                        focused.includes(3) && "block animate-open-ver"
                      )}
                    >
                      Use at least 8 characters, mix cases, numbers and special
                      characters.
                    </FormDescription>
                    {/* <FormMessage /> */}
                  </FormItem>
                )}
              />
              <div className="pt-2">
                <Button
                  type="submit"
                  onSubmit={() => {
                    onSubmit();
                  }}
                  variant="primary"
                  className="w-full"
                >
                  Continue
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
    </div>
  );
};

export default RegistrationPage;
