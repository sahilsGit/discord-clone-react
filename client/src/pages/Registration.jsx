import React, { useState } from "react";
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
  FormMessage,
} from "@/components/ui/form";

import { useForm } from "react-hook-form";
import { registerSchema } from "@/services/auth-validator";
import { post } from "@/services/api-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RegistrationForm = () => {
  const form = useForm({
    resolver: zodResolver(registerSchema), //Resolving registerSchema created before
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: "",
    },
  });

  function onSubmit(data) {
    const body = {
      username: data.username,
      email: data.email,
      name: data.name,
      password: data.password,
    };

    // Send request
    post("/auth/register", JSON.stringify(body));
  }

  return (
    <div>
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
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
                name="name"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    {fieldState.isDirty && (
                      <FormDescription>
                        Others see you with this. You can use emojis and special
                        characters.
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field, fieldState }) => (
                  <FormItem>
                    {console.log(fieldState)}
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Create a username" {...field} />
                    </FormControl>
                    {fieldState.isDirty && (
                      <FormDescription>
                        Only use numbers, letters, underscores or periods.
                      </FormDescription>
                    )}
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

export default RegistrationForm;
