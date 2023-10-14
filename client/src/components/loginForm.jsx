"use client";
import React, { useContext } from "react";

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
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/authContext";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const LoginForm = () => {
  const navigate = useNavigate();
  const { user, loading, error, dispatch } = useContext(AuthContext);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data) {
    dispatch({
      type: "LOGIN_START",
    });

    try {
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("Origin", "http://localhost:5173");

      const toBeSent = {
        email: data.email,
        password: data.password,
      };

      const options = {
        method: "POST",
        headers,
        body: JSON.stringify(toBeSent),
        credentials: "include",
      };

      // Send request
      fetch("http://localhost:4000/api/auth/login", options)
        .then((response) => {
          if (response.ok) {
            alert("You are logged in!");
            dispatch({ type: "LOGIN_SUCCESS", payload: data.email });
            navigate("/user");
          }
        })
        .catch((err) => {
          dispatch({ type: "LOGIN_FAILURE", payload: err });
          navigate("/login");
        });
    } catch (err) {
      // Handle any other errors here
      console.error(err);
      dispatch({ type: "LOGIN_FAILURE", payload: "An error occurred." });
    }
  }

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
