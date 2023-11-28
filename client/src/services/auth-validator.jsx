import { z } from "zod";

const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,100}$/;
function isPasswordValid(value) {
  return passwordRegex.test(value);
}

export const registerSchema = z.object({
  username: z.string().min(3).max(255),
  name: z.string().min(3).max(255),
  email: z.string().email(),
  password: z.string().min(8).max(100).refine(isPasswordValid, {
    message:
      "Please include at least one uppercase, one lowercase, one number, and one special character.",
  }),
  dobMonth: z.string().min(1).max(2),
  dobDay: z.string().min(1).max(2),
  dobYear: z.string().min(4).max(4),
});
