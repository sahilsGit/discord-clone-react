import { z } from "zod";

const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,100}$/;
function isPasswordValid(value) {
  return passwordRegex.test(value);
}

const registerSchema = z.object({
  username: z.string().min(3, "Must contain at least 3 characters").max(255),
  name: z.string().min(3, "Must contain at least 3 characters").max(255),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z
    .string()
    .min(8, "Must contain at least 8 characters")
    .max(100)
    .refine(isPasswordValid, {
      message: "Password doesn't match the requirements",
    }),
});

export { isPasswordValid, registerSchema };
