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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { registerSchema } from "@/services/auth-validator";
import { post } from "@/services/api-service";

const DaysDropdown = () => {
  const days = [];

  for (let i = 1; i <= 31; i++) {
    days.push(i);
  }

  return (
    <>
      {days.map((day) => (
        <SelectItem key={day} value={`${day}`}>
          {day}
        </SelectItem>
      ))}
    </>
  );
};

const YearDropdown = () => {
  const currentYear = new Date().getFullYear();
  const startYear = 1900;
  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i
  );

  return (
    <>
      {years.map((year) => (
        <SelectItem key={year} value={`${year}`}>
          {year}
        </SelectItem>
      ))}
    </>
  );
};

const RegistrationForm = () => {
  const form = useForm({
    resolver: zodResolver(registerSchema), //Resolving registerSchema created before
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: "",
      dobMonth: "",
      dobDay: "",
      dobYear: "",
    },
  });

  const [dobError, setDobError] = useState("");

  function onSubmit(data) {
    const validateDob = () => {
      const year = Number(data.dobYear);
      const month = Number(data.dobMonth);
      const day = Number(data.dobDay);

      if (
        isNaN(year) ||
        isNaN(month) ||
        isNaN(day) ||
        year < 1900 || // Adjust the minimum year as needed
        year > new Date().getFullYear() || // Current year or a reasonable limit
        month < 1 ||
        month > 12 ||
        day < 1
      ) {
        setDobError("Invalid date!");
        return false; // Invalid input
      }

      // Calculate the last day of the month
      const lastDayOfMonth = new Date(year, month, 0).getDate();

      // Check if the day is within the valid range for the given month
      if (day > lastDayOfMonth) {
        setDobError("Invalid date!");
        return false; // Invalid day for the month
      }

      // Check for leap year (February 29)
      if (month === 2 && day === 29) {
        // Leap year occurs every 4 years, except for years divisible by 100 but not by 400
        if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
          return true; // Valid leap year
        } else {
          setDobError("Invalid date!");
          return false; // Invalid leap year
        }
      }

      return true; // Valid date of birth
    };

    if (!validateDob()) {
      return;
    } else {
      const body = {
        username: data.username,
        email: data.email,
        name: data.name,
        password: data.password,
      };

      // Send request
      post("/auth/register", JSON.stringify(body));
    }
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
              <div className="flex justify-between">
                <FormField
                  control={form.control}
                  name="dobMonth"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent className="h-[180px]">
                          <SelectItem value="1">January</SelectItem>
                          <SelectItem value="2">February</SelectItem>
                          <SelectItem value="3">March</SelectItem>
                          <SelectItem value="4">April</SelectItem>
                          <SelectItem value="5">May</SelectItem>
                          <SelectItem value="6">June</SelectItem>
                          <SelectItem value="7">July</SelectItem>
                          <SelectItem value="8">August</SelectItem>
                          <SelectItem value="9">September</SelectItem>
                          <SelectItem value="10">October</SelectItem>
                          <SelectItem value="11">November</SelectItem>
                          <SelectItem value="12">December</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dobDay"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent className="h-[180px]">
                          <DaysDropdown />
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dobYear"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="h-[180px]">
                          <YearDropdown />
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              <FormMessage>{dobError}</FormMessage>
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationForm;
