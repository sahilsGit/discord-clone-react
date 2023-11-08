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
import { useNavigate, useLocation } from "react-router-dom";
import { post } from "@/services/apiService";
import { handleResponse, handleError } from "@/services/responseHandler";
import useAuth from "@/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const dispatch = useAuth("dispatch");
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSubmit = async (data) => {
    dispatch({ type: "LOGIN_START" });

    const headers = {
      "Content-Type": "application/json",
      Origin: "http://localhost:5173",
    };

    const toBeSent = {
      email: data.email,
      password: data.password,
    };
    try {
      const response = await post(
        "/auth/login",
        JSON.stringify(toBeSent),
        headers,
        {
          credentials: "include",
        }
      );

      const data = await handleResponse(response, dispatch);

      console.log(data);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          access_token: data.access_token,
          user: data.username, // Set the authenticated user
          loading: false, // Set loading to false
          error: null, // Clear any previous errors
        },
      });

      navigate(from);
    } catch (err) {
      handleError(err);
      dispatch({ type: "LOGIN_FAILURE", payload: "An error occurred." });
      navigate("/login");
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