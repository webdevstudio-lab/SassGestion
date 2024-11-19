import { z } from 'zod';

const emailSchema = z.string().email().min(5).max(255);
const passwordSchema = z
  .string()
  .min(6, { message: 'Le mot de passe doit avoir au moins 6 caractères' })
  .max(255);
const registerPasswordSchema = z
  .string()
  .min(6, { message: 'Le mot de passe doit avoir au moins 6 caractères' })
  .max(255, {
    message: 'le mot de passe doit avoir au maximum 255 caractères',
  })
  .refine(
    (password) =>
      /(?=.*[A-Z])/.test(password) &&
      /(?=.*[a-z])/.test(password) &&
      /(?=.*[0-9])/.test(password),
    {
      message:
        'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule et un chiffre',
    },
  );
const userAgentSchema = z.string().min(6).max(255);

export const registerSchema = z
  .object({
    fullname: z
      .string()
      .min(5, { message: 'Le nom doit avoir au moins 5 caractères' })
      .max(255),
    email: emailSchema,
    password: registerPasswordSchema,
    confirmpassword: passwordSchema,
    userAgent: userAgentSchema,
  })
  .refine((data) => data.password === data.confirmpassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmpassword'],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  userAgent: userAgentSchema,
});
