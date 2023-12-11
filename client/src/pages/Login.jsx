import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation, useNavigate } from "react-router-dom";
import { post } from "@/services/api-service";
import { handleResponse, handleError } from "@/lib/response-handler";
import useAuth from "@/hooks/useAuth";
import useServer from "@/hooks/useServer";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const LoginForm = () => {
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
      handleError(err, authDispatch);
    }
  };
  return (
    <div>
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your password"
                        {...field}
                        type="password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
