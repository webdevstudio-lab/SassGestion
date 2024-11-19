import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(6, { message: 'Le mot de passe doit avoir au moins 6 caractères' })
  .max(255);
const newPasswordSchema = z
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

export const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    newpassword: newPasswordSchema,
    newconfirmpassword: passwordSchema,
  })
  .refine((data) => data.newpassword === data.newconfirmpassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmpassword'],
  });
